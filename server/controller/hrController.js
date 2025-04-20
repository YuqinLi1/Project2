const { asyncHandler } = require("../utils/errorHandler");
const employeeService = require("../services/employeeService");
const tokenService = require("../services/tokenService");
const emailService = require("../services/emailService");

/**
 * @desc    Get all employees
 * @route   GET /api/hr/employees
 * @access  Private (HR)
 */
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
  // Get applications
  const applications = await Application.find({ status: "pending" })
    .populate("employeeId", "firstName lastName email")
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications,
  });
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

module.exports = {
  getAllEmployees,
  searchEmployees,
  generateRegistrationToken,
  getRegistrationTokens,
  getPendingOnboardingApplications,
  reviewOnboardingApplication,
};
