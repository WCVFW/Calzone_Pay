import pool from "./db.js"; // Correctly import the database pool from db.js

/**
 * Handles the submission of KYC documents and data.
 * This function is called after the 'protect' and 'upload' middlewares.
 */
export const submitKyc = async (req, res) => {
  // The user ID is available from the 'protect' middleware
  const userId = req.user.id;

  // The form fields are in req.body
  const { aadhaar, pan, address } = req.body;

  // The file paths are in req.files, thanks to the 'upload' middleware
  const aadhaarDocPath = req.files?.aadhaarDoc?.[0]?.path;
  const panDocPath = req.files?.panDoc?.[0]?.path;

  if (!userId || !aadhaar || !pan || !address || !aadhaarDocPath || !panDocPath) {
    return res.status(400).json({ message: "Missing required KYC information or documents." });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction(); // Start a transaction

    // Store KYC data in the 'kyc' table
    await conn.execute(
      "INSERT INTO kyc (user_id, aadhaar, pan, address, document_urls) VALUES (?, ?, ?, ?, ?)",
      [userId, aadhaar, pan, address, JSON.stringify({ aadhaar: aadhaarDocPath, pan: panDocPath })]
    );

    // Update the user's kyc_status to 'PENDING'
    await conn.execute("UPDATE users SET kyc_status = 'PENDING' WHERE id = ?", [userId]);

    await conn.commit(); // Commit the transaction if both queries succeed

    res.status(200).json({ message: "KYC submitted successfully. Your documents are under review." });
  } catch (err) {
    console.error("KYC submission error:", err.message);
    // If an error occurs, roll back the transaction
    if (conn) {
      await conn.rollback();
    }
    res.status(500).json({ message: "Server error during KYC submission." });
  } finally {
    // Ensure the connection is always released back to the pool
    if (conn) {
      conn.release();
    }
  }
};