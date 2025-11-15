-- MySQL schema for recharge app
CREATE DATABASE IF NOT EXISTS recharge_db;
USE recharge_db;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  kyc_status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  role ENUM('USER','ADMIN') DEFAULT 'EMPLOYEE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_kyc_status (kyc_status)
);

-- KYC table for document verification
CREATE TABLE IF NOT EXISTS kyc (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  aadhaar VARCHAR(50),
  pan VARCHAR(50),
  address TEXT,
  status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions table for payment records
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  mobile_number VARCHAR(20),
  operator VARCHAR(100),
  amount DECIMAL(10,2),
  razorpay_payment_id VARCHAR(200),
  status ENUM('SUCCESS','FAILED') DEFAULT 'SUCCESS',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- Optional: Create initial admin user (change password in production)
-- Run this ONLY if you want to create an admin user:
-- 
-- INSERT INTO users (name, email, phone, password, kyc_status, role)
-- VALUES ('Admin', 'admin@example.com', '9999999999', SHA2('admin@123', 256), 'APPROVED', 'ADMIN');
--
-- Then update the password hash using bcryptjs in your application

-- Display tables created
SELECT 'Tables created successfully! ✅' as status;
