// server.js - Enhanced Recharge Server with Auth, KYC, Admin, Razorpay
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Pool ---
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'recharge_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// --- API Credentials for Recharge Plans ---
const API_USER_ID = process.env.API_USER_ID || '6659';
const API_PASSWORD = process.env.API_PASSWORD || 'Prakash@1482';

// --- Helper: Safe Fetch ---
async function safeFetch(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Fetch failed:', response.status, response.statusText);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Fetch error:', err);
    return null;
  }
}

// --- JWT Middleware ---
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

// ========== AUTH ENDPOINTS ==========

// 📝 Signup
app.post('/api/auth/signup', async (req, res) => {
  const { firstName, lastName, name: legacyName, email, phone, password } = req.body;
  const name = legacyName || `${firstName} ${lastName}`;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  try {
    const conn = await pool.getConnection();
    
    // Check if user exists
    const [rows] = await conn.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      conn.release();
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with PENDING status
    await conn.execute(
      'INSERT INTO users (name, email, phone, password, kyc_status) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, hashedPassword, 'PENDING']
    );

    conn.release();
    res.status(201).json({ message: 'Signup successful. Please complete KYC.' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

// 🔑 Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute('SELECT * FROM users WHERE email = ?', [email]);
    conn.release();

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// 👤 Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(
      'SELECT id, name, email, phone, role, kyc_status FROM users WHERE id = ?',
      [req.user.userId]
    );
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      kyc_status: user.kyc_status,
      is_active: user.kyc_status === 'APPROVED',
    });
  } catch (err) {
    console.error('Auth/me error:', err);
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
});

// ========== KYC ENDPOINTS ==========

// 📤 Submit KYC
app.post('/api/kyc/submit', authenticateToken, async (req, res) => {
  const { aadhaar, pan, address } = req.body;
  const userId = req.user.userId;

  if (!aadhaar || !pan || !address) {
    return res.status(400).json({ message: 'All KYC fields required' });
  }

  try {
    const conn = await pool.getConnection();

    // Check if KYC already exists
    const [existing] = await conn.execute('SELECT id FROM kyc WHERE user_id = ?', [userId]);
    
    if (existing.length > 0) {
      // Update existing KYC
      await conn.execute(
        'UPDATE kyc SET aadhaar = ?, pan = ?, address = ?, status = ? WHERE user_id = ?',
        [aadhaar, pan, address, 'PENDING', userId]
      );
    } else {
      // Create new KYC
      await conn.execute(
        'INSERT INTO kyc (user_id, aadhaar, pan, address, status) VALUES (?, ?, ?, ?, ?)',
        [userId, aadhaar, pan, address, 'PENDING']
      );
    }

    // Update user kyc_status
    await conn.execute('UPDATE users SET kyc_status = ? WHERE id = ?', ['PENDING', userId]);

    conn.release();
    res.json({ message: 'KYC submitted successfully. Awaiting admin approval.' });
  } catch (err) {
    console.error('KYC submit error:', err);
    res.status(500).json({ message: 'KYC submission failed', error: err.message });
  }
});

// ✅ Get pending KYC users (Admin only)
app.get('/api/admin/kyc-pending', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(`
      SELECT u.id, u.name, u.email, u.phone, u.kyc_status, k.aadhaar, k.pan, k.address
      FROM users u
      LEFT JOIN kyc k ON u.id = k.user_id
      WHERE u.kyc_status = 'PENDING'
    `);
    conn.release();

    res.json(rows);
  } catch (err) {
    console.error('Get pending KYC error:', err);
    res.status(500).json({ message: 'Failed to fetch pending KYC', error: err.message });
  }
});

// ✅ Approve/Reject KYC (Admin only)
app.post('/api/admin/kyc-approve', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { userId, action } = req.body; // action: 'APPROVED' or 'REJECTED'

  if (!userId || !['APPROVED', 'REJECTED'].includes(action)) {
    return res.status(400).json({ message: 'userId and valid action required' });
  }

  try {
    const conn = await pool.getConnection();
    await conn.execute('UPDATE users SET kyc_status = ? WHERE id = ?', [action, userId]);
    await conn.execute('UPDATE kyc SET status = ? WHERE user_id = ?', [action, userId]);
    conn.release();

    res.json({ message: `User KYC ${action.toLowerCase()}ed successfully` });
  } catch (err) {
    console.error('KYC approval error:', err);
    res.status(500).json({ message: 'KYC approval failed', error: err.message });
  }
});

// ========== PAYMENT ENDPOINTS ==========

// 💳 Create Razorpay Order
app.post('/api/payment/razorpay-order', authenticateToken, async (req, res) => {
  const { amount, mobile_number, operator } = req.body;

  if (!amount || !mobile_number || !operator) {
    return res.status(400).json({ message: 'amount, mobile_number, operator required' });
  }

  try {
    // TODO: Integrate with Razorpay API
    // For now, return mock order
    const orderId = 'order_' + Date.now();
    
    res.json({
      order_id: orderId,
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `recharge_${req.user.userId}_${Date.now()}`,
    });
  } catch (err) {
    console.error('Razorpay order error:', err);
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
});

// ✅ Verify Payment & Save Transaction
app.post('/api/payment/verify', authenticateToken, async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, mobile_number, operator, amount } = req.body;
  const userId = req.user.userId;

  if (!razorpay_payment_id || !mobile_number || !operator || !amount) {
    return res.status(400).json({ message: 'All payment details required' });
  }

  try {
    // TODO: Verify with Razorpay API
    // For now, assume verification succeeds

    const conn = await pool.getConnection();
    await conn.execute(
      'INSERT INTO transactions (user_id, mobile_number, operator, amount, razorpay_payment_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, mobile_number, operator, amount, razorpay_payment_id, 'SUCCESS']
    );
    conn.release();

    res.json({ message: 'Payment verified and transaction saved successfully' });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ message: 'Payment verification failed', error: err.message });
  }
});

// ========== RECHARGE PLANS ENDPOINTS ==========

// ✅ Fetch Operator
app.get('/api/operator/:mobileNumber', async (req, res) => {
  const { mobileNumber } = req.params;

  if (!/^\d{10}$/.test(mobileNumber)) {
    return res.status(400).json({ error: 'Invalid mobile number' });
  }

  const operatorApiUrl = `https://planapi.in/api/Mobile/OperatorFetchNew?ApiUserID=${API_USER_ID}&ApiPassword=${API_PASSWORD}&Mobileno=${mobileNumber}`;

  const data = await safeFetch(operatorApiUrl);

  if (!data) {
    return res.status(500).json({ error: 'Failed to fetch operator from API' });
  }

  if (data.Operator && data.OpCode && data.CircleCode) {
    res.json({
      operatorName: data.Operator,
      operatorCode: data.OpCode,
      circle: data.Circle,
      circleCode: data.CircleCode,
    });
  } else {
    res.json({ error: data.Response || 'Operator not found' });
  }
});

// ✅ Fetch Plans
app.get('/api/plans/:operatorCode/:circleCode', async (req, res) => {
  const { operatorCode, circleCode } = req.params;

  const plansApiUrl = `https://planapi.in/api/Mobile/NewMobilePlans?apimember_id=${API_USER_ID}&api_password=${API_PASSWORD}&operatorcode=${operatorCode}&cricle=${circleCode}`;

  const data = await safeFetch(plansApiUrl);

  if (!data) {
    return res.status(500).json({ error: 'Failed to fetch plans from API' });
  }

  if (data.RDATA) {
    res.json(data.RDATA);
  } else {
    res.json({ error: 'No plans found' });
  }
});

// ✅ Health Check
app.get('/', (req, res) => {
  res.json({ message: 'Recharge API Server running ✅', port: PORT });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  Auth: POST /api/auth/signup, POST /api/auth/login, GET /api/auth/me');
  console.log('  KYC: POST /api/kyc/submit, GET /api/admin/kyc-pending, POST /api/admin/kyc-approve');
  console.log('  Payment: POST /api/payment/razorpay-order, POST /api/payment/verify');
  console.log('  Plans: GET /api/operator/:mobile, GET /api/plans/:operator/:circle');
});
