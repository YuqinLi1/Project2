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
  console.log("check 2 "+req);
  const employeeId = req.user.employeeId;
  console.log("check 3 "+employeeId);

  if (!req.filesInfo || req.filesInfo.length === 0) {
    return res.status(400).json({ success: false, message: "No files uploaded" });
  }

  const documents = [];

  for (const fileInfo of req.filesInfo) {
    const document = await documentService.createDocument({
      employeeId,
      type: "Supporting Document",
      fileName: fileInfo.fileName,
      fileUrl: fileInfo.fileUrl,
      fileSize: fileInfo.fileSize,
      mimeType: fileInfo.mimeType,
      status: "pending",
    });
    documents.push(document);
  }

  res.status(201).json({ success: true, message: "Multiple documents uploaded successfully", data: documents });
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
