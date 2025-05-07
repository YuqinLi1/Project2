const { asyncHandler } = require("../utils/errorHandler");
const authService = require("../services/authService");
const tokenService = require("../services/tokenService");
const User = require("../models/User");

const register = asyncHandler(async (req, res) => {
  const { username, email, password, token } = req.body;

  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  // Token validation should be conditional (only if token is provided)
  if (token) {
    try {
      // Validate token (if token service is implemented)
      const tokenDoc = await tokenService.validateRegistrationToken(token);

      // Check if the email from token matches the registration email
      if (tokenDoc.email !== email) {
        return res.status(400).json({
          success: false,
          message: "Email doesn't match the registration token",
        });
      }

      // Mark token as used
      await tokenService.markTokenAsUsed(token);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Invalid or expired token",
      });
    }
  }

  // Continue with registration even if token is not provided
  const { user } = await authService.registerUser({
    username,
    email,
    password,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide username and password",
    });
  }

  // Login user
  const { user, token } = await authService.loginUser(username, password);

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Validate input
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  // Check if new passwords match
  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
    });
  }

  // Change password
  await authService.changePassword(req.user.id, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

const verifyToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token is required",
    });
  }

  try {
    // Use your token service to verify the token
    const tokenDoc = await tokenService.validateRegistrationToken(token);

    res.status(200).json({
      success: true,
      email: tokenDoc.email,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Invalid or expired token",
    });
  }
});

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  verifyToken,
};
