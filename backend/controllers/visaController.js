const { asyncHandler } = require("../utils/errorHandler");
const visaService = require("../services/visaService");
const employeeService = require("../services/employeeService");
const emailService = require("../services/emailService");
const VisaStatus = require("../models/VisaStatus");

const getVisaStatus = asyncHandler(async (req, res) => {
  // Get visa status
  const visaStatus = await visaService.getVisaStatus(req.params.id);

  res.status(200).json({
    success: true,
    data: visaStatus,
  });
});

const getMyVisaStatus = asyncHandler(async (req, res) => {
  // Get employee
  const employee = await employeeService.getEmployeeByUserId(req.user.id);

  // Get visa status
  const visaStatus = await visaService.getVisaStatus(employee._id);

  res.status(200).json({
    success: true,
    data: visaStatus,
  });
});

const uploadVisaDocument = asyncHandler(async (req, res) => {
  const { documentType } = req.body;

  // Validate input
  if (!documentType) {
    return res.status(400).json({
      success: false,
      message: "Please provide document type",
    });
  }

  // Get employee
  const employee = await employeeService.getEmployeeByUserId(req.user.id);

  // Add document
  const document = await visaService.addVisaDocument(
    employee._id,
    documentType,
    req.fileInfo
  );

  res.status(201).json({
    success: true,
    message: "Document uploaded successfully",
    data: document,
  });
});

const reviewVisaDocument = asyncHandler(async (req, res) => {
  const { status, feedback } = req.body;

  // Validate input
  if (!status || !["approved", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid status (approved/rejected)",
    });
  }

  // Review document
  const result = await visaService.reviewVisaDocument(
    req.params.id,
    status,
    feedback,
    req.user.id
  );

  // If document was rejected, send email with feedback
  if (status === "rejected" && feedback) {
    const employee = await employeeService.getEmployeeById(
      result.document.employeeId
    );

    await emailService.sendDocumentFeedbackEmail(
      employee.email,
      `${employee.firstName} ${employee.lastName}`,
      result.document.type,
      feedback
    );
  }

  res.status(200).json({
    success: true,
    message: `Document ${status} successfully`,
    data: result,
  });
});

const getEmployeesWithVisaInProgress = asyncHandler(async (req, res) => {
  // Get employees
  const employees = await visaService.getEmployeesWithOPTVisaStatus();

  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees,
  });
});

const sendVisaDocumentNotification = asyncHandler(async (req, res) => {
  // Get employee
  const employee = await employeeService.getEmployeeById(req.params.id);

  // Get visa status
  const visaStatus = await visaService.getVisaStatus(req.params.id);

  // Send notification
  await emailService.sendVisaDocumentNotification(
    employee.email,
    `${employee.firstName} ${employee.lastName}`,
    visaStatus.currentStep
  );

  res.status(200).json({
    success: true,
    message: "Notification sent successfully",
  });
});

const getAllVisaStatuses = asyncHandler(async (req, res) => {
  // Get all visa statuses
  const visaStatuses = await VisaStatus.find()
    .populate("employeeId")
    .sort({ "employeeId.lastName": 1, "employeeId.firstName": 1 });

  res.status(200).json({
    success: true,
    count: visaStatuses.length,
    data: visaStatuses,
  });
});

module.exports = {
  getVisaStatus,
  getMyVisaStatus,
  uploadVisaDocument,
  reviewVisaDocument,
  getEmployeesWithVisaInProgress,
  sendVisaDocumentNotification,
  getAllVisaStatuses,
};
