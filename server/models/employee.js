const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  building: String,
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
});

const ContactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  middleName: String,
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email",
    ],
  },
  relationship: {
    type: String,
    required: true,
  },
});

const EmployeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    middleName: String,
    preferredName: String,
    profilePicture: String,
    currentAddress: {
      type: AddressSchema,
      required: true,
    },
    contactInfo: {
      cellPhone: {
        type: String,
        required: true,
      },
      workPhone: String,
    },
    email: {
      type: String,
      required: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    ssn: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "i do not wish to answer"],
      required: true,
    },
    isPermanentResident: {
      type: Boolean,
      required: true,
    },
    residencyType: {
      type: String,
      enum: ["Green Card", "Citizen", null],
      default: null,
    },
    reference: ContactSchema,
    emergencyContacts: [ContactSchema],
    onboardingStatus: {
      type: String,
      enum: ["never submitted", "pending", "approved", "rejected"],
      default: "never submitted",
    },
    onboardingFeedback: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Employee", EmployeeSchema);
