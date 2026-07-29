import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';
import { databaseConfig } from '../src/config/database.js';

const MARKER_RE = /(?:Ãƒ|Ã‚|Ã˜|Ã™|Ã¢â‚¬|Ã¯Â¿Â½|ï¿½|�)/;
const QUESTION_RUN_RE = /\?{4,}/;
const ARABIC_RE = /[\u0600-\u06ff]/;
const TEXT_TYPES = new Set(['char', 'varchar', 'tinytext', 'text', 'mediumtext', 'longtext', 'json']);
const MAX_PREVIEW = 90;

function preview(value) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (text.length <= MAX_PREVIEW) return text;
  return `${text.slice(0, MAX_PREVIEW)}...`;
}

function score(text) {
  const value = String(text ?? '');
  const arabic = (value.match(/[\u0600-\u06ff]/g) || []).length;
  const markers = (value.match(/Ãƒ|Ã‚|Ã˜|Ã™|Ã¢â‚¬|Ã¯Â¿Â½|ï¿½|�|\?{4,}/g) || []).length;
  return { arabic, markers };
}

function latin1DecodeOnce(value) {
  return Buffer.from(String(value), 'latin1').toString('utf8');
}

function suggestedRepair(value) {
  const original = String(value ?? '');
  let best = original;
  let bestScore = score(original);

  for (let i = 0; i < 3; i += 1) {
    const next = latin1DecodeOnce(best);
    const nextScore = score(next);
    if (next !== best && nextScore.arabic >= bestScore.arabic && nextScore.markers < bestScore.markers) {
      best = next;
      bestScore = nextScore;
      continue;
    }
    break;
  }

  return best === original ? null : best;
}

function isLikelyArabicField(table, column, jsonPath = '') {
  const name = `${table}.${column}.${jsonPath}`.toLowerCase();
  return name.includes('_ar') || name.includes('arabic') || name.endsWith('ar') || name.includes('labelar') || name.includes('titlear') || name.includes('descriptionar') || name.includes('textar');
}

function walkJson(value, visit, pathParts = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkJson(item, visit, [...pathParts, String(index)]));
    return;
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => walkJson(item, visit, [...pathParts, key]));
    return;
  }
  if (typeof value === 'string') visit(pathParts.join('.'), value);
}

async function main() {
  const outPath = process.argv.find((arg) => arg.startsWith('--out='))?.slice('--out='.length);
  const connection = await mysql.createConnection(databaseConfig);
  const [dbRows] = await connection.query('SELECT DATABASE() AS db');
  const dbName = dbRows[0].db;

  const [columns] = await connection.query(
    `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_KEY
       FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND DATA_TYPE IN (${[...TEXT_TYPES].map(() => '?').join(',')})
      ORDER BY TABLE_NAME, ORDINAL_POSITION`,
    [dbName, ...TEXT_TYPES],
  );

  const findings = [];
  const totals = new Map();

  for (const column of columns) {
    const table = column.TABLE_NAME;
    const field = column.COLUMN_NAME;
    const [rows] = await connection.query(`SELECT * FROM \`${table}\``);
    for (const row of rows) {
      const value = row[field];
      if (value == null || value === '') continue;
      const text = typeof value === 'string' ? value : JSON.stringify(value);
      const rowId = row.id ?? row.setting_key ?? row.slug ?? row.email ?? '(no-id)';

      const inspectValue = (jsonPath, itemValue) => {
        const hasMojibake = MARKER_RE.test(itemValue);
        const hasLostArabic = QUESTION_RUN_RE.test(itemValue) && isLikelyArabicField(table, field, jsonPath);
        if (!hasMojibake && !hasLostArabic) return;
        const key = `${table}.${field}${jsonPath ? `.${jsonPath}` : ''}`;
        totals.set(key, (totals.get(key) || 0) + 1);
        const repair = hasMojibake ? suggestedRepair(itemValue) : null;
        findings.push({
          table,
          id: String(rowId),
          column: field,
          jsonPath,
          issue: hasLostArabic ? 'question_mark_loss' : 'mojibake_marker',
          preview: preview(itemValue),
          suggestedPreview: repair ? preview(repair) : null,
        });
      };

      if (column.DATA_TYPE === 'json' || /^[\[{]/.test(text.trim())) {
        try {
          walkJson(typeof value === 'string' ? JSON.parse(value) : value, inspectValue);
        } catch {
          inspectValue('', text);
        }
      } else {
        inspectValue('', text);
      }
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    database: dbName,
    findingsCount: findings.length,
    totals: Object.fromEntries([...totals.entries()].sort()),
    findings,
  };

  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  }

  console.log(JSON.stringify(report, null, 2));
  await connection.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
