import mysql from 'mysql2/promise';
import { databaseConfig } from '../src/config/database.js';

const MARKER_RE = /(?:Ãƒ|Ã‚|Ã˜|Ã™|Ã¢â‚¬|Ã¯Â¿Â½|ï¿½|�|\?{4,})/;
const sample = 'الفعاليات القادمة';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const connection = await mysql.createConnection(databaseConfig);
  try {
    await connection.query('CREATE TEMPORARY TABLE encoding_smoke_test (value VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL)');
    await connection.execute('INSERT INTO encoding_smoke_test (value) VALUES (?)', [sample]);
    const [rows] = await connection.execute('SELECT value, HEX(value) AS hex_value FROM encoding_smoke_test LIMIT 1');
    assert(rows[0].value === sample, 'Arabic DB write/read failed');
    assert(rows[0].hex_value.startsWith('D8'), 'Arabic bytes are not UTF-8-like');

    const [settingsRows] = await connection.execute('SELECT setting_value FROM project_settings WHERE setting_key = ?', ['site_content']);
    const settings = typeof settingsRows[0].setting_value === 'string' ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
    const checks = [
      settings?.menu?.[1]?.labelAr,
      settings?.homepage?.eventsInspireSection?.titleAr,
      settings?.contactPage?.hero?.titleAr,
    ];
    checks.forEach((value, index) => {
      assert(typeof value === 'string' && value.length > 0, `Missing Arabic setting sample ${index}`);
      assert(!MARKER_RE.test(value), `Corrupted Arabic setting sample ${index}`);
    });

    const [events] = await connection.execute('SELECT title_ar FROM events WHERE title_ar REGEXP ? LIMIT 1', ['[ء-ي]']);
    assert(events.length > 0, 'No Arabic event title found');
    assert(!MARKER_RE.test(events[0].title_ar), 'Corrupted Arabic event title found');

    console.log(JSON.stringify({ success: true, sample, hex: rows[0].hex_value }, null, 2));
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
