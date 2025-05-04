const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const randomName = crypto.randomBytes(16).toString("hex");
    cb(null, `${randomName}${fileExt}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, GIF, PDF, DOC, and DOCX files are allowed."));
  }
};

// Multer config
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Utilities
const getFileInfo = (file) => ({
  fileName: file.originalname,
  fileUrl: `/uploads/${file.filename}`,
  fileSize: file.size,
  mimeType: file.mimetype,
});

const deleteFile = async (filePath) => {
  const fullPath = path.join(__dirname, "..", filePath.replace(/^\\//, ""));
  return new Promise((resolve, reject) => {
    fs.unlink(fullPath, (err) => {
      if (err) {
        if (err.code === "ENOENT") resolve(true);
        else reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

// ✅ New: single file middleware
const uploadSingleFile = (fieldName) => upload.single(fieldName);

// Final export
module.exports = {
  upload,
  getFileInfo,
  deleteFile,
  uploadSingleFile,
};