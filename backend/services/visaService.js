const VisaStatus = require("../models/VisaStatus");
const Document = require("../models/Document");
const Employee = require("../models/Employee");
const { sendVisaDocumentNotification } = require("./emailService");

const getVisaStatus = async (employeeId) => {
  const visaStatus = await VisaStatus.findOne({ employeeId });

  if (!visaStatus) {
    throw new Error("Visa status not found");
  }

  return visaStatus;
};

const getEmployeesWithOPTVisaStatus = async () => {
  const visaStatuses = await VisaStatus.find({
    visaType: "F1(CPT/OPT)",
    currentStep: { $ne: "Completed" },
  }).populate("employeeId");

  return visaStatuses;
};

const addVisaDocument = async (employeeId, documentType, fileInfo) => {
  // Check if employee exists
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new Error("Employee not found");
  }

  // Check if visa status exists
  const visaStatus = await VisaStatus.findOne({ employeeId });
  if (!visaStatus) {
    throw new Error("Visa status not found");
  }

  // Check if the document type matches the current step
  if (visaStatus.currentStep !== documentType) {
    throw new Error(
      `Cannot upload ${documentType} at this time. Current step is ${visaStatus.currentStep}`
    );
  }

  // Create document
  const document = await Document.create({
    employeeId,
    type: documentType,
    fileName: fileInfo.fileName,
    fileUrl: fileInfo.fileUrl,
    fileSize: fileInfo.fileSize,
    mimeType: fileInfo.mimeType,
    status: "pending",
  });

  // Add document to visa status
  visaStatus.documents.push({
    documentId: document._id,
    type: documentType,
    status: "pending",
    uploadDate: new Date(),
  });

  await visaStatus.save();

  return document;
};

const reviewVisaDocument = async (documentId, status, feedback, reviewerId) => {
  // Update document
  const document = await Document.findByIdAndUpdate(
    documentId,
    {
      status,
      feedback,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    },
    { new: true }
  );

  if (!document) {
    throw new Error("Document not found");
  }

  // Find visa status
  const visaStatus = await VisaStatus.findOne({
    employeeId: document.employeeId,
    "documents.documentId": documentId,
  });

  if (!visaStatus) {
    throw new Error("Visa status not found");
  }

  // Update document in visa status
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

      if (visaStatus.currentStep in nextStepMap) {
        visaStatus.currentStep = nextStepMap[visaStatus.currentStep];
      }

      // Send notification email for next step if not completed
      if (visaStatus.currentStep !== "Completed") {
        const employee = await Employee.findById(document.employeeId);
        if (employee) {
          await sendVisaDocumentNotification(
            employee.email,
            `${employee.firstName} ${employee.lastName}`,
            visaStatus.currentStep
          );
        }
      }
    }

    await visaStatus.save();
  }

  return { document, visaStatus };
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

module.exports = {
  getVisaStatus,
  getEmployeesWithOPTVisaStatus,
  addVisaDocument,
  reviewVisaDocument,
  getVisaStatusesNeedingAction,
  getEmployeesWithVisaExpiringSoon,
};
