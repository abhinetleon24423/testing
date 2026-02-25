const mysql = require('mysql2/promise');

let pool = null;

/**
 * Create MySQL connection pool. Call from connectDB() when MYSQL_* env is set.
 */
async function connectMySQL() {
  if (pool) return pool;
  const config = {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'project',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
  pool = mysql.createPool(config);
  try {
    const conn = await pool.getConnection();
    conn.release();
    console.log('MySQL connected');
  } catch (err) {
    console.error('MySQL connection error:', err.message);
    throw err;
  }
  return pool;
}

/**
 * Get MySQL pool. Returns null if MySQL not configured/connected.
 */
function getMysqlPool() {
  return pool;
}

module.exports = { connectMySQL, getMysqlPool };
