const express = require("express");
const router = express.Router();
const {
  uploadSingleDocument,
  previewDocument,
  downloadDocument,
  deleteDocument,
  getDocumentsByEmployeeId,
} = require("../controllers/documentController");

const { protect } = require("../middleware/auth");
const { uploadSingleFile } = require("../middleware/fileUpload");

// Upload a single document
router.post("/upload-single", uploadSingleFile("document"), uploadSingleDocument);

// Get all documents for a specific employee
router.get("/employee/:employeeId", protect, getDocumentsByEmployeeId);

router.get("/preview", previewDocument);
router.get("/download", downloadDocument);

// Delete a document
router.delete("/:id", protect, deleteDocument);

module.exports = router;