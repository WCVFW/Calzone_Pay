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

async function verifyAdminUser() {
  try {
    const conn = await pool.getConnection();

    const email = 'prakash@hadoglobalservices.com';
    const password = 'Prakash@0000';

    // Query user
    const [users] = await conn.execute('SELECT id, name, email, role, kyc_status, password FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      console.log('❌ Admin user NOT found in database');
      conn.release();
      process.exit(1);
    }

    const user = users[0];
    console.log('✅ Admin user found in database:');
    console.log('   ID:', user.id);
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   KYC Status:', user.kyc_status);

    // Test password match
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      console.log('✅ Password is CORRECT');
    } else {
      console.log('❌ Password does NOT match');
    }

    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error verifying admin user:', err.message);
    process.exit(1);
  }
}

verifyAdminUser();
