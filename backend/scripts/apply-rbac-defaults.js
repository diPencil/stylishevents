import { getPool, query } from '../src/db/mysql.js';

async function main() {
  await query(`
    UPDATE role_permissions rp
    JOIN roles r ON r.id = rp.role_id
    SET rp.allowed = 0
    WHERE r.code = 'employee'
      AND rp.permission_key IN ('certificates.view', 'certificates.manage', 'reviews.view', 'reviews.manage')
  `);
  console.log('employee_certificate_review_permissions_disabled');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getPool().end();
  });
