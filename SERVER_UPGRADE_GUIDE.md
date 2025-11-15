# 🚀 Server.js Enhancement Guide

This guide helps you upgrade your existing recharge server with authentication, database integration, KYC workflow, admin approval, and payment processing.

---

## 📋 What's Being Added

### To Your Current Server

Your existing server has:
```javascript
✅ Express setup
✅ CORS middleware
✅ /api/operator/:mobileNumber endpoint
✅ /api/plans/:operatorCode/:circleCode endpoint
✅ Recharge plan fetching from external API
```

### We're Adding (NEW)

```javascript
✅ JWT Authentication (signup, login, verify)
✅ MySQL Database Integration
✅ Password Hashing (bcryptjs)
✅ KYC Submission Endpoint
✅ Admin Dashboard Endpoint
✅ Admin KYC Approval/Rejection
✅ Razorpay Payment Integration
✅ Transaction Logging
✅ Role-Based Access Control
✅ Security Middleware
```

---

## 🔄 Migration Steps

### Step 1: Update `server.js`

**Option A: Replace Entire File**
```bash
# Backup your current server
cp server.js server.js.backup

# Replace with enhanced version
# Copy content from server-enhanced.js to server.js
```

**Option B: Manual Merge**
Add these imports at the top:
```javascript
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
```

Add database pool setup after middleware:
```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'recharge_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
```

Add JWT middleware:
```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};
```

Add all new endpoints (auth, kyc, payment) before the operator endpoint.

### Step 2: Update `package.json`

Add these dependencies:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "mysql2": "^3.9.7",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.4.5"
  }
}
```

Install:
```bash
npm install mysql2 jsonwebtoken bcryptjs dotenv
```

### Step 3: Create `.env` File

Create `server/.env`:
```properties
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=recharge_db

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# Recharge API
API_USER_ID=6659
API_PASSWORD=Prakash@1482

# Razorpay (Optional - for production)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### Step 4: Create Database Schema

Create `server/schema.sql`:
```sql
-- MySQL schema for recharge app
CREATE DATABASE IF NOT EXISTS recharge_db;
USE recharge_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  kyc_status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  role ENUM('USER','ADMIN') DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  mobile_number VARCHAR(20),
  operator VARCHAR(100),
  amount DECIMAL(10,2),
  razorpay_payment_id VARCHAR(200),
  status ENUM('SUCCESS','FAILED') DEFAULT 'SUCCESS',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create an admin user (use hashed password in production)
-- INSERT INTO users (name, email, phone, password, kyc_status, role) 
-- VALUES ('Admin', 'admin@example.com', '9999999999', 'hashed_password_here', 'APPROVED', 'ADMIN');
```

Setup database:
```bash
mysql -u root -p < server/schema.sql
```

### Step 5: Test New Endpoints

```bash
# Start server
npm run dev

# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"9876543210","password":"password123"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test get current user (replace TOKEN)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TOKEN"

# Test KYC submit
curl -X POST http://localhost:3000/api/kyc/submit \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"aadhaar":"123456789012","pan":"ABCDE1234F","address":"123 Main St"}'

# Test operator (existing endpoint - should still work)
curl http://localhost:3000/api/operator/9876543210
```

---

## 📚 New Endpoints

### Authentication (3 endpoints)
```
POST   /api/auth/signup              Create account
POST   /api/auth/login               Login & get token
GET    /api/auth/me                  Get current user
```

### KYC (3 endpoints)
```
POST   /api/kyc/submit               Submit KYC documents
GET    /api/admin/kyc-pending        List pending KYC (admin only)
POST   /api/admin/kyc-approve        Approve/reject KYC (admin only)
```

### Payments (2 endpoints)
```
POST   /api/payment/razorpay-order   Create payment order
POST   /api/payment/verify           Verify & save transaction
```

### Plans (2 endpoints - EXISTING)
```
GET    /api/operator/:mobileNumber   Get telecom operator
GET    /api/plans/:operatorCode/:circleCode   Get plans
```

---

## 🔐 Authentication Flow

### 1. User Signup
```javascript
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "securePassword123"
}

Response:
{
  "message": "Signup successful. Please complete KYC."
}
```

### 2. User Login
```javascript
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

### 3. Use Token in Requests
```javascript
GET /api/auth/me
Header: Authorization: Bearer <token>

Response:
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "role": "USER",
  "kyc_status": "PENDING",
  "is_active": false
}
```

---

## 🪪 KYC Workflow

### 1. Submit KYC
```javascript
POST /api/kyc/submit
Header: Authorization: Bearer <token>
Body: {
  "aadhaar": "123456789012",
  "pan": "ABCDE1234F",
  "address": "123 Main Street, City"
}
```

### 2. Admin Views Pending
```javascript
GET /api/admin/kyc-pending
Header: Authorization: Bearer <admin_token>

Response:
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "aadhaar": "123456789012",
    "pan": "ABCDE1234F",
    "address": "123 Main Street, City",
    "kyc_status": "PENDING"
  }
]
```

### 3. Admin Approves/Rejects
```javascript
POST /api/admin/kyc-approve
Header: Authorization: Bearer <admin_token>
Body: {
  "userId": 1,
  "action": "APPROVED"  // or "REJECTED"
}

Response:
{
  "message": "User KYC approved successfully"
}
```

---

## 💳 Payment Integration (Razorpay Ready)

### 1. Create Order
```javascript
POST /api/payment/razorpay-order
Header: Authorization: Bearer <token>
Body: {
  "amount": 299,
  "mobile_number": "9876543210",
  "operator": "JIO"
}

Response:
{
  "order_id": "order_1699567890123",
  "amount": 29900,
  "currency": "INR"
}
```

### 2. Verify Payment
```javascript
POST /api/payment/verify
Header: Authorization: Bearer <token>
Body: {
  "razorpay_payment_id": "pay_123456789",
  "razorpay_order_id": "order_123456789",
  "mobile_number": "9876543210",
  "operator": "JIO",
  "amount": 299
}

Response:
{
  "message": "Payment verified and transaction saved successfully"
}
```

---

## 🔒 Security Features

✅ **Password Security**
- Hashed with bcryptjs (10 rounds)
- Never stored in plain text

✅ **Token Security**
- JWT tokens with 7-day expiry
- Bearer token in Authorization header
- Verified on every protected request

✅ **Database Security**
- Prepared statements (prevent SQL injection)
- Connection pooling
- Foreign key constraints

✅ **Role-Based Access**
- USER role: Can recharge after KYC approval
- ADMIN role: Can view & approve KYC

✅ **Input Validation**
- Mobile number format validation
- Required field checking
- Email uniqueness checking

---

## 🆘 Troubleshooting

### "MySQL connection failed"
- Ensure MySQL is running
- Check credentials in .env
- Verify database exists

### "Module not found"
- Run: `npm install mysql2 jsonwebtoken bcryptjs dotenv`
- Check package.json has these dependencies

### "Invalid token"
- Ensure token is passed in header: `Authorization: Bearer <token>`
- Check token hasn't expired (7 days)
- Verify JWT_SECRET hasn't changed

### "Admin access required"
- Create admin user in database
- Ensure user has role = 'ADMIN'

---

## 📝 Next Steps

1. **Update server.js** with new code
2. **Install dependencies**: `npm install mysql2 jsonwebtoken bcryptjs dotenv`
3. **Create .env file** with configuration
4. **Setup database**: `mysql -u root -p < server/schema.sql`
5. **Test endpoints** using curl or Postman
6. **Connect frontend** to use new endpoints

---

## 📞 Support

Refer to:
- Enhanced server code: `server-enhanced.js`
- Database schema: SQL queries in this guide
- API documentation: Full endpoint details above

---

**Status**: ✅ Ready for Implementation  
**Backward Compatible**: ✅ Operator & Plans endpoints unchanged  
**Production Ready**: ✅ With proper .env configuration

