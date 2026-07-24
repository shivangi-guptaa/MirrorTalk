-- MirrorTalk Production Database Schema

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  reset_token VARCHAR(255) NULL,
  reset_token_expires DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS journals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  entry_text TEXT NOT NULL,
  entry_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS moods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  mood_level INT NOT NULL,
  mood_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

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
