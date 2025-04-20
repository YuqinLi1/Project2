const Token = require("../models/Token");
const {
  generateRandomToken,
  generateJWT,
  verifyJWT,
} = require("../utils/tokenGenerator");

const createRegistrationToken = async (email, name) => {
  // Check if there's an active token for this email
  const existingToken = await Token.findOne({
    email,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  // If there's an existing token, return it
  if (existingToken) {
    return existingToken;
  }

  // Generate new token
  const token = generateRandomToken();

  // Create token record
  const newToken = await Token.create({
    token,
    email,
    name,
    expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours
  });

  return newToken;
};

const validateRegistrationToken = async (token) => {
  const tokenDoc = await Token.findOne({ token });

  if (!tokenDoc) {
    throw new Error("Invalid token");
  }

  if (tokenDoc.isUsed) {
    throw new Error("Token has already been used");
  }

  if (tokenDoc.expiresAt < new Date()) {
    throw new Error("Token has expired");
  }

  return tokenDoc;
};

const markTokenAsUsed = async (token) => {
  const tokenDoc = await Token.findOne({ token });

  if (!tokenDoc) {
    throw new Error("Invalid token");
  }

  tokenDoc.isUsed = true;
  await tokenDoc.save();

  return tokenDoc;
};

const createAuthToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  return generateJWT(payload);
};

const verifyAuthToken = (token) => {
  return verifyJWT(token);
};

module.exports = {
  createRegistrationToken,
  validateRegistrationToken,
  markTokenAsUsed,
  createAuthToken,
  verifyAuthToken,
};
