const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {uploadMultipleFiles } = require("../middleware/fileUpload");
const {
  uploadMultipleDocuments,
  previewDocument,
  downloadDocument,
  deleteDocument,
} = require("../controllers/documentController");

// Protect all routes
router.use(protect);

// Upload multiple files
router.post("/uploadMultiple", uploadMultipleFiles("documents"), uploadMultipleDocuments);

// Preview document
router.get("/:id/preview", previewDocument);

// Download document
router.get("/:id/download", downloadDocument);

// Delete document
router.delete("/:id/delete", deleteDocument);

module.exports = router;