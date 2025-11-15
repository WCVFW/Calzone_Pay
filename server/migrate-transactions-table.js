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

async function migrate() {
  const conn = await pool.getConnection();
  
  try {
    console.log('🔄 Migrating transactions table...');

    // Add plan_amount column if not exists
    try {
      await conn.execute('ALTER TABLE transactions ADD COLUMN plan_amount DECIMAL(10,2)');
      console.log('✅ Added plan_amount column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  plan_amount column already exists');
      } else {
        throw err;
      }
    }

    // Add commissions column if not exists
    try {
      await conn.execute('ALTER TABLE transactions ADD COLUMN commissions DECIMAL(10,2)');
      console.log('✅ Added commissions column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  commissions column already exists');
      } else {
        throw err;
      }
    }

    // Add total_amount column if not exists
    try {
      await conn.execute('ALTER TABLE transactions ADD COLUMN total_amount DECIMAL(10,2)');
      console.log('✅ Added total_amount column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  total_amount column already exists');
      } else {
        throw err;
      }
    }

    // Update status enum to include PENDING
    try {
      await conn.execute("ALTER TABLE transactions MODIFY COLUMN status ENUM('PENDING','SUCCESS','FAILED') DEFAULT 'PENDING'");
      console.log('✅ Updated status enum to include PENDING');
    } catch (err) {
      console.log('⚠️  Status enum update skipped:', err.message.slice(0, 100));
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

migrate();
