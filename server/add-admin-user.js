import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'recharge_db',
});

async function addAdminUser() {
  try {
    const conn = await pool.getConnection();

    // Admin details (as provided)
    const email = 'prakash@hadoglobalservices.com';
    const password = 'Prakash@0000';
    const name = 'Prakash Admin';
    const phone = '0000000000';

    // Check if admin already exists
    const [existing] = await conn.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log('✅ Admin user already exists with email:', email);
      conn.release();
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert admin user
    await conn.execute(
      'INSERT INTO users (name, email, phone, password, role, kyc_status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, hashedPassword, 'ADMIN', 'APPROVED']
    );

    console.log('✅ Admin user created successfully!');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   Role: ADMIN');

    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin user:', err.message);
    process.exit(1);
  }
}

addAdminUser();
