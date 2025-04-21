import React, { createContext, useReducer } from "react";
import api from "../api";
import { useUi } from "./UiContext";

// Create context
export const EmployeeContext = createContext();

// Initial state
const initialState = {
  profile: null,
  documents: [],
  visaStatus: null,
  loading: false,
  error: null,
};

// Reducer
const employeeReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        loading: true,
      };
    case "FETCH_PROFILE_SUCCESS":
      return {
        ...state,
        profile: action.payload,
        loading: false,
        error: null,
      };
    case "UPDATE_PROFILE_SUCCESS":
      return {
        ...state,
        profile: action.payload,
        loading: false,
        error: null,
      };
    case "FETCH_DOCUMENTS_SUCCESS":
      return {
        ...state,
        documents: action.payload,
        loading: false,
        error: null,
      };
    case "UPLOAD_DOCUMENT_SUCCESS":
      return {
        ...state,
        documents: [...state.documents, action.payload],
        loading: false,
        error: null,
      };
    case "FETCH_VISA_STATUS_SUCCESS":
      return {
        ...state,
        visaStatus: action.payload,
        loading: false,
        error: null,
      };
    case "API_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

// Provider component
export const EmployeeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(employeeReducer, initialState);
  const { setAlert } = useUi();

  // Get profile
  const getProfile = async () => {
    dispatch({ type: "SET_LOADING" });
    try {
      const res = await api.get("/employee/me");
      dispatch({
        type: "FETCH_PROFILE_SUCCESS",
        payload: res.data.data,
      });
      return res.data.data;
    } catch (err) {
      dispatch({
        type: "API_ERROR",
        payload: err.response?.data?.message || "Failed to fetch profile",
      });
      setAlert(
        err.response?.data?.message || "Failed to fetch profile",
        "error"
      );
      return null;
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    dispatch({ type: "SET_LOADING" });
    try {
      const res = await api.put(`/employee/${profileData._id}`, profileData);
      dispatch({
        type: "UPDATE_PROFILE_SUCCESS",
        payload: res.data.data,
      });
      setAlert("Profile updated successfully", "success");
      return res.data.data;
    } catch (err) {
      dispatch({
        type: "API_ERROR",
        payload: err.response?.data?.message || "Failed to update profile",
      });
      setAlert(
        err.response?.data?.message || "Failed to update profile",
        "error"
      );
      return null;
    }
  };

  // Submit onboarding
  const submitOnboarding = async (formData) => {
    dispatch({ type: "SET_LOADING" });
    try {
      const res = await api.post("/employee/onboarding", formData);
      dispatch({
        type: "FETCH_PROFILE_SUCCESS",
        payload: res.data.data,
      });
      setAlert("Onboarding application submitted successfully", "success");
      return res.data.data;
    } catch (err) {
      dispatch({
        type: "API_ERROR",
        payload:
          err.response?.data?.message ||
          "Failed to submit onboarding application",
      });
      setAlert(
        err.response?.data?.message ||
          "Failed to submit onboarding application",
        "error"
      );
      return null;
    }
  };

  // Get documents
  const getDocuments = async () => {
    dispatch({ type: "SET_LOADING" });
    try {
      const res = await api.get("/employee/documents");
      dispatch({
        type: "FETCH_DOCUMENTS_SUCCESS",
        payload: res.data.data,
      });
      return res.data.data;
    } catch (err) {
      dispatch({
        type: "API_ERROR",
        payload: err.response?.data?.message || "Failed to fetch documents",
      });
      setAlert(
        err.response?.data?.message || "Failed to fetch documents",
        "error"
      );
      return null;
    }
  };

  // Upload document
  const uploadDocument = async (formData) => {
    dispatch({ type: "SET_LOADING" });
    try {
      const res = await api.post("/employee/documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      dispatch({
        type: "UPLOAD_DOCUMENT_SUCCESS",
        payload: res.data.data,
      });
      setAlert("Document uploaded successfully", "success");
      return res.data.data;
    } catch (err) {
      dispatch({
        type: "API_ERROR",
        payload: err.response?.data?.message || "Failed to upload document",
      });
      setAlert(
        err.response?.data?.message || "Failed to upload document",
        "error"
      );
      return null;
    }
  };

  // Get visa status
  const getVisaStatus = async () => {
    dispatch({ type: "SET_LOADING" });
    try {
      const res = await api.get("/visa-status/me");
      dispatch({
        type: "FETCH_VISA_STATUS_SUCCESS",
        payload: res.data.data,
      });
      return res.data.data;
    } catch (err) {
      dispatch({
        type: "API_ERROR",
        payload: err.response?.data?.message || "Failed to fetch visa status",
      });
      setAlert(
        err.response?.data?.message || "Failed to fetch visa status",
        "error"
      );
      return null;
    }
  };

  // Upload visa document
  const uploadVisaDocument = async (documentType, formData) => {
    dispatch({ type: "SET_LOADING" });
    try {
      const res = await api.post(
        "/visa-status/document",
        {
          ...formData,
          documentType,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setAlert("Visa document uploaded successfully", "success");
      // Refresh visa status after upload
      await getVisaStatus();
      return res.data.data;
    } catch (err) {
      dispatch({
        type: "API_ERROR",
        payload:
          err.response?.data?.message || "Failed to upload visa document",
      });
      setAlert(
        err.response?.data?.message || "Failed to upload visa document",
        "error"
      );
      return null;
    }
  };

  return (
    <EmployeeContext.Provider
      value={{
        profile: state.profile,
        documents: state.documents,
        visaStatus: state.visaStatus,
        loading: state.loading,
        error: state.error,
        getProfile,
        updateProfile,
        submitOnboarding,
        getDocuments,
        uploadDocument,
        getVisaStatus,
        uploadVisaDocument,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

// Custom hook for using employee context
export const useEmployee = () => {
  const context = React.useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error("useEmployee must be used within an EmployeeProvider");
  }
  return context;
};
