const User = require("../models/User");
const Token = require("../models/Token");
const Employee = require("../models/Employee");
const { createAuthToken } = require("./tokenService");
const bcrypt = require("bcryptjs");

const registerUser = async (userData) => {
  // Remove token validation
  console.log("check 3");

  // Check if username already exists
  const existingUsername = await User.findOne({ username: userData.username });
  if (existingUsername) {
    throw new Error("Username already exists");
  }

  // Create user
  const user = await User.create({
    username: userData.username,
    password: userData.password,
    email: userData.email, // <-- use email from form directly
    role: "employee",
  });

  const authToken = createAuthToken(user);

  return { user, token: authToken };
};

const loginUser = async (username, password) => {
  // Find user
  const user = await User.findOne({ username });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // Generate auth token
  const token = createAuthToken(user);

  return { user, token };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  // Find user
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }

  // Update password
  user.password = newPassword;
  await user.save();

  return true;
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  changePassword,
};
