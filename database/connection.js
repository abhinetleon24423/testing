const mongoose = require('mongoose');
const { connectMySQL, getMysqlPool } = require('./mysql');

/**
 * Connect all databases that have env config.
 * - Set MONGODB_URI to use MongoDB (mongoose).
 * - Set MYSQL_HOST, MYSQL_USER, etc. to use MySQL.
 * Use one, or both – only configured DBs are connected.
 */

async function connectDB() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected');
    } catch (err) {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    }
  }

  if (process.env.MYSQL_HOST || process.env.MYSQL_USER || process.env.MYSQL_DATABASE) {
    try {
      await connectMySQL();
    } catch (err) {
      console.error('MySQL connection error:', err.message);
      process.exit(1);
    }
  }

  if (!process.env.MONGODB_URI && !process.env.MYSQL_HOST && !process.env.MYSQL_USER && !process.env.MYSQL_DATABASE) {
    console.warn('No database configured. Set MONGODB_URI and/or MYSQL_* in .env');
  }
}

/**
 * Use MongoDB (mongoose). Same as require('mongoose') – use for Mongoose models.
 * Example: const User = mongoose.model('User', userSchema); or use app/Models/User.js
 */
function getMongo() {
  return mongoose;
}

/**
 * Use MySQL (raw queries). Returns pool or null if MySQL not connected.
 * Example: const [rows] = await getMysql().query('SELECT * FROM users WHERE id = ?', [id]);
 */
function getMysql() {
  return getMysqlPool();
}

module.exports = { connectDB, getMongo, getMysql };
