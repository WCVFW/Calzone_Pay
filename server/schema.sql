-- MySQL schema for recharge app
CREATE DATABASE IF NOT EXISTS recharge_db;
USE recharge_db;

-- Users table for authentication and storing user details
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  role ENUM('USER','ADMIN', 'EMPLOYEE') DEFAULT 'EMPLOYEE',
  -- KYC related columns
  kyc_status ENUM('NOT_SUBMITTED', 'PENDING','APPROVED','REJECTED') DEFAULT 'NOT_SUBMITTED',
  -- Timestamps and indexes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_kyc_status (kyc_status),
  INDEX idx_phone (phone)
);

-- KYC table for document verification details linked to a user
CREATE TABLE IF NOT EXISTS kyc (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  aadhaar_number VARCHAR(255) NULL,
  pan_number VARCHAR(255) NULL,
  address TEXT NULL,
  aadhaar_file_meta JSON NULL,
  pan_file_meta JSON NULL,
  address_file_meta JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions table for logging all payment records
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  mobile_number VARCHAR(20),
  operator VARCHAR(100),
  plan_amount DECIMAL(10, 2),
  employee_commission DECIMAL(10, 2) DEFAULT 0,
  company_commission DECIMAL(10, 2) DEFAULT 0,
  agent_commission DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2),
  status ENUM('PENDING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
  recharge_status ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
  recharge_response TEXT,
  razorpay_payment_id VARCHAR(200),
  razorpay_order_id VARCHAR(200),
  razorpay_signature VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_status (status),
  INDEX idx_razorpay_payment_id (razorpay_payment_id)
);

-- Verify tables created successfully
SHOW TABLES;
SELECT 'Tables created successfully! ✅' AS status;
