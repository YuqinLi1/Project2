const { upload, getFileInfo } = require("../utils/fileUpload");
const { asyncHandler } = require("../utils/errorHandler");

// Upload single file
const uploadSingleFile = (fieldName) =>
  asyncHandler(async (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);

    uploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: `No file uploaded for ${fieldName}`,
        });
      }

      req.fileInfo = getFileInfo(req.file);
      next();
    });
  });

// Upload multiple files (improved flexibility)
const uploadMultipleFiles = (fieldName, maxCount = 10) =>
  asyncHandler(async (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);

    uploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: `No files uploaded for ${fieldName}`,
        });
      }

      req.filesInfo = req.files.map((file) => getFileInfo(file));
      next();
    });
  });

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
};