import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_APP_USER, // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD, // Your generated App Password
  },
});

/**
 * Verifies the nodemailer connection on startup.
 */
export function verifyEmailConnection() {
  if (process.env.GMAIL_APP_USER && process.env.GMAIL_APP_PASSWORD) {
    transporter.verify()
      .then(() => console.log('📧 Nodemailer ready for sending emails'))
      .catch(err => console.error('Nodemailer config error:', err));
  } else {
    console.warn('⚠️ Nodemailer credentials (GMAIL_APP_USER, GMAIL_APP_PASSWORD) not found in .env file. Email sending will be disabled.');
  }
}

/**
 * Sends a password reset email to the user.
 * @param {string} to - The recipient's email address.
 * @param {string} token - The password reset token.
 */
export async function sendPasswordResetEmail(to, token) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Recharge App" <${process.env.GMAIL_APP_USER}>`,
    to: to,
    subject: 'Password Reset Request',
    html: `<p>You requested a password reset. Click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a><p>This link will expire in 1 hour.</p><p>If you did not request this, please ignore this email.</p>`,
  };

  return transporter.sendMail(mailOptions);
}