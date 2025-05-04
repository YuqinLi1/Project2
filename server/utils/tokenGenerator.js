const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

const generateJWT = (
  payload,
  secret = process.env.JWT_SECRET,
  options = {}
) => {
  return jwt.sign(payload, secret, {
    expiresIn: "1d",
    ...options,
  });
};

const verifyJWT = (token, secret = process.env.JWT_SECRET) => {
  return jwt.verify(token, secret);
};

module.exports = {
  generateRandomToken,
  generateJWT,
  verifyJWT,
};
