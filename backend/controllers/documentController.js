const { asyncHandler } = require("../utils/errorHandler");
const documentService = require("../services/documentService");
const fs = require("fs");
const path = require("path");

//DocumentController

const getDocument = asyncHandler(async (req, res) => {
  // Get document
  const document = await documentService.getDocumentById(req.params.id);

  res.status(200).json({
    success: true,
    data: document,
  });
});

// Upload multiple documents
const uploadMultipleDocuments = asyncHandler(async (req, res) => {
  const { employeeId } = req.body;

  if (!employeeId) {
    return res.status(400).json({ success: false, message: "EmployeeId is required" });
  }

  if (!req.filesInfo || req.filesInfo.length === 0) {
    return res.status(400).json({ success: false, message: "No files uploaded" });
  }

  const types = req.body.types; // types sent as array
  if (!types || types.length !== req.filesInfo.length) {
    return res.status(400).json({ success: false, message: "Mismatch between files and types" });
  }

  const requiredTypes = ["Profile Picture", "Driver's License", "Work Authorization"];
  const uploadedTypes = new Set(types);

  // Check if required documents are uploaded
  const missingTypes = requiredTypes.filter(t => !uploadedTypes.has(t));
  if (missingTypes.length > 0) {
    return res.status(400).json({ success: false, message: "Missing documents: " + missingTypes.join(", ") });
  }

  const documents = [];

  for (let i = 0; i < req.filesInfo.length; i++) {
    const fileInfo = req.filesInfo[i];
    const type = types[i];

    const document = await documentService.createDocument({
      employeeId,
      type,
      fileName: fileInfo.fileName,
      fileUrl: fileInfo.fileUrl,
      fileSize: fileInfo.fileSize,
      mimeType: fileInfo.mimeType,
      status: "pending",
    });

    documents.push(document);
  }

  res.status(201).json({
    success: true,
    message: "Documents uploaded successfully",
    data: documents,
  });
});

// Preview document
const previewDocument = asyncHandler(async (req, res) => {
  // Get document
  const document = await documentService.getDocumentById(req.params.id);

  // Get file path
  const filePath = await documentService.getDocumentFilePath(document._id);

  // Set header for inline viewing
  res.setHeader("Content-Disposition", `inline; filename=${document.fileName}`);
  res.setHeader("Content-Type", document.mimeType);

  // Stream file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

const downloadDocument = asyncHandler(async (req, res) => {
  // Get document
  const document = await documentService.getDocumentById(req.params.id);

  // Get file path
  const filePath = await documentService.getDocumentFilePath(document._id);

  // Set headers
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${document.fileName}`
  );
  res.setHeader("Content-Type", document.mimeType);

  // Stream file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});


const deleteDocument = asyncHandler(async (req, res) => {
  // Delete document
  await documentService.deleteDocument(req.params.id);

  res.status(200).json({
    success: true,
    message: "Document deleted successfully",
  });
});

module.exports = {
  getDocument,
  uploadMultipleDocuments,
  downloadDocument,
  previewDocument,
  deleteDocument,
};
