const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { uploadSingleFile } = require("../middleware/fileUpload");
const {
  checkOwnership,
  checkOnboardingStatus,
} = require("../middleware/roleCheck");
const {
  validateRequest,
  sanitizeBody,
  validateEmail,
  validateSSN,
  validatePhoneNumber,
} = require("../middleware/validation");
const { check } = require("express-validator");
const {
  createEmployeeProfile,
  getEmployeeProfile,
  getMyProfile,
  updateEmployeeProfile,
  submitOnboardingApplication,
  getEmployeeDocuments,
  uploadDocument,
} = require("../controllers/employeeController");

// All routes require authentication
router.use(protect);

// Get current employee profile
router.get("/me", getMyProfile);

// Submit onboarding application
router.post(
  "/onboarding",
  [
    sanitizeBody,
    check("firstName", "First name is required").not().isEmpty(),
    check("lastName", "Last name is required").not().isEmpty(),
    check("ssn", "SSN is required").not().isEmpty(),
    validateSSN,
    check("dateOfBirth", "Date of birth is required").not().isEmpty(),
    check("gender", "Gender is required").not().isEmpty(),
    check("isPermanentResident", "Residency status is required")
      .not()
      .isEmpty(),
    check("currentAddress", "Current address is required").not().isEmpty(),
    check("currentAddress.street", "Street is required").not().isEmpty(),
    check("currentAddress.city", "City is required").not().isEmpty(),
    check("currentAddress.state", "State is required").not().isEmpty(),
    check("currentAddress.zip", "ZIP code is required").not().isEmpty(),
    check("contactInfo.cellPhone", "Cell phone is required").not().isEmpty(),
    validatePhoneNumber("contactInfo.cellPhone"),
    validateRequest,
  ],
  submitOnboardingApplication
);

// Get documents for current employee
router.get("/documents", checkOnboardingStatus, getEmployeeDocuments);

// Upload document
router.post(
  "/documents",
  [
    checkOnboardingStatus,
    uploadSingleFile("document"),
    check("type", "Document type is required").not().isEmpty(),
    validateRequest,
  ],
  uploadDocument
);

// Create an employee profile
router.post(
  "/",
  [
    sanitizeBody,
    check("firstName", "First name is required").not().isEmpty(),
    check("lastName", "Last name is required").not().isEmpty(),
    validateRequest,
  ],
  createEmployeeProfile
);

// Get employee profile by ID
router.get("/:id", checkOwnership, getEmployeeProfile);

// Update employee profile
router.put(
  "/:id",
  [sanitizeBody, checkOwnership, checkOnboardingStatus, validateRequest],
  updateEmployeeProfile
);

module.exports = router;
