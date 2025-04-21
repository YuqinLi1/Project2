const { asyncHandler } = require("../utils/errorHandler");
const authService = require("../services/authService");
const tokenService = require("../services/tokenService");
const User = require("../models/User");

const register = asyncHandler(async (req, res) => {
  const { username, password, confirmPassword, token } = req.body;

  // Validate input
  if (!username || !password || !confirmPassword || !token) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }

  // Register user
  const { user, token: authToken } = await authService.registerUser(
    { username, password },
    token
  );

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    token: authToken,
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

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
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
      message: "New passwords do not match",
    });
  }

  // Change password
  await authService.changePassword(req.user.id, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

module.exports = {
  register,
  login,
  getMe,
  changePassword,
};
