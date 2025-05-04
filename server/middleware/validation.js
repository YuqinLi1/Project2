// middleware/validation.js
const { validationResult } = require("express-validator");
const {
  sanitizeText,
  isValidEmail,
  isValidSSN,
  isValidPhoneNumber,
} = require("../utils/validators");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  next();
};

const sanitizeBody = (req, res, next) => {
  if (req.body) {
    // Sanitize text fields to prevent XSS
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitizeText(req.body[key]);
      }
    });
  }

  next();
};

const validateEmail = (req, res, next) => {
  const { email } = req.body;

  if (email && !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  next();
};

const validateSSN = (req, res, next) => {
  const { ssn } = req.body;

  if (ssn && !isValidSSN(ssn)) {
    return res.status(400).json({
      success: false,
      message: "Invalid SSN format (XXX-XX-XXXX)",
    });
  }

  next();
};

const validatePhoneNumber = (field) => (req, res, next) => {
  const phoneNumber = req.body[field];

  if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
    return res.status(400).json({
      success: false,
      message: `Invalid phone number format for ${field}`,
    });
  }

  next();
};

module.exports = {
  validateRequest,
  sanitizeBody,
  validateEmail,
  validateSSN,
  validatePhoneNumber,
};
