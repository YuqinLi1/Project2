const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  validateRequest,
  sanitizeBody,
  validateEmail,
} = require("../middleware/validation");
const { check } = require("express-validator");
const {
  getAllEmployees,
  searchEmployees,
  generateRegistrationToken,
  getRegistrationTokens,
  getPendingOnboardingApplications,
  reviewOnboardingApplication,
} = require("../controllers/hrController");

const {
  getEmployeesWithVisaInProgress,
} = require("../controllers/visaController");

// All routes require HR authentication
router.use(protect);
router.use(authorize("hr"));

// Get all employees
router.get("/employees", getAllEmployees);

// Search employees
router.get("/employees/search", searchEmployees);

// Generate registration token
router.post(
  "/registration-token",
  [
    sanitizeBody,
    check("email", "Valid email is required").isEmail(),
    validateEmail,
    validateRequest,
  ],
  generateRegistrationToken
);

// Get registration tokens history
router.get("/registration-tokens", getRegistrationTokens);

// Get pending onboarding applications
router.get("/onboarding/pending", getPendingOnboardingApplications);

// Review onboarding application
router.put(
  "/onboarding/:id",
  [
    sanitizeBody,
    check("status", "Status is required").isIn(["approved", "rejected"]),
    validateRequest,
  ],
  reviewOnboardingApplication
);

router.get("/visa-management", getEmployeesWithVisaInProgress);

module.exports = router;
