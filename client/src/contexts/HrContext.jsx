import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";
import { message } from "antd";

// Create the HR context
const HrContext = createContext();

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

// Provider component
export const HrProvider = ({ children }) => {
  // State
  const [employees, setEmployees] = useState([]);
  const [applications, setApplications] = useState([]);
  const [visaManagement, setVisaManagement] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registrationTokens, setRegistrationTokens] = useState([]);
  const [registrationResult, setRegistrationResult] = useState(null);

  // Helper to handle API errors
  const handleError = (error) => {
    console.error("API Error:", error);
    setError(
      error.response?.data?.message || error.message || "An error occurred"
    );
    setLoading(false);
    message.error(error.response?.data?.message || "An error occurred");
  };

  // Get all employees
  const getAllEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/hr/employees`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setEmployees(response.data);
      setLoading(false);
    } catch (error) {
      handleError(error);
    }
  }, []);

  // Get employee by ID
  const getEmployeeById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/hr/employees/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setSelectedEmployee(response.data);
      setLoading(false);
      return response.data;
    } catch (error) {
      handleError(error);
      return null;
    }
  }, []);

  // Get pending applications
  const getPendingApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/hr/applications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setApplications(response.data);
      setLoading(false);
    } catch (error) {
      handleError(error);
    }
  }, []);

  // Get application by ID
  const getApplicationById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/hr/applications/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setSelectedApplication(response.data);
      setLoading(false);
      return response.data;
    } catch (error) {
      handleError(error);
      return null;
    }
  }, []);

  // Update application status
  const updateApplicationStatus = useCallback(
    async (id, status, feedback = "") => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.put(
          `${API_URL}/hr/applications/${id}/status`,
          { status, feedback },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Update application list
        setApplications((prev) =>
          prev.map((app) =>
            app._id === id ? { ...app, status, feedback } : app
          )
        );

        setLoading(false);
        message.success(
          `Application ${status === "approved" ? "approved" : "rejected"}`
        );
        return response.data;
      } catch (error) {
        handleError(error);
        return null;
      }
    },
    []
  );

  // Get visa management data
  const getVisaManagement = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/hr/visa-management`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setVisaManagement(response.data);
      setLoading(false);
    } catch (error) {
      handleError(error);
    }
  }, []);

  // Review visa document
  const reviewVisaDocument = useCallback(
    async (employeeId, documentId, status, feedback = "") => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.put(
          `${API_URL}/hr/visa-management/${employeeId}/documents/${documentId}`,
          { status, feedback },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Update visa management data
        await getVisaManagement();

        setLoading(false);
        message.success(
          `Document ${status === "approved" ? "approved" : "rejected"}`
        );
        return response.data;
      } catch (error) {
        handleError(error);
        return null;
      }
    },
    [getVisaManagement]
  );

  // Download document
  const downloadDocument = useCallback(async (documentId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_URL}/documents/${documentId}/download`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: "blob",
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `document-${documentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setLoading(false);
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  }, []);

  // Get registration tokens
  const getRegistrationTokens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/hr/registration-tokens`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRegistrationTokens(response.data);
      setLoading(false);
    } catch (error) {
      handleError(error);
    }
  }, []);

  // Generate registration token
  const generateRegistrationToken = useCallback(
    async (email, name) => {
      setLoading(true);
      setError(null);
      setRegistrationResult(null);
      try {
        const response = await axios.post(
          `${API_URL}/hr/registration-tokens`,
          { email, name },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Update registration tokens
        await getRegistrationTokens();

        setRegistrationResult({
          success: true,
          token: response.data.token,
          link: `${window.location.origin}/register/${response.data.token}`,
          message: "Registration token generated successfully",
        });

        setLoading(false);
        message.success("Registration token generated successfully");
        return response.data;
      } catch (error) {
        handleError(error);
        setRegistrationResult({
          success: false,
          message:
            error.response?.data?.message ||
            "Failed to generate registration token",
        });
        return null;
      }
    },
    [getRegistrationTokens]
  );

  // Send registration email
  const sendRegistrationEmail = useCallback(
    async (tokenId) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(
          `${API_URL}/hr/registration-tokens/${tokenId}/send-email`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Update registration tokens
        await getRegistrationTokens();

        setLoading(false);
        message.success("Registration email sent successfully");
        return response.data;
      } catch (error) {
        handleError(error);
        return null;
      }
    },
    [getRegistrationTokens]
  );

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedEmployee(null);
    setSelectedApplication(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear registration result
  const clearRegistrationResult = useCallback(() => {
    setRegistrationResult(null);
  }, []);

  // Context value
  const value = {
    employees,
    applications,
    visaManagement,
    selectedEmployee,
    selectedApplication,
    loading,
    error,
    registrationTokens,
    registrationResult,
    getAllEmployees,
    getEmployeeById,
    getPendingApplications,
    getApplicationById,
    updateApplicationStatus,
    getVisaManagement,
    reviewVisaDocument,
    downloadDocument,
    getRegistrationTokens,
    generateRegistrationToken,
    sendRegistrationEmail,
    clearSelection,
    clearError,
    clearRegistrationResult,
  };

  return <HrContext.Provider value={value}>{children}</HrContext.Provider>;
};

// Custom hook to use the HR context
export const useHr = () => {
  const context = useContext(HrContext);
  if (!context) {
    throw new Error("useHr must be used within an HrProvider");
  }
  return context;
};

export default HrContext;
