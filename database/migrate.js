require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const migrationsDir = path.join(__dirname, 'migrations');

async function run() {
  const config = {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'project',
    multipleStatements: true,
  };

  if (!process.env.MYSQL_HOST && !process.env.MYSQL_USER && !process.env.MYSQL_DATABASE) {
    console.error('MySQL not configured. Set MYSQL_* in .env');
    process.exit(1);
  }

  let conn;
  try {
    conn = await mysql.createConnection(config);
    console.log('MySQL connected, running migrations...\n');
  } catch (err) {
    console.error('MySQL connection error:', err.message);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    try {
      await conn.query(sql);
      console.log('  OK:', file);
    } catch (err) {
      console.error('  FAIL:', file, err.message);
      await conn.end();
      process.exit(1);
    }
  }

  await conn.end();
  console.log('\nMigrations done.');
}

run();
