const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { checkOwnership } = require("../middleware/roleCheck");
const { uploadLimiter } = require("../middleware/rateLimit");
const {
  getDocument,
  downloadDocument,
  previewDocument,
  deleteDocument,
} = require("../controllers/documentController");

// All routes require authentication
router.use(protect);

// Apply rate limiting to document operations
router.use(uploadLimiter);

// Get document details
router.get("/:id", checkOwnership, getDocument);

// Download document
router.get("/:id/download", checkOwnership, downloadDocument);

// Preview document
router.get("/:id/preview", checkOwnership, previewDocument);

// Delete document
router.delete("/:id", checkOwnership, deleteDocument);

module.exports = router;
