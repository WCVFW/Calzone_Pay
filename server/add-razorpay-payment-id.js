import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "recharge_db",
});

async function addRazorpayPaymentIdColumn() {
  const conn = await pool.getConnection();
  let migrationNeeded = false;
  try {
    console.log("🔄 Checking columns in transactions table...");

    // Check for razorpay_payment_id
    const [columns] = await conn.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'transactions' AND COLUMN_NAME = 'razorpay_payment_id'"
    );
    if (columns.length === 0) {
      migrationNeeded = true;
      console.log("➕ Adding razorpay_payment_id column...");
      await conn.execute(
        "ALTER TABLE transactions ADD COLUMN razorpay_payment_id VARCHAR(200) UNIQUE"
      );
      console.log("✅ razorpay_payment_id column added successfully");
    }

    // Check for razorpay_signature
    const [sigColumns] = await conn.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'transactions' AND COLUMN_NAME = 'razorpay_signature'"
    );
    if (sigColumns.length === 0) {
      migrationNeeded = true;
      console.log("➕ Adding razorpay_signature column...");
      await conn.execute(
        "ALTER TABLE transactions ADD COLUMN razorpay_signature VARCHAR(255) NULL"
      );
      console.log("✅ razorpay_signature column added successfully");
    }

    // Check for employee_commission
    const [empColumns] = await conn.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'transactions' AND COLUMN_NAME = 'employee_commission'"
    );
    if (empColumns.length === 0) {
      migrationNeeded = true;
      console.log("➕ Adding employee_commission column...");
      await conn.execute("ALTER TABLE transactions ADD COLUMN employee_commission DECIMAL(10, 2) DEFAULT 0.00");
      console.log("✅ employee_commission column added successfully");
    }

    // Check for company_commission
    const [compColumns] = await conn.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'transactions' AND COLUMN_NAME = 'company_commission'"
    );
    if (compColumns.length === 0) {
      migrationNeeded = true;
      console.log("➕ Adding company_commission column...");
      await conn.execute("ALTER TABLE transactions ADD COLUMN company_commission DECIMAL(10, 2) DEFAULT 0.00");
      console.log("✅ company_commission column added successfully");
    }

    // Check for agent_commission
    const [agentColumns] = await conn.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'transactions' AND COLUMN_NAME = 'agent_commission'"
    );
    if (agentColumns.length === 0) {
      migrationNeeded = true;
      console.log("➕ Adding agent_commission column...");
      await conn.execute("ALTER TABLE transactions ADD COLUMN agent_commission DECIMAL(10, 2) DEFAULT 0.00");
      console.log("✅ agent_commission column added successfully");
    }

    console.log("✅ Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  } finally {
    conn.release();
  }
}

addRazorpayPaymentIdColumn();
