// server/src/config/db.js
const { Pool } = require('pg');
const { app: config } = require('./server-config');

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.env === 'production'
    ? { rejectUnauthorized: false } // Required for Supabase
    : false, // Disable SSL locally
});

// Logging + Query helpers
function logAndRun(sql, params = []) {
  // console.log('[PG RUN]', sql, params);
  return pool.query(sql, params);
}

async function logAndGet(sql, params = []) {
  // console.log('[PG GET]', sql, params);
  const result = await pool.query(sql, params);
  return result.rows[0];
}

async function logAndAll(sql, params = []) {
  console.log('[PG ALL]', sql, params);
  const result = await pool.query(sql, params);
  return result.rows;
}

module.exports = {
  pool,
  logAndRun,
  logAndGet,
  logAndAll,
};
