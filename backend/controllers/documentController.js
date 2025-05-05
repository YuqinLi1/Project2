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
  try {
    // Check for token in query params
    const token = req.query.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // You can set req.user = decoded if needed
      } catch (tokenError) {
        console.error("Invalid token:", tokenError);
        return res
          .status(401)
          .json({ success: false, message: "Invalid token" });
      }
    }

    // Handle document preview based on ID path param or query params
    if (req.params.id) {
      const document = await Document.findById(req.params.id);
      if (!document) {
        return res
          .status(404)
          .json({ success: false, message: "Document not found" });
      }

      // Rest of your code to stream the document
    } else if (req.query.employeeId && req.query.type) {
      // Handle the query parameter approach
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid parameters" });
    }
  } catch (error) {
    console.error("Error in previewDocument:", error);
    res.status(500).json({ success: false, message: error.message });
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

const uploadMultipleDocuments = asyncHandler(async (req, res) => {
  const { employeeId } = req.body;

  if (!employeeId) {
    return res
      .status(400)
      .json({ success: false, message: "EmployeeId is required" });
  }

  if (!req.files || req.files.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No files uploaded" });
  }

  const types = req.body.types; // types sent as array
  if (!types || types.length !== req.files.length) {
    return res
      .status(400)
      .json({ success: false, message: "Mismatch between files and types" });
  }

  const documents = [];

  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    const type = types[i];

    try {
      const savedDoc = await documentService.saveUploadedDocument({
        employeeId,
        type,
        file,
      });

      documents.push(savedDoc);
    } catch (error) {
      console.error(`Error uploading document ${i}:`, error);
      // Continue with the next file even if one fails
    }
  }

  res.status(201).json({
    success: true,
    message: "Documents uploaded successfully",
    data: documents,
  });
});

module.exports = {
  getDocument,
  uploadSingleDocument,
  uploadMultipleDocuments,
  downloadDocument,
  previewDocument,
  deleteDocument,
  getDocumentsByEmployeeId,
};
