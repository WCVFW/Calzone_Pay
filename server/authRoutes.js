import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "./db.js";
import crypto from "crypto";
import { sendPasswordResetEmail } from "./emailService.js";
import { protect } from "./authMiddleware.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// A simple password strength check (e.g., at least 8 characters)
const isPasswordStrong = (password) => {
  return password && password.length >= 8;
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!isPasswordStrong(password)) {
    return res.status(400).json({ message: "Password must be at least 8 characters long." });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Check if user already exists
    const [existingUser] = await conn.execute("SELECT id FROM users WHERE email = ? OR phone = ?", [email, phone]);
    if (existingUser.length > 0) {
      // It's slightly better for security to not reveal which field is taken.
      // However, for user experience, separate messages can be better.
      // Sticking with a generic one for now.
      return res.status(409).json({ message: "An account with this email or phone number already exists." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const [result] = await conn.execute("INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)", [name, email, phone, hashedPassword]);

    res.status(201).json({ message: "User registered successfully", userId: result.insertId });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ message: "Server error during registration" });
  } finally {
    if (conn) conn.release();
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const [users] = await conn.execute("SELECT id, name, email, phone, password, role, kyc_status FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      // To prevent user enumeration attacks, use the same response for non-existent user and wrong password.
      return res.status(401).json({ message: "Invalid credentials" }); // User not found
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const payload = { userId: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, kyc_status: user.kyc_status },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/auth/me - Get the currently logged-in user
router.get("/me", protect, async (req, res) => {
  // The 'protect' middleware has now attached the full user object from the database.
  if (!req.user) {
    return res.status(404).json({ message: "User not found." });
  }

  console.log(`[AUTH] Fetched current user: ${req.user.email}`);
  // The user object from the middleware is complete, so we can send it directly.
  // It includes id, name, email, phone, role, and kyc_status.
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    role: req.user.role,
    kyc_status: req.user.kyc_status,
  });
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Basic email format validation
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  console.log(`[AUTH] Received forgot password request for email: ${email}`);
  let conn;
  try {
    conn = await pool.getConnection();
    const [users] = await conn.execute("SELECT id, email, password_reset_expires FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      // IMPORTANT: Always send a success-like response to prevent user enumeration.
      console.log(`[AUTH] Password reset attempt for non-existent email: ${email}`);
      return res.json({ message: "If an account with that email exists, a password reset link has been sent." });
    }

    const user = users[0];

    // Prevent spamming: check if a reset was requested recently (e.g., within the last hour)
    if (user.password_reset_expires && new Date(user.password_reset_expires) > new Date()) {
      console.log(`[AUTH] Password reset attempt too soon for email: ${email}`);
      // Still return the generic message to not give away information.
      return res.json({ message: "If an account with that email exists, a password reset link has been sent." });
    }

    // Generate a secure token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set token expiry to 1 hour from now
    const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save the hashed token and expiry date to the user's record
    await conn.execute("UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?", [passwordResetToken, passwordResetExpires, user.id]);

    // Send the email with the non-hashed token
    console.log(`[AUTH] Sending password reset email to ${user.email}`);
    await sendPasswordResetEmail(user.email, resetToken);

    res.json({ message: "If an account with that email exists, a password reset link has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(500).json({ message: "Server error during password reset process." });
  } finally {
    if (conn) conn.release();
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: "Token and new password are required." });
  }

  if (!isPasswordStrong(password)) {
    return res.status(400).json({ message: "Password must be at least 8 characters long." });
  }

  let conn;
  try {
    // Hash the token from the request to match the one in the database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    conn = await pool.getConnection();
    // Find the user by the hashed token and check if it has not expired
    const [users] = await conn.execute("SELECT id FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW()", [hashedToken]);

    if (users.length === 0) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired." });
    }

    const user = users[0];

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the user's password and clear the reset token fields
    await conn.execute("UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?", [hashedPassword, user.id]);

    res.json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error("Reset password error:", err.message);
    res.status(500).json({ message: "Server error during password reset." });
  } finally {
    if (conn) conn.release();
  }
});

export default router;