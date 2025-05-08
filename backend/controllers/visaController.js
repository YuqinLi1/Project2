const visaService = require("../services/visaService");
const employeeService = require("../services/employeeService");
const emailService = require("../services/emailService");
const VisaStatus = require("../models/visaStatus");
const asyncHandler = require("express-async-handler");
const e = require("express");
const Employee = require("../models/Employee");

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
  try {
    // Get employee with all visa information
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Determine current step based on visa type
    let currentStep = "document";

    if (employee.visaType === "F1(CPT/OPT)") {
      // Default to OPT Receipt if no other information is available
      currentStep = "OPT Receipt";

      // Check if the employee has a visa status record
      try {
        const visaStatus = await VisaStatus.findOne({
          employeeId: employee._id,
        });
        if (visaStatus && visaStatus.currentStep) {
          currentStep = visaStatus.currentStep;
        }
      } catch (error) {
        console.log("Visa status not found, using default step");
      }
    }

    // Send notification
    await emailService.sendVisaDocumentNotification(
      employee.email,
      `${employee.firstName} ${employee.lastName}`,
      currentStep
    );

    res.status(200).json({
      success: true,
      message: "Notification sent successfully",
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({
      success: false,
      message: "Error sending notification",
      error: error.message,
    });
  }
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
const updateVisaDocumentStatus = asyncHandler(async (req, res) => {
  try {
    const { id, docId } = req.params;
    const { status, feedback } = req.body;

    // Find visa status
    const visaStatus = await VisaStatus.findById(id);

    if (!visaStatus) {
      return res.status(404).json({
        success: false,
        message: "Visa status not found",
      });
    }

    // Find the document in the documents array
    const docIndex = visaStatus.documents.findIndex(
      (doc) => doc._id.toString() === docId
    );

    if (docIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Document not found in visa status",
      });
    }

    // Update the document status
    visaStatus.documents[docIndex].status = status;

    // Add feedback if provided
    if (feedback) {
      visaStatus.documents[docIndex].feedback = feedback;
    }

    // Update review date
    visaStatus.documents[docIndex].reviewDate = new Date();

    // Save changes
    await visaStatus.save();

    res.status(200).json({
      success: true,
      message: `Document status updated to ${status}`,
      data: visaStatus.documents[docIndex],
    });
  } catch (error) {
    console.error("Error updating document status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating document status",
      error: error.message,
    });
  }
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
  updateVisaDocumentStatus,
};
