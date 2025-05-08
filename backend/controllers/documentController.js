const { asyncHandler } = require("../utils/errorHandler");
const documentService = require("../services/documentService");
const Document = require("../models/Document");
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
    return res
      .status(400)
      .json({ success: false, message: "Employee ID is required" });
  }

  const documents = await documentService.getDocumentsByEmployeeId(employeeId);
  res.status(200).json({ success: true, data: documents });
});

// Upload a single document
const uploadSingleDocument = asyncHandler(async (req, res) => {
  console.log("check 11", req.body, req.file);
  const { employeeId, documentType } = req.body;

  if (!employeeId || !documentType || !req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields or file" });
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
  res
    .status(200)
    .json({ success: true, message: "Document deleted successfully" });
});

const updateDocumentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, feedback } = req.body;

  try {
    // Find document
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Validate that feedback is provided for rejection
    if (status === "rejected" && !feedback) {
      return res.status(400).json({
        success: false,
        message: "Feedback is required when rejecting a document",
      });
    }

    // Update status
    document.status = status;

    // Add feedback if provided
    if (feedback) {
      document.feedback = feedback;
    }

    // Update review date
    document.reviewedAt = new Date();

    // Save changes
    await document.save();

    return res.status(200).json({
      success: true,
      message: `Document status updated to ${status}`,
      data: document,
    });
  } catch (error) {
    console.error("Error updating document status:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating document status",
      error: error.message,
    });
  }
});

// Get documents by status
const getDocumentsByStatus = asyncHandler(async (req, res) => {
  const status = req.params.status;

  if (!status || !["pending", "approved", "rejected"].includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid status parameter" });
  }

  const documents = await documentService.getDocumentsByStatus(status);
  res.status(200).json({ success: true, data: documents });
});

module.exports = {
  getDocument,
  uploadSingleDocument,
  downloadDocument,
  previewDocument,
  deleteDocument,
  getDocumentsByEmployeeId,
  updateDocumentStatus,
  getDocumentsByStatus,
};
