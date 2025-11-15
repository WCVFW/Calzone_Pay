import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "recharge_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

// Verify the database connection on startup
pool.getConnection()
  .then(conn => {
    console.log('🗄️  Database connected successfully');
    conn.release();
  })
  .catch(err => console.error('❌ Database connection failed:', err.message));

export default pool;