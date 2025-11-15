import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "recharge_db",
});

async function updateTransactionsSchema() {
  const conn = await pool.getConnection();
  try {
    console.log("🔄 Updating transactions table schema...\n");

    // 1. Modify status ENUM to include PENDING and COMPLETED
    console.log("1️⃣ Updating status ENUM...");
    try {
      await conn.execute(
        "ALTER TABLE transactions MODIFY COLUMN status ENUM('PENDING','SUCCESS','FAILED','COMPLETED') DEFAULT 'PENDING'"
      );
      console.log("✅ status ENUM updated\n");
    } catch (err) {
      if (err.message.includes("Duplicate")) {
        console.log("✅ status ENUM already updated\n");
      } else {
        throw err;
      }
    }

    // 2. Check and add plan_amount if missing
    console.log("2️⃣ Checking plan_amount column...");
    const [planCol] = await conn.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'transactions' AND COLUMN_NAME = 'plan_amount'"
    );
    
    if (planCol.length === 0) {
      await conn.execute("ALTER TABLE transactions ADD COLUMN plan_amount DECIMAL(10,2)");
      console.log("✅ plan_amount column added\n");
    } else {
      console.log("✅ plan_amount column already exists\n");
    }

    // 3. Check and add commissions if missing
    console.log("3️⃣ Checking commissions column...");
    const [commCol] = await conn.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'transactions' AND COLUMN_NAME = 'commissions'"
    );
    
    if (commCol.length === 0) {
      await conn.execute("ALTER TABLE transactions ADD COLUMN commissions DECIMAL(10,2)");
      console.log("✅ commissions column added\n");
    } else {
      console.log("✅ commissions column already exists\n");
    }

    // 4. Check and add total_amount if missing
    console.log("4️⃣ Checking total_amount column...");
    const [totalCol] = await conn.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'transactions' AND COLUMN_NAME = 'total_amount'"
    );
    
    if (totalCol.length === 0) {
      await conn.execute("ALTER TABLE transactions ADD COLUMN total_amount DECIMAL(10,2)");
      console.log("✅ total_amount column added\n");
    } else {
      console.log("✅ total_amount column already exists\n");
    }

    // 5. Check and add razorpay_order_id if missing
    console.log("5️⃣ Checking razorpay_order_id column...");
    const [orderId] = await conn.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'transactions' AND COLUMN_NAME = 'razorpay_order_id'"
    );
    
    if (orderId.length === 0) {
      await conn.execute("ALTER TABLE transactions ADD COLUMN razorpay_order_id VARCHAR(255)");
      console.log("✅ razorpay_order_id column added\n");
    } else {
      console.log("✅ razorpay_order_id column already exists\n");
    }

    console.log("✅ All migrations complete!\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  } finally {
    conn.release();
  }
}

updateTransactionsSchema();
