const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "Profile Picture",
        "Driver's License",
        "Work Authorization",
        "OPT Receipt",
        "OPT EAD",
        "I-983",
        "I-20",
      ],
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileSize: Number,
    mimeType: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    feedback: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Document", DocumentSchema);
