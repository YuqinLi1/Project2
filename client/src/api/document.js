import api from "./index";

// Get document by ID
export const getDocument = async (documentId) => {
  const response = await api.get(`/documents/${documentId}`);
  return response.data;
};

// Download document
export const downloadDocument = (documentId) => {
  window.open(
    `${api.defaults.baseURL}/documents/${documentId}/download`,
    "_blank"
  );
};

// Delete document
export const deleteDocument = async (documentId) => {
  const response = await api.delete(`/documents/${documentId}`);
  return response.data;
};

// Get document types
export const getDocumentTypes = () => {
  return [
    { value: "Profile Picture", label: "Profile Picture" },
    { value: "Driver's License", label: "Driver's License" },
    { value: "Work Authorization", label: "Work Authorization" },
  ];
};

// Get visa document types
export const getVisaDocumentTypes = () => {
  return [
    { value: "OPT Receipt", label: "OPT Receipt" },
    { value: "OPT EAD", label: "OPT EAD" },
    { value: "I-983", label: "I-983 Form" },
    { value: "I-20", label: "I-20 Form" },
  ];
};
