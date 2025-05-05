const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
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
    submittedDocuments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual field to get submission date
ApplicationSchema.virtual("submittedAt").get(function () {
  return this.createdAt;
});

// Virtual field to get review date
ApplicationSchema.virtual("reviewedAt").get(function () {
  if (this.status === "pending") return null;
  return this.updatedAt;
});

module.exports = mongoose.model("Application", ApplicationSchema);
