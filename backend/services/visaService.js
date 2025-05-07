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

  // Step 3: Push document directly to visaStatus.documents[]
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
  const fileName = res.req.query.file;
  console.log("Check 1", employeeId);
  console.log("Check 2", type);
  console.log("Check 3", fileName);

  const visaStatus = await VisaStatus.findOne(
    { employeeId },
    { documents: { $elemMatch: { type } } } // match by both type and filename
  );
  console.log("Check 4", visaStatus);

  if (!visaStatus || !visaStatus.documents || visaStatus.documents.length === 0) {
    return res.status(404).json({ success: false, message: "Document not found" });
  }

  try{
    const document = visaStatus.documents[0]; // Because $elemMatch returns a single matching element

    console.log("Check 5", document);
  
    const filePath = path.resolve(document.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "File not found on disk" });
    }
    res.download(filePath, document.fileName);
  } catch(error){
    console.log("error ", e);
  }
};

const previewVisaDocument = async (req, res) => {
  try {
    const { employeeId, type } = req.query;

    if (!employeeId || !type) {
      return res.status(400).json({ success: false, message: "Missing parameters" });
    }

    const visaStatus = await VisaStatus.findOne(
      { employeeId },
      { documents: { $elemMatch: { type } } }
    );

    if (!visaStatus || !visaStatus.documents || visaStatus.documents.length === 0) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    const doc = visaStatus.documents[0];

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

const getVisaStatus = async (employeeId) => {visaStatus.documents
  const visaStatus = await VisaStatus.findOne({ employeeId });
  if (!visaStatus) {
    throw new Error("Visa status not found");
  }
  return visaStatus;
};

const getVisaDocumentByEmployeeAndType = async (employeeId, type) => {
  const visaStatus = await VisaStatus.findOne(
    { employeeId },
    { documents: { $elemMatch: { type } } }
  );

  if (!visaStatus || !visaStatus.documents || visaStatus.documents.length === 0) {
    return null;
  }

  return visaStatus.documents[0];
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
  getVisaStatus,
};
