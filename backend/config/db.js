const mysql = require("mysql2");

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "MirrorTalk",
};

if (process.env.NODE_ENV === "production" || process.env.DB_SSL === "true") {
  dbConfig.ssl = { rejectUnauthorized: false };
}

const db = mysql.createConnection(dbConfig);

const initDatabaseSchema = async () => {
  const promiseDb = db.promise();
  try {
    await promiseDb.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        reset_token VARCHAR(255) NULL,
        reset_token_expires DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await promiseDb.query(`
      CREATE TABLE IF NOT EXISTS journals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        entry_text TEXT NOT NULL,
        entry_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      );
    `);

    await promiseDb.query(`
      CREATE TABLE IF NOT EXISTS moods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        mood_level INT NOT NULL,
        mood_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      );
    `);

    await promiseDb.query(`
      CREATE TABLE IF NOT EXISTS gratitude (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        gratitude_1 TEXT,
        gratitude_2 TEXT,
        gratitude_3 TEXT,
        entry_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      );
    `);

    await promiseDb.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        task_text VARCHAR(255) NOT NULL,
        completed TINYINT(1) DEFAULT 0,
        task_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      );
    `);

    console.log("✅ Database schema initialized");
  } catch (err) {
    console.error("⚠️ Schema init note:", err.message);
  }
};

db.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed:", err.message);
  } else {
    console.log("✅ MySQL Connected");
    initDatabaseSchema();
  }
});

module.exports = db;
