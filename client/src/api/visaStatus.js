import api from "./index";

// Get employee visa status
export const getVisaStatus = async () => {
  const response = await api.get("/visa-status/me");
  return response.data;
};

// Upload visa document
export const uploadVisaDocument = async (documentType, file) => {
  const formData = new FormData();
  formData.append("document", file);
  formData.append("documentType", documentType);

  const response = await api.post("/visa-status/document", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// Get next step for visa application
export const getNextVisaStep = (visaStatus) => {
  if (!visaStatus) return null;

  const steps = ["OPT Receipt", "OPT EAD", "I-983", "I-20", "Completed"];
  const currentIndex = steps.indexOf(visaStatus.currentStep);

  if (currentIndex < 0 || currentIndex >= steps.length - 1) {
    return null;
  }

  return steps[currentIndex + 1];
};

// Check if a document is pending
export const isPendingDocument = (visaStatus, documentType) => {
  if (!visaStatus || !visaStatus.documents) return false;

  return visaStatus.documents.some(
    (doc) => doc.type === documentType && doc.status === "pending"
  );
};
