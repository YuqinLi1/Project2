const path = require("path");
const fs = require("fs").promises;
const Document = require("../models/Document");
const VisaStatus = require("../models/VisaStatus");
const { deleteFile } = require("../utils/fileUpload");
const { asyncHandler } = require("../utils/errorHandler");

//DocumentService

const createDocument = async (documentData) => {
  return await Document.create(documentData);
};

const getDocumentById = async (documentId) => {
  const document = await Document.findById(documentId);

  if (!document) {
    throw new Error("Document not found");
  }

  return document;
};

const getEmployeeDocuments = async (employeeId, type = null) => {
  const query = { employeeId };

  if (type) {
    query.type = type;
  }

  return await Document.find(query).sort({ createdAt: -1 });
};

const updateDocument = async (documentId, updateData) => {
  const document = await Document.findByIdAndUpdate(documentId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!document) {
    throw new Error("Document not found");
  }

  return document;
};

const reviewVisaDocument = async (documentId, status, feedback, reviewerId) => {
  const document = await Document.findById(documentId);

  if (!document) {
    throw new Error("Document not found");
  }

  // Update document status
  document.status = status;
  document.feedback = feedback || "";
  document.reviewedBy = reviewerId;
  document.reviewedAt = new Date();

  await document.save();

  // If it's a visa document, update the visa status
  if (["OPT Receipt", "OPT EAD", "I-983", "I-20"].includes(document.type)) {
    const visaStatus = await VisaStatus.findOne({
      employeeId: document.employeeId,
    });

    if (visaStatus) {
      // Find the document in visa status
      const docIndex = visaStatus.documents.findIndex(
        (doc) => doc.documentId.toString() === documentId
      );

      if (docIndex !== -1) {
        visaStatus.documents[docIndex].status = status;
        visaStatus.documents[docIndex].feedback = feedback || "";
        visaStatus.documents[docIndex].reviewDate = new Date();

        // Update current step if approved
        if (status === "approved") {
          const nextStepMap = {
            "OPT Receipt": "OPT EAD",
            "OPT EAD": "I-983",
            "I-983": "I-20",
            "I-20": "Completed",
          };

          if (document.type in nextStepMap) {
            visaStatus.currentStep = nextStepMap[document.type];
          }
        }

        await visaStatus.save();
      }
    }
  }

  return document;
};

const deleteDocument = async (documentId) => {
  const document = await Document.findById(documentId);

  if (!document) {
    throw new Error("Document not found");
  }

  // Delete the file
  if (document.fileUrl) {
    await deleteFile(document.fileUrl);
  }

  // Delete the document record
  await Document.findByIdAndDelete(documentId);

  return true;
};

const getDocumentFilePath = async (documentId) => {
  const document = await Document.findById(documentId);

  if (!document || !document.fileUrl) {
    throw new Error("Document or file not found");
  }

  // Extract the file path from the URL
  const filePath = document.fileUrl.replace(/^\/uploads\//, "");
  const fullPath = path.join(__dirname, "../uploads", filePath);

  // Check if file exists
  try {
    await fs.access(fullPath);
    return fullPath;
  } catch (error) {
    throw new Error("File not found on disk");
  }
};

module.exports = {
  createDocument,
  getDocumentById,
  getEmployeeDocuments,
  updateDocument,
  reviewVisaDocument,
  deleteDocument,
  getDocumentFilePath,
};
