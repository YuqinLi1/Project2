const { asyncHandler } = require("../utils/errorHandler");
const employeeService = require("../services/employeeService");
const Employee = require("../models/Employee");
const Document = require("../models/Document");
const User = require("../models/User");

// @desc Get onboarding status by userId
// @route GET /api/employee/status/:userId
// @access Private
const getOnboardingStatus = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(200).json({ status: "never submit" });
  }

  const employee = await Employee.findOne({ userId });

  if (!employee || !employee.onboardingStatus) {
    return res.status(200).json({ status: "never submit" });
  }

  return res.status(200).json({ status: employee.onboardingStatus });
});

const getEmployeeProfileWithDocuments = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  const employee = await Employee.findOne({ userId });
  if (!employee) {
    return res
      .status(404)
      .json({ success: false, message: "Employee not found" });
  }

  const documents = await Document.find({ employeeId: employee._id }).select(
    "type fileName _id"
  );

  return res.status(200).json({
    success: true,
    status: employee.onboardingStatus || "never submitted",
    data: employee,
    documents,
  });
});

const createEmployeeProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Create the employee with the correct userId
  const employee = await employeeService.createEmployee(
    { ...req.body, userId }, // Ensure userId is included
    userId
  );
  res.status(201).json({
    success: true,
    message: "Employee profile created successfully",
    employeeId: employee._id,
  });
});

const getEmployeeProfile = asyncHandler(async (req, res) => {
  const employee = await employeeService.getEmployeeById(req.params.id);
  res.status(200).json({
    success: true,
    data: employee,
  });
});

const getMyProfile = asyncHandler(async (req, res) => {
  const employee = await employeeService.getEmployeeByUserId(req.user.id);
  res.status(200).json({
    success: true,
    data: employee,
  });
});

const updateEmployeeProfile = asyncHandler(async (req, res) => {
  const employee = await employeeService.updateEmployee(
    req.params.id,
    req.body
  );
  res.status(200).json({
    success: true,
    message: "Employee profile updated successfully",
    data: employee,
  });
});

const submitOnboardingApplication = asyncHandler(async (req, res) => {
  const employee = await employeeService.getEmployeeByUserId(req.user.id);

  const application = await employeeService.submitOnboardingApplication(
    employee._id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Onboarding application submitted successfully",
    data: application,
  });
});

module.exports = {
  getOnboardingStatus,
  getEmployeeProfileWithDocuments,
  createEmployeeProfile,
  getEmployeeProfile,
  getMyProfile,
  updateEmployeeProfile,
  submitOnboardingApplication,
};
