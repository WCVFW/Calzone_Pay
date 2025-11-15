import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

// --- Local Imports ---
import pool from "./db.js";
import { verifyEmailConnection } from "./emailService.js";
import authRoutes from "./authRoutes.js";
import kycRoutes from "./kycRoutes.js";
import operatorRoutes from "./operatorRoutes.js";
import paymentRoutes from "./paymentRoutes.js"; // Import the new payment routes

dotenv.config();

// --- Constants & Initialization ---
const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

verifyEmailConnection();

// --- Database Schema Setup ---
async function setupDatabase() {
  try {
    console.log("🔄 Running database schema setup...");
    const schemaSql = await fs.readFile(path.join(__dirname, "schema.sql"), "utf-8");
    // Split the file into individual statements. This handles simple cases.
    const statements = schemaSql.split(';').filter(s => s.trim().length > 0);

    const conn = await pool.getConnection();
    for (const statement of statements) {
      await conn.query(statement);
    }
    conn.release();
    console.log("✅ Database schema setup complete.");
  } catch (error) {
    console.error("❌ Failed to setup database schema:", error.message);
  }
}

// --- Core Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Static File Serving ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api", operatorRoutes); // Use a single prefix for operator and plan routes
app.use("/api/payment", paymentRoutes); // Use the new payment routes

async function startServer() {
  await setupDatabase(); // Run schema setup before starting the server
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

startServer();