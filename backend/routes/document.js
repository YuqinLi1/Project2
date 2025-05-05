const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { uploadSingleFile } = require("../middleware/fileUpload");

const {
  getDocument,
  uploadSingleDocument,
  uploadMultipleDocuments,
  previewDocument,
  downloadDocument,
  deleteDocument,
  getDocumentsByEmployeeId,
} = require("../controllers/documentController");

// Public access to preview/download
router.get("/:id/preview", previewDocument);
router.get("/:id/download", downloadDocument);

// Protect all routes below this
router.use(protect);

// Routes for specific document operations
router.get("/employee/:employeeId", getDocumentsByEmployeeId);

// Upload routes
router.post("/upload-single", uploadSingleFile("file"), uploadSingleDocument);

// Document operations by ID - these come last because they use catch-all patterns
router.get("/:id", getDocument);
router.delete("/:id/delete", deleteDocument);

module.exports = router;
