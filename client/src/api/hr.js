import api from "./index";

// Get all employees
export const getAllEmployees = async () => {
  const response = await api.get("/hr/employees");
  return response.data;
};

// Search employees
export const searchEmployees = async (searchTerm) => {
  const response = await api.get(`/hr/employees/search?term=${searchTerm}`);
  return response.data;
};

// Get employee details
export const getEmployeeDetails = async (employeeId) => {
  const response = await api.get(`/employee/${employeeId}`);
  return response.data;
};

// Generate registration token
export const generateToken = async (email, name) => {
  const response = await api.post("/hr/registration-token", { email, name });
  return response.data;
};

// Get registration tokens
export const getTokens = async () => {
  const response = await api.get("/hr/registration-tokens");
  return response.data;
};

// Get pending applications
export const getPendingApplications = async () => {
  const response = await api.get("/hr/onboarding/pending");
  return response.data;
};

// Review application
export const reviewApplication = async (applicationId, status, feedback) => {
  const response = await api.put(`/hr/onboarding/${applicationId}`, {
    status,
    feedback,
  });
  return response.data;
};

// Get visa management data
export const getVisaManagement = async () => {
  const response = await api.get("/visa-status/in-progress");
  return response.data;
};

// Review document
export const reviewDocument = async (documentId, status, feedback) => {
  const response = await api.put(`/visa-status/document/${documentId}`, {
    status,
    feedback,
  });
  return response.data;
};

// Send notification
export const sendNotification = async (employeeId) => {
  const response = await api.post(`/visa-status/notify/${employeeId}`);
  return response.data;
};
