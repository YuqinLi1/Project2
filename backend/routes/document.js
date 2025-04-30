const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {uploadMultipleFiles } = require("../middleware/fileUpload");

const {
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

router.post("/uploadMultiple", uploadMultipleFiles("documents"), uploadMultipleDocuments);
router.get("/employee/:employeeId", getDocumentsByEmployeeId);
router.delete("/:id/delete", deleteDocument);

module.exports = router;