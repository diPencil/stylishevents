import { first, getPool, query, transaction } from '../src/db/mysql.js';

const execute = process.argv.includes('--execute');

async function main() {
  const doctorRole = await first("SELECT id FROM roles WHERE code = 'doctor' LIMIT 1");
  const customerRole = await first("SELECT id FROM roles WHERE code = 'customer' LIMIT 1");
  if (!doctorRole) {
    console.log(JSON.stringify({ dryRun: !execute, doctorUsers: [], message: 'No doctor role found' }, null, 2));
    return;
  }

  const doctorUsers = await query(`
    SELECT
      u.id AS user_id,
      u.email,
      u.name,
      u.status,
      d.id AS doctor_id,
      COUNT(DISTINCT r.id) AS registration_count,
      COUNT(DISTINCT gt.id) AS ticket_count,
      COUNT(DISTINCT c.id) AS certificate_count,
      COUNT(DISTINCT rv.id) AS review_count
    FROM users u
    JOIN roles role ON role.id = u.role_id
    LEFT JOIN doctors d ON d.user_id = u.id OR d.email = u.email
    LEFT JOIN registrations r ON r.doctor_id = d.id
    LEFT JOIN generated_tickets gt ON gt.registration_id = r.id
    LEFT JOIN attendees a ON a.id = gt.attendee_id
    LEFT JOIN certificates c ON c.attendee_id = a.id
    LEFT JOIN reviews rv ON rv.customer_id = u.id OR rv.attendee_id = a.id
    WHERE role.code = 'doctor'
    GROUP BY u.id, u.email, u.name, u.status, d.id
    ORDER BY u.id
  `);

  const report = {
    dryRun: !execute,
    targetRole: 'customer',
    doctorUsers: doctorUsers.map((user) => ({
      ...user,
      missingDoctorProfile: !user.doctor_id,
      potentialConflict: !customerRole ? 'customer_role_missing' : null,
    })),
  };

  if (!execute) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (!customerRole) throw new Error('Cannot migrate because the customer role is missing');

  await transaction(async (connection) => {
    await connection.execute(`
      UPDATE users u
      JOIN roles role ON role.id = u.role_id
      SET u.role_id = :customerRoleId
      WHERE role.code = 'doctor'
    `, { customerRoleId: customerRole.id });
  });

  console.log(JSON.stringify({ ...report, migrated: doctorUsers.length }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getPool().end();
  });
