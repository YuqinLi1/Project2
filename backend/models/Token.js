const mongoose = require("mongoose");
const crypto = require("crypto");

const TokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    name: String,
    expiresAt: {
      type: Date,
      required: true,
      // Default to 3 hours from now
      default: function () {
        return new Date(Date.now() + 3 * 60 * 60 * 1000);
      },
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index to automatically expire tokens
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to generate a new token
TokenSchema.statics.generateToken = function (email, name) {
  const token = crypto.randomBytes(32).toString("hex");

  return this.create({
    token,
    email,
    name,
    expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours
  });
};

// Method to check if token is valid
TokenSchema.methods.isValid = function () {
  return !this.isUsed && this.expiresAt > Date.now();
};

module.exports = mongoose.model("Token", TokenSchema);
