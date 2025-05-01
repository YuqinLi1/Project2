const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimit");
const {
  validateRequest,
  sanitizeBody,
  validateEmail,
} = require("../middleware/validation");
const { check } = require("express-validator");
const { register, login, getMe } = require("../controllers/authController");

// Rate limit auth routes
router.use(authLimiter);

// Register a new user
router.post(
  "/register",
  [
    sanitizeBody,
    check("username", "Username is required").not().isEmpty(),
    check("password", "password is required").not().isEmpty(),
    check("token", "Registration token is required").not().isEmpty(),
    validateRequest,
  ],
  register
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

module.exports = router;
