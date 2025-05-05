const { asyncHandler } = require("../utils/errorHandler");
const employeeService = require("../services/employeeService");
const tokenService = require("../services/tokenService");
const emailService = require("../services/emailService");
const Application = require("../models/Application");
const Token = require("../models/Token");
const Employee = require("../models/Employee");

const getAllEmployees = asyncHandler(async (req, res) => {
  // Get all employees
  const employees = await employeeService.getAllEmployees();

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

  // Send email
  await emailService.sendRegistrationEmail(
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
  });
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

const getPendingOnboardingApplications = asyncHandler(async (req, res) => {
  try {
    console.log("Fetching pending applications");

    // First, check for any applications at all
    const totalApps = await Application.countDocuments({});
    console.log(`Total applications in database: ${totalApps}`);

    // Then check for applications with status pending
    const pendingCount = await Application.countDocuments({
      status: "pending",
    });
    console.log(`Applications with pending status: ${pendingCount}`);

    // List all unique status values in applications
    const uniqueStatuses = await Application.distinct("status");
    console.log("Unique application statuses:", uniqueStatuses);

    // Get applications with pending status
    const applications = await Application.find({ status: "pending" })
      .populate("employeeId", "firstName lastName email")
      .sort({ createdAt: 1 });

    console.log(
      "Pending applications with populated data:",
      applications.map((app) => ({
        id: app._id,
        status: app.status,
        employeeId: app.employeeId?._id || "Not populated",
        name: app.employeeId
          ? `${app.employeeId.firstName} ${app.employeeId.lastName}`
          : "Unknown",
      }))
    );

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error("Error fetching pending applications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending applications",
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
      .populate("employeeId", "firstName lastName email")
      .sort({ createdAt: -1 });

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
      .populate("employeeId", "firstName lastName email")
      .sort({ createdAt: -1 });

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

module.exports = {
  getAllEmployees,
  searchEmployees,
  generateRegistrationToken,
  getRegistrationTokens,
  getPendingOnboardingApplications,
  reviewOnboardingApplication,
  getRejectedOnboardingApplications,
  getApprovedOnboardingApplications,
  syncApplicationsWithEmployees,
};
