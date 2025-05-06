const VisaStatus = require('../models/visaStatus');
const Employee = require("../models/Employee");
const fs = require("fs");
const path = require("path");

const getEmployeesWithOPTVisaStatus = async () => {
  const visaStatuses = await VisaStatus.find({
    visaType: "F1(CPT/OPT)",
    currentStep: { $ne: "Completed" },
  }).populate("employeeId");

  return visaStatuses;
};

const addVisaDocument = async (employeeId, documentType, fileInfo) => {
  // Step 1: Check employee existence
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new Error("Employee not found");
  }

  // Step 2: Find VisaStatus document for employee
  const visaStatus = await VisaStatus.findOne({ employeeId });
  if (!visaStatus) {
    throw new Error("Visa status not found");
  }

  // Step 3: Enforce current step match (optional, can be removed if not needed)
  if (visaStatus.currentStep !== documentType) {
    throw new Error(`Cannot upload ${documentType} at this time. Current step is ${visaStatus.currentStep}`);
  }

  // Step 4: Push document directly to visaStatus.documents[]
  visaStatus.documents.push({
    type: documentType,
    fileName: fileInfo.fileName,
    fileUrl: fileInfo.fileUrl,
    fileSize: fileInfo.fileSize,
    mimeType: fileInfo.mimeType,
    status: "pending",
    uploadDate: new Date(),
  });

  // Step 5: Save VisaStatus document
  await visaStatus.save();

  return {
    success: true,
    message: "Visa document saved in VisaStatus",
  };
};

const getVisaStatusesNeedingAction = async () => {
  // Find visa statuses with pending documents
  const visaStatuses = await VisaStatus.find({
    "documents.status": "pending",
  }).populate("employeeId");

  return visaStatuses;
};

const getEmployeesWithVisaExpiringSoon = async (daysThreshold = 90) => {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

  const visaStatuses = await VisaStatus.find({
    endDate: { $lte: thresholdDate, $gte: new Date() },
  }).populate("employeeId");

  return visaStatuses;
};

const updateVisaStatus = async (id, status, feedback) => {
  const doc = await VisaStatus.findById(id);
  if (!doc) {
    throw new Error("Visa status record not found");
  }

  doc.status = status;
  doc.feedback = feedback;
  await doc.save();
  return doc;
};

const downloadVisaDocument = async (employeeId, type, res) => {
  const visaStatus = await VisaStatus.findOne({ employeeId });

  if (!visaStatus) {
    return res.status(404).json({ success: false, message: "Visa status not found" });
  }

  const document = visaStatus.documents.find(doc => doc.type === type);
  if (!document) {
    return res.status(404).json({ success: false, message: "Document not found" });
  }

  const filePath = path.resolve(document.fileUrl);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: "File not found on disk" });
  }

  res.download(filePath, document.fileName);
};

const previewVisaDocument = async (req, res) => {
  try {
    const { employeeId, type } = req.query;

    if (!employeeId || !type) {
      return res.status(400).json({ success: false, message: "Missing parameters" });
    }

    const visaStatus = await VisaStatus.findOne({ employeeId });
    if (!visaStatus) {
      return res.status(404).json({ success: false, message: "Visa status not found" });
    }

    const doc = visaStatus.documents.find(d => d.type === type);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    const filePath = path.resolve(doc.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "File not found on disk" });
    }

    res.set("Content-Type", doc.mimeType || "application/octet-stream");
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error("Visa preview error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getVisaDocumentsByEmployeeId = async (employeeId) => {
  const visaStatus = await VisaStatus.findOne({ employeeId });
  if (!visaStatus) {
    throw new Error("Visa status not found");
  }

  return visaStatus.documents.map(d => ({
    type: d.type,
    status: d.status,
    feedback: d.feedback || "",
    fileName: d.fileName,
    fileUrl: d.fileUrl,
    mimeType: d.mimeType,
    uploadDate: d.uploadDate,
    reviewDate: d.reviewDate,
  }));
};

module.exports = {
  getEmployeesWithOPTVisaStatus,
  addVisaDocument,
  updateVisaStatus,
  getVisaStatusesNeedingAction,
  getEmployeesWithVisaExpiringSoon,
  downloadVisaDocument,
  previewVisaDocument,
  getVisaDocumentsByEmployeeId,
};
