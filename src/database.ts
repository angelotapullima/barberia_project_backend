import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '********' : 'undefined'); // Mask password
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: {
    rejectUnauthorized: false
  },
  // Forzar IPv4
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // Configuración adicional para resolver problemas de red
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
});
// The 'setup' function now returns the pool.
// You might need to refactor your services to use the pool directly
// to query the database, for example: `pool.query('SELECT * FROM users')`.
function setup() {
  return pool;
}

// The 'setupTestDB' can be configured to connect to a separate test database if needed.
// For now, it will also return the same pool.
export function setupTestDB() {
  // In a real-world scenario, you would point this to a separate test database.
  return pool;
}

export default setup;