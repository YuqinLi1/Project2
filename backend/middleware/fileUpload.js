const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });

const uploadSingleFile = (fieldName) => (req, res, next) => {
  const uploader = upload.single(fieldName);
  uploader(req, res, function (err) {
    if (err) {
      console.error("Multer upload error:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed",
      });
    }

    if (!req.file) {
      console.warn("No file received for field", fieldName);
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    req.fileInfo = {
      fileName: req.file.originalname,
      fileUrl: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    };

    next();
  });
};

module.exports = {
  uploadSingleFile,
};