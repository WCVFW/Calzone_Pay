import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'recharge_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function addColumn() {
  const conn = await pool.getConnection();
  
  try {
    console.log('🔄 Adding razorpay_order_id column to transactions table...');

    try {
      await conn.execute('ALTER TABLE transactions ADD COLUMN razorpay_order_id VARCHAR(255)');
      console.log('✅ Added razorpay_order_id column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  razorpay_order_id column already exists');
      } else {
        throw err;
      }
    }

    console.log('✅ Migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

addColumn();
