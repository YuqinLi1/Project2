const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { checkOwnership } = require("../middleware/roleCheck");
const { uploadSingleFile } = require("../middleware/fileUpload");
const { validateRequest, sanitizeBody } = require("../middleware/validation");
const { check } = require("express-validator");
const {
  getEmployeesWithVisaInProgress,
  sendVisaDocumentNotification,
  getAllVisaStatuses,
  downloadVisaDocument,
  previewVisaDocument,
  uploadVisaDocument,
  getVisaDocumentsByEmployee,
  extractTokenFromQuery,
} = require("../controllers/visaController");

// All routes require authentication
router.use(protect);

// Upload visa document
router.post(
  "/document",
  [
    uploadSingleFile("document"),
    check("documentType", "Document type is required").not().isEmpty(),
    validateRequest,
  ],
  uploadVisaDocument
);

// HR Only routes
router.use("/in-progress", authorize("hr"), getEmployeesWithVisaInProgress);

router.get("/all", authorize("hr"), getAllVisaStatuses);

// Send notification for next document
router.post(
  "/notify/:id",
  [authorize("hr"), validateRequest],
  sendVisaDocumentNotification
);

router.get("/download", downloadVisaDocument);
router.get("/preview", previewVisaDocument);
router.get('/employee/:employeeId', getVisaDocumentsByEmployee);

module.exports = router;
