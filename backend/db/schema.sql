CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  membership_id VARCHAR(30)  NOT NULL UNIQUE,
  role          ENUM('admin','member') NOT NULL DEFAULT 'member',
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  author     VARCHAR(120) NOT NULL,
  genre      VARCHAR(60)  NOT NULL,
  isbn       VARCHAR(20)  NOT NULL UNIQUE,
  quantity   INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Borrowing / stock history. Rows are kept even if a book or user is removed.
CREATE TABLE IF NOT EXISTS transactions (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  book_id    INT NULL,
  user_id    INT NULL,
  book_title VARCHAR(200) NOT NULL,
  user_name  VARCHAR(100) NOT NULL,
  type       ENUM('add_stock','borrow','return') NOT NULL,
  quantity   INT NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tx_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL,
  CONSTRAINT fk_tx_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
