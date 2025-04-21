const { asyncHandler } = require("../utils/errorHandler");
const documentService = require("../services/documentService");
const fs = require("fs");
const path = require("path");

const getDocument = asyncHandler(async (req, res) => {
  // Get document
  const document = await documentService.getDocumentById(req.params.id);

  res.status(200).json({
    success: true,
    data: document,
  });
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
  downloadDocument,
  previewDocument,
  deleteDocument,
};
