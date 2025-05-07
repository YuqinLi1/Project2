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
  getRejectedOnboardingApplications,
  getApprovedOnboardingApplications,
  syncApplicationsWithEmployees,
  reviewOnboardingApplication,
  resendRegistrationEmail,
  revokeRegistrationToken,
  updateEmployeeOnboardingStatus,
} = require("../controllers/hrController");

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

router.post("/resend-token/:id", protect, resendRegistrationEmail);
router.put("/revoke-token/:id", protect, revokeRegistrationToken);

router.post("/sync-applications", syncApplicationsWithEmployees);
// Get pending onboarding applications
router.get("/onboarding/pending", getPendingOnboardingApplications);

// Get rejected onboarding applications
router.get("/onboarding/rejected", getRejectedOnboardingApplications);

// Get approved onboarding applications
router.get("/onboarding/approved", getApprovedOnboardingApplications);

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

router.put(
  "/onboarding/:id/status",
  [
    protect,
    authorize("hr"),
    sanitizeBody,
    check("onboardingStatus", "Status is required").isIn([
      "approved",
      "rejected",
    ]),
    validateRequest,
  ],
  updateEmployeeOnboardingStatus
);

module.exports = router;
