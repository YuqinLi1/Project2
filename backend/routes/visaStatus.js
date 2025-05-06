const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { checkOwnership } = require("../middleware/roleCheck");
const { uploadSingleFile } = require("../middleware/fileUpload");
const { validateRequest, sanitizeBody } = require("../middleware/validation");
const { check } = require("express-validator");
const {
  getVisaStatus,
  getMyVisaStatus,
  reviewVisaDocument,
  getEmployeesWithVisaInProgress,
  sendVisaDocumentNotification,
  getAllVisaStatuses,
  downloadVisaDocument,
  previewVisaDocument,
  uploadVisaDocument,
  getVisaDocumentsByEmployee,
} = require("../controllers/visaController");

// All routes require authentication
router.use(protect);

// Get my visa status
router.get("/me", getMyVisaStatus);

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

// Review visa document
router.put(
  "/document/:id",
  [
    authorize("hr"),
    sanitizeBody,
    check("status", "Status is required").isIn(["approved", "rejected"]),
    validateRequest,
  ],
  reviewVisaDocument
);

// Send notification for next document
router.post(
  "/notify/:id",
  [authorize("hr"), validateRequest],
  sendVisaDocumentNotification
);

// Get visa status by employee ID
router.get("/:id", checkOwnership, getVisaStatus);

router.get("/download", protect, downloadVisaDocument);
router.get("/preview", protect, previewVisaDocument);
router.get('/employee/:employeeId', getVisaDocumentsByEmployee);

module.exports = router;
