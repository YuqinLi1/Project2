const User = require("../models/User");
const Token = require("../models/Token");
const Employee = require("../models/Employee");
const { createAuthToken } = require("./tokenService");
const bcrypt = require("bcryptjs");

const registerUser = async (userData, registrationToken) => {
  // Validate token
  const tokenDoc = await Token.findOne({ token: registrationToken });

  if (!tokenDoc) {
    throw new Error("Invalid registration token");
  }

  if (tokenDoc.isUsed) {
    throw new Error("Registration token has already been used");
  }

  if (tokenDoc.expiresAt < new Date()) {
    throw new Error("Registration token has expired");
  }

  // Check if username already exists
  const existingUsername = await User.findOne({ username: userData.username });
  if (existingUsername) {
    throw new Error("Username already exists");
  }

  // Create user
  const user = await User.create({
    username: userData.username,
    password: userData.password,
    email: tokenDoc.email,
    role: "employee",
  });

  // Mark token as used
  tokenDoc.isUsed = true;
  await tokenDoc.save();

  // Generate auth token
  const authToken = createAuthToken(user);

  return { user, token: authToken };
};

const loginUser = async (username, password) => {
  try {
    // Find user
    console.log("Looking for user with username:", username);
    const user = await User.findOne({ username });

    if (!user) {
      console.log("User not found with username:", username);
      throw new Error("Invalid credentials");
    }

    // Check password
    console.log("Checking password for user:", username);
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.log("Password mismatch for user:", username);
      throw new Error("Invalid credentials");
    }

    // Generate auth token
    console.log("Generating auth token for user:", username);
    const token = createAuthToken(user);

    return { user, token };
  } catch (error) {
    console.error("Error during login process:", error);
    throw error;
  }
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
