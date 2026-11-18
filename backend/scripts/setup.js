// Creates the database/tables and inserts demo data.   Run:  npm run setup
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();
const { hashPassword } = require('../src/auth');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });
  const dbName = process.env.DB_NAME || 'library_db';
  const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8').replace(/library_db/g, dbName);
  await conn.query(schema);

  const [[{ n }]] = await conn.query('SELECT COUNT(*) AS n FROM users');
  if (n === 0) {
    await conn.query('INSERT INTO users (name, membership_id, role, password_hash) VALUES ?', [[
      ['Library Admin', 'ADMIN001', 'admin', hashPassword('admin123')],
      ['Thabo Mokoena', 'MEM1001', 'member', hashPassword('member123')],
      ['Lerato Sello', 'MEM1002', 'member', hashPassword('member123')],
    ]]);
    await conn.query('INSERT INTO books (title, author, genre, isbn, quantity) VALUES ?', [[
      ['Things Fall Apart', 'Chinua Achebe', 'Fiction', '9780385474542', 5],
      ['Clean Code', 'Robert C. Martin', 'Technology', '9780132350884', 3],
      ['Cry, the Beloved Country', 'Alan Paton', 'Fiction', '9780743262173', 1],
      ['A Brief History of Time', 'Stephen Hawking', 'Science', '9780553380163', 0],
      ['Atomic Habits', 'James Clear', 'Self-Help', '9780735211292', 7],
    ]]);
    console.log('Demo data inserted.');
  }
  console.log(`Database "${dbName}" is ready.`);
  console.log('Login -> admin: ADMIN001 / admin123   member: MEM1001 / member123');
  await conn.end();
})().catch((e) => { console.error('Setup failed:', e.message); process.exit(1); });
