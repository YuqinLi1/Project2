const { asyncHandler } = require("../utils/errorHandler");
const employeeService = require("../services/employeeService");
const tokenService = require("../services/tokenService");
const emailService = require("../services/emailService");
const Application = require("../models/Application");
const Token = require("../models/Token");
const Employee = require("../models/Employee");
const VisaStatus = require("../models/visaStatus");

const getAllEmployees = asyncHandler(async (req, res) => {
  // Get all employees
  const employees = await Employee.find()
    .populate("visaType")
    .sort({ lastName: 1, firstName: 1 });

  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees,
  });
});

const searchEmployees = asyncHandler(async (req, res) => {
  const { term } = req.query;

  // Search employees
  const employees = await employeeService.searchEmployees(term);

  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees,
  });
});

const generateRegistrationToken = asyncHandler(async (req, res) => {
  const { email, name } = req.body;

  // Validate input
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please provide email",
    });
  }

  // Create token
  const tokenDoc = await tokenService.createRegistrationToken(email, name);

  try {
    // Send email via Ethereal
    const emailResult = await emailService.sendRegistrationEmail(
      email,
      name || "New Employee",
      tokenDoc.token
    );

    res.status(201).json({
      success: true,
      message: "Registration token generated and email sent successfully",
      data: {
        token: tokenDoc.token,
        email: tokenDoc.email,
        name: tokenDoc.name,
        expiresAt: tokenDoc.expiresAt,
      },
      emailPreview: emailResult.previewUrl, // Include the preview URL in response
    });
  } catch (error) {
    console.error("Error sending email:", error);

    res.status(201).json({
      success: true,
      message: "Registration token generated but email could not be sent",
      data: {
        token: tokenDoc.token,
        email: tokenDoc.email,
        name: tokenDoc.name,
        expiresAt: tokenDoc.expiresAt,
      },
    });
  }
});

const getRegistrationTokens = asyncHandler(async (req, res) => {
  // Get tokens
  const tokens = await Token.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tokens.length,
    data: tokens,
  });
});

const resendRegistrationEmail = asyncHandler(async (req, res) => {
  const tokenId = req.params.id;

  // Find token
  const token = await Token.findById(tokenId);

  if (!token) {
    return res.status(404).json({
      success: false,
      message: "Token not found",
    });
  }

  if (token.isUsed) {
    return res.status(400).json({
      success: false,
      message: "Token has already been used",
    });
  }

  if (token.expiresAt < new Date()) {
    return res.status(400).json({
      success: false,
      message: "Token has expired",
    });
  }

  try {
    // Send email
    await emailService.sendRegistrationEmail(
      token.email,
      token.name || "New Employee",
      token.token
    );

    res.status(200).json({
      success: true,
      message: "Registration email resent successfully",
    });
  } catch (error) {
    console.error("Error resending email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend registration email",
    });
  }
});

// Revoke registration token
const revokeRegistrationToken = asyncHandler(async (req, res) => {
  const tokenId = req.params.id;

  // Find and update token
  const token = await Token.findById(tokenId);

  if (!token) {
    return res.status(404).json({
      success: false,
      message: "Token not found",
    });
  }

  if (token.isUsed) {
    return res.status(400).json({
      success: false,
      message: "Token has already been used",
    });
  }

  // Set token to expire now
  token.expiresAt = new Date();
  await token.save();

  res.status(200).json({
    success: true,
    message: "Token revoked successfully",
  });
});

const getPendingOnboardingApplications = asyncHandler(async (req, res) => {
  try {
    // Get employees with pending onboarding status directly
    const employees = await Employee.find({ onboardingStatus: "pending" }).sort(
      { lastName: 1, firstName: 1 }
    );

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    console.error("Error fetching pending employees:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending employees",
      error: error.message,
    });
  }
});

const syncApplicationsWithEmployees = asyncHandler(async (req, res) => {
  try {
    console.log("Starting application sync with employees");

    // Find all employees with pending status
    const pendingEmployees = await Employee.find({
      onboardingStatus: "pending",
    });
    console.log(
      `Found ${pendingEmployees.length} employees with pending status`
    );

    const created = [];

    // Create applications for each employee
    for (const employee of pendingEmployees) {
      // Check if application already exists
      const existingApp = await Application.findOne({
        employeeId: employee._id,
      });

      if (existingApp) {
        console.log(`Application already exists for employee ${employee._id}`);
        // Update status if needed
        if (existingApp.status !== "pending") {
          existingApp.status = "pending";
          await existingApp.save();
        }
      } else {
        // Create new application
        const newApp = await Application.create({
          employeeId: employee._id,
          status: "pending",
        });

        created.push({
          applicationId: newApp._id,
          employeeId: employee._id,
          name: `${employee.firstName} ${employee.lastName}`,
          email: employee.email,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Created ${created.length} new applications`,
      created,
    });
  } catch (error) {
    console.error("Error syncing applications:", error);
    res.status(500).json({
      success: false,
      message: "Error syncing applications with employees",
      error: error.message,
    });
  }
});
const reviewOnboardingApplication = asyncHandler(async (req, res) => {
  const { status, feedback } = req.body;

  // Validate input
  if (!status || !["approved", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid status (approved/rejected)",
    });
  }

  // Review application
  const application = await employeeService.reviewOnboardingApplication(
    req.params.id,
    status,
    feedback,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: `Application ${status} successfully`,
    data: application,
  });
});

const getRejectedOnboardingApplications = asyncHandler(async (req, res) => {
  try {
    // Get applications
    const applications = await Application.find({ status: "rejected" })
      .populate({
        path: "employeeId",
        select:
          "firstName lastName email ssn dateOfBirth gender contactInfo currentAddress isPermanentResident residencyType visaType startDate endDate",
      })
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error("Error fetching rejected applications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching rejected applications",
      error: error.message,
    });
  }
});

const getApprovedOnboardingApplications = asyncHandler(async (req, res) => {
  try {
    // Get applications
    const applications = await Application.find({ status: "approved" })
      .populate({
        path: "employeeId",
        select:
          "firstName lastName email ssn dateOfBirth gender contactInfo currentAddress isPermanentResident residencyType visaType startDate endDate",
      })
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error("Error fetching approved applications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching approved applications",
      error: error.message,
    });
  }
});

const updateEmployeeOnboardingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { onboardingStatus, onboardingFeedback } = req.body;

  // Validate input
  if (
    !onboardingStatus ||
    !["approved", "rejected"].includes(onboardingStatus)
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid status (approved/rejected)",
    });
  }

  if (onboardingStatus === "rejected" && !onboardingFeedback) {
    return res.status(400).json({
      success: false,
      message: "Feedback is required when rejecting an application",
    });
  }

  try {
    // Find the employee
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Update the onboarding status
    employee.onboardingStatus = onboardingStatus;

    // Add feedback if provided
    if (onboardingFeedback) {
      employee.onboardingFeedback = onboardingFeedback;
    }

    // Save the changes
    await employee.save();

    // Create an application record if one doesn't exist (optional)
    const existingApplication = await Application.findOne({ employeeId: id });

    if (!existingApplication) {
      await Application.create({
        employeeId: id,
        status: onboardingStatus,
        feedback: onboardingFeedback || "",
      });
    } else {
      // Update existing application
      existingApplication.status = onboardingStatus;
      if (onboardingFeedback) {
        existingApplication.feedback = onboardingFeedback;
      }
      await existingApplication.save();
    }

    // Send notification to employee (optional)
    try {
      const emailResult = await emailService.sendStatusUpdateEmail(
        employee.email,
        employee.firstName,
        onboardingStatus,
        onboardingFeedback
      );
    } catch (emailError) {
      console.error("Error sending email notification:", emailError);
      // Continue with the response even if email fails
    }

    res.status(200).json({
      success: true,
      message: `Employee onboarding status updated to ${onboardingStatus}`,
      data: {
        _id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        onboardingStatus: employee.onboardingStatus,
      },
    });
  } catch (error) {
    console.error("Error updating employee onboarding status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update employee onboarding status",
      error: error.message,
    });
  }
});

module.exports = {
  getAllEmployees,
  searchEmployees,
  generateRegistrationToken,
  getRegistrationTokens,
  resendRegistrationEmail,
  revokeRegistrationToken,
  getPendingOnboardingApplications,
  reviewOnboardingApplication,
  getRejectedOnboardingApplications,
  getApprovedOnboardingApplications,
  syncApplicationsWithEmployees,
  updateEmployeeOnboardingStatus,
};
