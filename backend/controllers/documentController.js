const { asyncHandler } = require("../utils/errorHandler");
const documentService = require("../services/documentService");
const Document = require("../models/Document"); // <-- FIXED: Added import
const fs = require("fs");
const path = require("path");

// Get a single document
const getDocument = asyncHandler(async (req, res) => {
  const document = await documentService.getDocumentById(req.params.id);
  res.status(200).json({ success: true, data: document });
});

// Get all documents for a specific employee
const getDocumentsByEmployeeId = asyncHandler(async (req, res) => {
  const employeeId = req.params.employeeId;

  if (!employeeId) {
    return res.status(400).json({ success: false, message: "Employee ID is required" });
  }

  const documents = await documentService.getDocumentsByEmployeeId(employeeId);
  res.status(200).json({ success: true, data: documents });
});

// Upload a single document
const uploadSingleDocument = asyncHandler(async (req, res) => {
  console.log("check 11", req.body, req.file); 
  const { employeeId, documentType } = req.body;

  if (!employeeId || !documentType || !req.file) {
    return res.status(400).json({ success: false, message: "Missing required fields or file" });
  }

  try {
    const savedDoc = await documentService.saveUploadedDocument({
      employeeId,
      type: documentType,
      file: req.file,
    });

    res.status(200).json({ success: true, data: savedDoc });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Preview a document
const previewDocument = async (req, res) => {
  const { employeeId, type } = req.query;
  try {
    await documentService.streamPreviewDocument(employeeId, type, res);
  } catch (error) {
    console.error("Error in previewDocument:", error);
    res.status(500).json({ message: error.message });
  }
};

// Download a document
const downloadDocument = async (req, res) => {
  const { employeeId, type } = req.query;
  try {
    await documentService.streamDownloadDocument(employeeId, type, res);
  } catch (error) {
    console.error("Error in downloadDocument:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a document
const deleteDocument = asyncHandler(async (req, res) => {
  await documentService.deleteDocument(req.params.id);
  res.status(200).json({ success: true, message: "Document deleted successfully" });
});

module.exports = {
  getDocument,
  uploadSingleDocument,
  downloadDocument,
  previewDocument,
  deleteDocument,
  getDocumentsByEmployeeId,
};