import api from "./index";

// Get employee profile
export const getEmployeeProfile = async () => {
  const response = await api.get("/employee/me");
  return response.data;
};

// Update employee profile
export const updateEmployeeProfile = async (profileData) => {
  const response = await api.put(`/employee/${profileData._id}`, profileData);
  return response.data;
};

// Submit onboarding application
export const submitOnboarding = async (formData) => {
  const response = await api.post("/employee/onboarding", formData);
  return response.data;
};

// Get employee documents
export const getEmployeeDocuments = async () => {
  const response = await api.get("/employee/documents");
  return response.data;
};

// Upload document
export const uploadDocument = async (formData) => {
  const response = await api.post("/employee/documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Download document
export const downloadDocument = (documentId) => {
  window.open(
    `${api.defaults.baseURL}/documents/${documentId}/download`,
    "_blank"
  );
};

// Preview document
export const previewDocumentUrl = (documentId) => {
  return `${api.defaults.baseURL}/documents/${documentId}/preview`;
};
