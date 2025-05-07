const Document = require("../models/Document");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const Profile_Types = [
  "Profile Picture",
  "Driver's License",
  "Work Authorization",
  "OPT Receipt",
  "OPT EAD",
  "I-983",
  "I-20",
];

const getDocumentByEmployeeAndType = async (employeeId, type) => {
  return await Document.findOne({ employeeId, type });
};

const getDocumentsByEmployeeId = async (employeeId) => {
  // Updated to fetch all document types for the employee
  return await Document.find({
    employeeId: new mongoose.Types.ObjectId(employeeId),
    type: { $in: Profile_Types },
  }).sort({ createdAt: -1 }); 
};
const getDocumentsByStatus = async (status) => {
  return await Document.find({ status })
    .populate('employeeId', 'firstName lastName email')
    .sort({ createdAt: -1 });
};



const saveUploadedDocument = async ({ employeeId, file, type }) => {
  if (!file) throw new Error("Missing file");

  // Check if a document of this type already exists for the employee
  const existingDocument = await Document.findOne({
    employeeId,
    type,
  });

  // If existing document exists, update it
  if (existingDocument) {
    existingDocument.fileName = file.originalname;
    existingDocument.fileUrl = `uploads/${file.filename}`;
    existingDocument.fileSize = file.size;
    existingDocument.mimeType = file.mimetype;
    existingDocument.status = "pending";

    return await existingDocument.save();
  }

  // Create new document if no existing document
  const newDoc = new Document({
    employeeId,
    type,
    fileName: file.originalname,
    fileUrl: `uploads/${file.filename}`,
    fileSize: file.size,
    mimeType: file.mimetype,
    status: "pending",
  });

  return await newDoc.save();
};

const streamPreviewDocument = async (employeeId, type, res) => {
  const document = await getDocumentByEmployeeAndType(employeeId, type);
  if (!document) throw new Error("Document not found");

  const filePath = path.resolve(document.fileUrl);
  const fileStream = fs.createReadStream(filePath);

  res.setHeader(
    "Content-Type",
    document.mimeType || "application/octet-stream"
  );
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${document.fileName}"`
  );

  fileStream.pipe(res);
};

const streamDownloadDocument = async (employeeId, type, res) => {
  const document = await getDocumentByEmployeeAndType(employeeId, type);
  if (!document) throw new Error("Document not found");

  res.download(path.resolve(document.fileUrl), document.fileName);
};

const updateDocumentStatus = async (documentId, status, feedback) => {
  const document = await Document.findById(documentId);

  if (!document) {
    throw new Error("Document not found");
  }

  document.status = status;
  document.reviewedAt = new Date();

  // Only add feedback for rejected documents
  if (status === "rejected" && feedback) {
    document.feedback = feedback;
  }

  return await document.save();
};

module.exports = {
  getDocumentsByEmployeeId,
  saveUploadedDocument,
  getDocumentByEmployeeAndType,
  streamPreviewDocument,
  streamDownloadDocument,
  updateDocumentStatus,
  Profile_Types,
  getDocumentsByStatus
};
