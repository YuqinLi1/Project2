const { asyncHandler } = require("../utils/errorHandler");
const employeeService = require("../services/employeeService");
const documentService = require("../services/documentService");

const createEmployeeProfile = asyncHandler(async (req, res) => {
  // Create employee profile
  const employee = await employeeService.createEmployee(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: "Employee profile created successfully",
    data: employee,
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

/**
 * @desc    Get employee documents
 * @route   GET /api/employee/documents
 * @access  Private (Employee)
 */
const getEmployeeDocuments = asyncHandler(async (req, res) => {
  // Get employee
  const employee = await employeeService.getEmployeeByUserId(req.user.id);

  // Get documents
  const documents = await documentService.getEmployeeDocuments(employee._id);

  res.status(200).json({
    success: true,
    data: documents,
  });
});

/**
 * @desc    Upload employee document
 * @route   POST /api/employee/documents
 * @access  Private (Employee)
 */
const uploadDocument = asyncHandler(async (req, res) => {
  const { type } = req.body;

  // Validate input
  if (!type) {
    return res.status(400).json({
      success: false,
      message: "Please provide document type",
    });
  }

  // Get employee
  const employee = await employeeService.getEmployeeByUserId(req.user.id);

  // Create document
  const document = await documentService.createDocument({
    employeeId: employee._id,
    type,
    fileName: req.fileInfo.fileName,
    fileUrl: req.fileInfo.fileUrl,
    fileSize: req.fileInfo.fileSize,
    mimeType: req.fileInfo.mimeType,
    status: "pending",
  });

  res.status(201).json({
    success: true,
    message: "Document uploaded successfully",
    data: document,
  });
});

module.exports = {
  createEmployeeProfile,
  getEmployeeProfile,
  getMyProfile,
  updateEmployeeProfile,
  submitOnboardingApplication,
  getEmployeeDocuments,
  uploadDocument,
};
