import { getPool } from '../src/db/mysql.js';
import { releaseExpiredReservations } from '../src/utils/capacityReservations.js';

const dryRun = process.argv.includes('--dry-run');

async function main() {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.execute(`
      SELECT COUNT(*) AS scanned
      FROM registrations
      WHERE registration_status = 'pending_payment'
        AND COALESCE(capacity_reservation_status, 'active') = 'active'
        AND reservation_expires_at IS NOT NULL
        AND reservation_expires_at <= NOW()
    `);

    let released = 0;
    if (!dryRun) {
      await connection.beginTransaction();
      try {
        released = await releaseExpiredReservations(connection);
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    }

    console.log(JSON.stringify({
      dryRun,
      scanned: Number(rows[0]?.scanned || 0),
      released,
    }, null, 2));
  } finally {
    connection.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
