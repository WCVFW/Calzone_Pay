import express from "express";
import multer from "multer";
import path from "path";
import pool from "./db.js";
import fs from "fs/promises";
import { protect } from "./authMiddleware.js";

const router = express.Router();

const UPLOADS_DIR = "uploads/";

// Ensure the uploads directory exists
fs.mkdir(UPLOADS_DIR, { recursive: true }).catch(console.error);

// --- Multer Setup for Storing Files on Disk ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    // Create a unique filename to prevent overwrites
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images and PDFs are allowed."), false);
    }
  },
});

// Middleware to handle multer errors gracefully
const handleUpload = (req, res, next) => {
  const uploader = upload.fields([
    { name: "aadhaarFile", maxCount: 1 },
    { name: "panFile", maxCount: 1 },
    { name: "addressFile", maxCount: 1 },
  ]);

  uploader(req, res, function (err) {
    if (err) {
      // This will catch file filter errors and file size limit errors.
      return res.status(400).json({ message: err.message });
    }
    // Everything went fine, proceed to the next middleware.
    next();
  });
};

// POST /api/kyc/submit-all
router.post(
  "/submit-all",
  protect, // Ensures the user is logged in
  handleUpload, // Use the new error-handling middleware
  async (req, res) => {
    // --- DEBUG LOGGING: Check what the server is receiving ---
    console.log("--- KYC Submission Received ---");
    console.log("User ID:", req.user.id);
    console.log("Body (text fields):", req.body);
    console.log("Files (uploaded files):", req.files);
    console.log("-----------------------------");
    // --- END DEBUG LOGGING ---

    const { aadhaar, pan, address } = req.body;
    const userId = req.user.id;

    // --- Improved Validation ---
    // Provide specific feedback about what is missing.
    if (!aadhaar) {
      return res.status(400).json({ message: "Aadhaar number is required." });
    } else {
      // Validate Aadhaar format (12 digits)
      if (!/^\d{12}$/.test(aadhaar.replace(/\s/g, ""))) {
        return res.status(400).json({ message: "Invalid Aadhaar number format. It must be 12 digits." });
      }
    }
    if (!pan) {
      return res.status(400).json({ message: "PAN number is required." });
    } else {
      // Validate PAN format (e.g., ABCDE1234F)
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase())) {
        return res.status(400).json({ message: "Invalid PAN number format." });
      }
    }
    if (!address) {
      return res.status(400).json({ message: "Address is required." });
    }
    if (!req.files) {
      return res.status(400).json({ message: "No files were uploaded." });
    }
    if (!req.files.aadhaarFile) {
      return res.status(400).json({ message: "Aadhaar document file is required." });
    }
    if (!req.files.panFile) {
      return res.status(400).json({ message: "PAN document file is required." });
    }
    if (!req.files.addressFile) {
      return res.status(400).json({ message: "Address document file is required." });
    }

    let conn;
    try {
      conn = await pool.getConnection();
      
      // Helper function to create a clean metadata object for storage
      const createFileMeta = (file) => {
        return JSON.stringify({
          originalname: file.originalname,
          mimetype: file.mimetype,
          filename: file.filename,
          path: file.path.replace(/\\/g, "/"), // Normalize path for consistency
          size: file.size,
        });
      };
      const aadhaarFileMeta = createFileMeta(req.files.aadhaarFile[0]);
      const panFileMeta = createFileMeta(req.files.panFile[0]);
      const addressFileMeta = createFileMeta(req.files.addressFile[0]);

      // Use a transaction to ensure both operations succeed or fail together
      await conn.beginTransaction();

      // Insert or update the kyc table.
      // ON DUPLICATE KEY UPDATE is used in case a user resubmits their KYC.
      await conn.execute(
        `INSERT INTO kyc (user_id, aadhaar_number, pan_number, address, aadhaar_file_meta, pan_file_meta, address_file_meta)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           aadhaar_number = VALUES(aadhaar_number),
           pan_number = VALUES(pan_number),
           address = VALUES(address),
           aadhaar_file_meta = VALUES(aadhaar_file_meta),
           pan_file_meta = VALUES(pan_file_meta),
           address_file_meta = VALUES(address_file_meta)`,
        [userId, aadhaar, pan, address, aadhaarFileMeta, panFileMeta, addressFileMeta]
      );

      // Update the kyc_status in the users table
      await conn.execute(
        "UPDATE users SET kyc_status = 'PENDING' WHERE id = ?",
        [
          userId
        ]
      );

      await conn.commit(); // Commit the transaction

      res.status(200).json({ message: "KYC submitted successfully. Awaiting verification." });
    } catch (err) {
      console.error("KYC submission error:", err);
      if (conn) await conn.rollback(); // Rollback on error
      res.status(500).json({ message: "Server error during KYC submission." });
    } finally {
      if (conn) conn.release();
    }
  }
);

// GET /api/kyc/status - Get the current user's KYC status
router.get("/status", protect, async (req, res) => {
  // The user object is already attached by the 'protect' middleware
  // and includes the kyc_status.
  res.json({
    kyc_status: req.user.kyc_status,
  });
});

export default router;