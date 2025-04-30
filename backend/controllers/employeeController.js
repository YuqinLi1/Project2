const { asyncHandler } = require("../utils/errorHandler");
const employeeService = require("../services/employeeService");
const Employee = require("../models/Employee");  // ✅ ADD THIS
const Document = require("../models/Document")

//employeeController

const checkEmployeeStatusByEmail = asyncHandler(async (req, res) => {
  const email = req.user.email; // ✅ Already verified and attached by protect middleware

  if (!email) {
    return res.status(400).json({ success: false, message: "Email not found in user" });
  }
  console.log("check 10" +email);
  const employee = await Employee.findOne({ email });

  console.log("check 11 " +employee);

  console.log("check 22 " + employee.onboardingStatus);

  if (!employee) {
    return res.status(200).json({
      success: true,
      status: "never submitted",
      data: null,
      documents: [],
    });
  }

  const documents = await Document.find({ employeeId: employee._id }).select("type fileName _id");
  console.log("check 13 " + documents);

  return res.status(200).json({
    success: true,
    status: employee.onboardingStatus || "never submitted",
    data: employee,
    documents,
  });
});

const createEmployeeProfile = asyncHandler(async (req, res) => {
  // Create employee profile
  const employee = await employeeService.createEmployee(req.body, req.user.id);
  console.log("check 1 "+employee);

  res.status(201).json({
    success: true,
    message: "Employee profile created successfully",
    employeeId: employee._id,  // <-- important for frontend
  });
});

const getEmployeeProfile = asyncHandler(async (req, res) => {
  // Get employee profile
  const employee = await employeeService.getEmployeeById(req.params.id);

  res.status(200).json({
    success: true,
    data: employee,
  });
});

/**
 * @desc    Get current employee profile
 * @route   GET /api/employee/me
 * @access  Private (Employee)
 */
const getMyProfile = asyncHandler(async (req, res) => {
  // Get employee profile
  const employee = await employeeService.getEmployeeByUserId(req.user.id);

  res.status(200).json({
    success: true,
    data: employee,
  });
});

const updateEmployeeProfile = asyncHandler(async (req, res) => {
  // Update employee profile
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
  // Get employee
  const employee = await employeeService.getEmployeeByUserId(req.user.id);

  // Submit onboarding application
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
  checkEmployeeStatusByEmail,
  createEmployeeProfile,
  getEmployeeProfile,
  getMyProfile,
  updateEmployeeProfile,
  submitOnboardingApplication,
};
