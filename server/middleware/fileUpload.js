const { upload, getFileInfo } = require("../utils/fileUpload");
const { asyncHandler } = require("../utils/errorHandler");

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

      // If no file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: `No file uploaded for ${fieldName}`,
        });
      }

      // Add file info to request
      req.fileInfo = getFileInfo(req.file);
      next();
    });
  });

const uploadMultipleFiles = (fieldName) =>
  asyncHandler(async (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, 10); // Max 10 files

    uploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      // If no files were uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: `No files uploaded for ${fieldName}`,
        });
      }

      // Add file info to request
      req.filesInfo = req.files.map((file) => getFileInfo(file));
      next();
    });
  });

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
};
