const { asyncHandler } = require("../utils/errorHandler");
const authService = require("../services/authService");
const tokenService = require("../services/tokenService");
const User = require("../models/User");

const register = asyncHandler(async (req, res) => {
  const { username, email, password} = req.body;

  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }
  console.log("check 2");

  // Register user
  const { user} = await authService.registerUser(
    { username, email, password },
  );

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


module.exports = {
  register,
  login,
  getMe,
};