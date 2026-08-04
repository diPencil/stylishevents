import mysql from 'mysql2/promise';
import { databaseConfig } from '../config/database.js';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(databaseConfig);
  }

  return pool;
}

export async function query(sql, params = {}) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

export async function first(sql, params = {}) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

export async function transaction(callback) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function verifyDatabaseConnection() {
  let connection;

  try {
    connection = await getPool().getConnection();
    await connection.ping();
    console.log('Database verification completed.');
    return { ready: true };
  } catch (error) {
    const code = typeof error?.code === 'string' ? error.code : 'DATABASE_VERIFY_FAILED';
    console.error(`Database verification failed (${code}).`);
    return { ready: false };
  } finally {
    connection?.release();
  }
}
