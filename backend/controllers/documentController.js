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

const getDocumentsByEmployeeId = asyncHandler(async (req, res) => {
  const employeeId = req.params.employeeId;

  if (!employeeId) {
    return res.status(400).json({ success: false, message: "Employee ID is required" });
  }

  const documents = await documentService.getDocumentsByEmployeeId(employeeId);

  res.status(200).json({
    success: true,
    data: documents,
  });
});

// Upload single document
const uploadSingleDocument = asyncHandler(async (req, res) => {
  if (!req.file || !req.body.employeeId) {
    return res.status(400).json({ success: false, message: "Missing file or employee ID" });
  }

  const { originalname, mimetype, buffer } = req.file;

  const newDoc = new Document({
    employeeId: req.body.employeeId,
    filename: originalname,
    filetype: mimetype,
    data: buffer,
  });

  const savedDoc = await newDoc.save();
  res.status(200).json({ success: true, data: savedDoc });
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
  uploadSingleDocument,
  downloadDocument,
  previewDocument,
  deleteDocument,
  getDocumentsByEmployeeId,
};
