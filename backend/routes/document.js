const express = require("express");
const router = express.Router();
const {
  uploadSingleDocument,
  previewDocument,
  downloadDocument,
  deleteDocument,
  getDocumentsByEmployeeId,
} = require("../controllers/documentController");

const { protect } = require("../middleware/authMiddleware");
const { uploadSingleFile } = require("../middleware/fileUpload");

// Upload a single document
router.post("/upload-single", uploadSingleFile("documents"), uploadSingleDocument);

// Get all documents for a specific employee
router.get("/employee/:employeeId", protect, getDocumentsByEmployeeId);

// Preview a document (open in browser)
router.get("/preview/:id", protect, previewDocument);

// Download a document
router.get("/download/:id", protect, downloadDocument);

// Delete a document
router.delete("/:id", protect, deleteDocument);

module.exports = router;