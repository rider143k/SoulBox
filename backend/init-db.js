const mysql = require("mysql2/promise");
require("dotenv").config();

async function initDB() {
  try {
    console.log("🚀 Connecting to Railway MySQL...");

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    console.log("✅ Connected!");

    const queries = [

      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS capsules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        file_path VARCHAR(255),
        recipient_email VARCHAR(255),
        encrypt_key VARCHAR(255),
        unlock_date DATETIME NOT NULL,
        is_unlocked TINYINT DEFAULT 0,
        unlocked_at DATETIME,
        share_token VARCHAR(255),
        secret_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS reminders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        capsule_id INT NOT NULL,
        reminder_date DATETIME NOT NULL,
        is_sent TINYINT DEFAULT 0,
        FOREIGN KEY (capsule_id) REFERENCES capsules(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS unlock_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        capsule_id INT NOT NULL,
        unlocked_at DATETIME NOT NULL,
        FOREIGN KEY (capsule_id) REFERENCES capsules(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS capsule_viewers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        capsule_id INT NOT NULL,
        viewer_ip VARCHAR(100),
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (capsule_id) REFERENCES capsules(id) ON DELETE CASCADE
      )`
    ];

    for (let q of queries) {
      console.log("➡ Running:", q.split("(")[0]);
      await connection.execute(q);
    }

    console.log("🎉 ALL TABLES CREATED SUCCESSFULLY!");
    await connection.end();
    process.exit(0);

  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
}

initDB();
