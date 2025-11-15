#!/bin/bash
# Quick start script for Recharge App

echo "🚀 Recharge App - Quick Start Guide"
echo "====================================="
echo ""

# Check if MySQL is running
echo "✓ Ensure MySQL is running on localhost:3306"
echo ""

# Step 1: Database Setup
echo "Step 1: Setting up Database"
echo "Run the following command to create tables:"
echo "  mysql -u root -p < server/schema.sql"
echo ""

# Step 2: Server Setup
echo "Step 2: Setting up Backend Server"
echo "  cd server"
echo "  npm install"
echo "  npm run dev"
echo "  Server will run on: http://localhost:3000"
echo ""

# Step 3: Client Setup
echo "Step 3: Setting up Frontend Client (in another terminal)"
echo "  cd client"
echo "  npm install"
echo "  npm run dev"
echo "  Client will run on: http://localhost:5173"
echo ""

echo "====================================="
echo "✅ App is ready when both servers are running!"
echo ""

echo "📝 Testing Flow:"
echo "1. Go to http://localhost:5173/signup"
echo "2. Create an account"
echo "3. Submit KYC"
echo "4. Create admin user in DB: INSERT INTO users (name, email, phone, password, kyc_status, role) VALUES ('Admin', 'admin@test.com', '9999999999', SHA2('password', 256), 'APPROVED', 'ADMIN');"
echo "5. Login as admin"
echo "6. Go to /admin to approve KYC"
echo "7. Logout and login as regular user"
echo "8. Go to /recharge and test payment (Pay button will be enabled)"
echo ""
