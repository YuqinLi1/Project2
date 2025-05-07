const visaService = require("../services/visaService");
const employeeService = require("../services/employeeService");
const emailService = require("../services/emailService");
const VisaStatus = require("../models/visaStatus");
const asyncHandler = require("express-async-handler");
const e = require("express");

const updateVisaStatus = asyncHandler(async (req, res) => {
  const { status, feedback } = req.body;
  const { id } = req.params;

  try {
    const updated = await visaService.updateVisaStatus(id, status, feedback);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

const uploadVisaDocument = async (req, res) => {
  const { documentType } = req.body;
  console.log("check 0 ", documentType);

  if (!documentType) {
    return res.status(400).json({
      success: false,
      message: "Please provide document type",
    });
  }

  try {
    const employee = await employeeService.getEmployeeByUserId(req.user.id);
    if (!employee) {
      console.log("check 2: employee not found for user", req.user.id);
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    const document = await visaService.addVisaDocument(
      employee._id,
      documentType,
      req.fileInfo
    );

    console.log("check 3: document uploaded", document);

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: document,
    });
  } catch (error) {
    console.error("check 4: error uploading visa document", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const getEmployeesWithVisaInProgress = asyncHandler(async (req, res) => {
  // Get employees
  const employees = await visaService.getEmployeesWithOPTVisaStatus();

  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees,
  });
});

const getVisaDocumentByType = asyncHandler(async (req, res) => {
  const { employeeId, type } = req.query;
  if (!employeeId || !type) {
    return res
      .status(400)
      .json({ success: false, message: "Missing employeeId or type" });
  }

  const visaStatus = await visaService.getVisaStatus(employeeId);
  if (!visaStatus) {
    return res
      .status(404)
      .json({ success: false, message: "Visa status not found" });
  }

  const doc = visaStatus.documents.find((d) => d.type === type);
  if (!doc) {
    return res
      .status(404)
      .json({ success: false, message: "Document not found" });
  }

  res.status(200).json({ success: true, data: doc });
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

const downloadVisaDocument = asyncHandler(async (req, res) => {
  const { employeeId, type } = req.query;
  await visaService.downloadVisaDocument(employeeId, type, res);
});

const previewVisaDocument = asyncHandler(async (req, res) => {
  const { employeeId, type } = req.query;
  await visaService.previewVisaDocument(employeeId, type, res);
});

const getVisaDocumentsByEmployee = asyncHandler(async (req, res) => {
  const employeeId = req.params.employeeId;
  const docs = await visaService.getVisaDocumentsByEmployeeId(employeeId);
  res.status(200).json({ success: true, data: docs });
});

module.exports = {
  uploadVisaDocument,
  getEmployeesWithVisaInProgress,
  sendVisaDocumentNotification,
  getAllVisaStatuses,
  downloadVisaDocument,
  previewVisaDocument,
  getVisaDocumentsByEmployee,
  getVisaDocumentByType,
};
