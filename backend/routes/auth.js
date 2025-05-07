const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const {
  validateRequest,
  sanitizeBody,
  validateEmail,
} = require("../middleware/validation");
const { check } = require("express-validator");
const {
  register,
  login,
  getMe,
  changePassword,
  verifyToken,
} = require("../controllers/authController");

// Register a new user
router.post(
  "/register",
  [
    sanitizeBody,
    check("username", "Username is required").not().isEmpty(),
    check("email", "Email is required").not().isEmpty(),
    check("password", "Password is required").not().isEmpty(),
    //check("token", "Registration token is required").not().isEmpty(),
    validateRequest,
  ],
  register
);

router.post(
  "/verify-token",
  [
    sanitizeBody,
    check("token", "Token is required").not().isEmpty(),
    validateRequest,
  ],
  verifyToken
);

// Login user
router.post(
  "/login",
  [
    sanitizeBody,
    check("username", "Username is required").not().isEmpty(),
    check("password", "Password is required").not().isEmpty(),
    validateRequest,
  ],
  login
);

// Get current user profile
router.get("/me", protect, getMe);

// Change password
router.put(
  "/change-password",
  [
    protect,
    sanitizeBody,
    check("currentPassword", "Current password is required").not().isEmpty(),
    check("confirmPassword", "Confirm password is required").not().isEmpty(),
    validateRequest,
  ],
  changePassword
);

module.exports = router;
