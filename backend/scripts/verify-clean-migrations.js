import fs from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';
import { databaseConfig } from '../src/config/database.js';

const tempDb = `directevents_rbac_tmp_${Date.now()}`;
const databaseDir = path.resolve('database');

async function main() {
  const connection = await mysql.createConnection({
    ...databaseConfig,
    database: undefined,
    multipleStatements: true,
  });

  try {
    await connection.query(`CREATE DATABASE \`${tempDb}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE \`${tempDb}\``);

    const files = (await fs.readdir(databaseDir))
      .filter((file) => /^\d+_.*\.sql$/i.test(file))
      .sort();

    for (const file of files) {
      const fullPath = path.join(databaseDir, file);
      const sql = (await fs.readFile(fullPath, 'utf8'))
        .replace(/USE\s+directevents_platform\s*;/i, `USE \`${tempDb}\`;`);
      await connection.query(sql);
    }

    const [tables] = await connection.query(`
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME IN ('roles', 'role_permissions', 'event_staff_assignments')
      ORDER BY TABLE_NAME
    `, [tempDb]);

    const [indexes] = await connection.query(`
      SELECT TABLE_NAME, INDEX_NAME, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columns_list
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME IN ('role_permissions', 'event_staff_assignments')
      GROUP BY TABLE_NAME, INDEX_NAME
      ORDER BY TABLE_NAME, INDEX_NAME
    `, [tempDb]);

    const [permissions] = await connection.query(`
      SELECT r.code, rp.permission_key, rp.allowed
      FROM roles r
      JOIN role_permissions rp ON rp.role_id = r.id
      WHERE r.code IN ('admin', 'organizer', 'employee', 'back_office', 'doctor', 'customer')
        AND rp.permission_key IN ('certificates.view', 'certificates.manage', 'reviews.view', 'reviews.manage', 'contact_inquiries.manage', 'website_content.manage', 'theme_identity.manage')
      ORDER BY r.code, rp.permission_key
    `);

    console.log(JSON.stringify({
      tempDb,
      migrations: files,
      tables: tables.map((row) => row.TABLE_NAME),
      indexes,
      defaultPermissions: permissions,
    }, null, 2));
  } finally {
    await connection.query(`DROP DATABASE IF EXISTS \`${tempDb}\``).catch(() => undefined);
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
