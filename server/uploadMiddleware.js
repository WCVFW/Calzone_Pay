import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "./uploads/";

// Ensure the upload directory exists
fs.mkdirSync(uploadDir, { recursive: true });

// Set up storage engine
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: function (req, file, cb) {
    // Create a unique filename to avoid overwriting files
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Check file type to ensure only images and PDFs are uploaded
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("File type not supported. Please upload an image (JPG, PNG) or a PDF."), false);
};

// Initialize upload variable
const upload = multer({
  storage: storage,
  limits: {
    // Set a file size limit (e.g., 5MB)
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

export default upload;