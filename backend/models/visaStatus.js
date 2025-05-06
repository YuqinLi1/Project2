const mongoose = require("mongoose");

const VisaStatusSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    isPermanentResident: {
      type: Boolean,
      required: true,
    },
    visaType: {
      type: String,
      enum: [
        "Green Card",
        "Citizen",
        "H1-B",
        "L2",
        "F1(CPT/OPT)",
        "H4",
        "Other",
        null,
      ],
      default: null,
    },
    visaTitle: {
      type: String,
      // Required only if visaType is 'Other'
      required: function () {
        return this.visaType === "Other";
      },
    },
    startDate: Date,
    endDate: Date,
    documents: [
      {
        type: {
          type: String,
          enum: ["OPT Receipt", "OPT EAD", "I-983", "I-20"],
        },
        fileName: String,
        fileUrl: String,
        fileSize: Number,
        mimeType: String,
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        feedback: String,
        uploadDate: Date,
        reviewDate: Date,
      },
    ],
    currentStep: {
      type: String,
      enum: ["OPT Receipt", "OPT EAD", "I-983", "I-20", "Completed"],
      default: "OPT Receipt",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("VisaStatus", VisaStatusSchema);
