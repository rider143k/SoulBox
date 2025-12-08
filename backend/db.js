const mysql = require("mysql2");
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'rajkumar1234@',
  database: process.env.DB_NAME || 'soulbox',
  port: process.env.DB_PORT || 3306,
  timezone: "+05:30",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise(); // use async/await with .query
