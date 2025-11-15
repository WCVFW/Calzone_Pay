import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "recharge_db",
});

async function addColumns() {
  const conn = await pool.getConnection();
  try {
    console.log('🔄 Checking and adding recharge_status and recharge_response columns...');

    const [cols1] = await conn.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='transactions' AND COLUMN_NAME='recharge_status'"
    );
    if (cols1.length === 0) {
      await conn.execute("ALTER TABLE transactions ADD COLUMN recharge_status VARCHAR(50)");
      console.log('✅ Added recharge_status');
    } else {
      console.log('✅ recharge_status already exists');
    }

    const [cols2] = await conn.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='transactions' AND COLUMN_NAME='recharge_response'"
    );
    if (cols2.length === 0) {
      await conn.execute("ALTER TABLE transactions ADD COLUMN recharge_response TEXT");
      console.log('✅ Added recharge_response');
    } else {
      console.log('✅ recharge_response already exists');
    }

    console.log('✅ Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error running migration:', err.message);
    process.exit(1);
  } finally {
    conn.release();
  }
}

addColumns();
