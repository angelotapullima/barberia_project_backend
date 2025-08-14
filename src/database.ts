import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
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