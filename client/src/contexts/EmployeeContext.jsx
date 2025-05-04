import React, { createContext, useReducer, useCallback, useMemo } from "react";
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
        error: null,
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
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Provider component
export const EmployeeProvider = ({ children }) => {
  // Use useReducer with a stable dispatch
  const [state, dispatch] = useReducer(employeeReducer, initialState);
  const { setAlert } = useUi();

  // Memoize API call functions to prevent unnecessary re-creation
  const getProfile = useCallback(async () => {
    dispatch({ type: "SET_LOADING" });
    try {
      const res = await api.get("/employee/me");
      dispatch({
        type: "FETCH_PROFILE_SUCCESS",
        payload: res.data.data,
      });
      return res.data.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch profile";
      dispatch({
        type: "API_ERROR",
        payload: errorMessage,
      });
      setAlert(errorMessage, "error");
      return null;
    }
  }, [setAlert]);

  const updateProfile = useCallback(
    async (profileData) => {
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
        const errorMessage =
          err.response?.data?.message || "Failed to update profile";
        dispatch({
          type: "API_ERROR",
          payload: errorMessage,
        });
        setAlert(errorMessage, "error");
        return null;
      }
    },
    [setAlert]
  );

  const submitOnboarding = useCallback(
    async (formData) => {
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
        const errorMessage =
          err.response?.data?.message ||
          "Failed to submit onboarding application";
        dispatch({
          type: "API_ERROR",
          payload: errorMessage,
        });
        setAlert(errorMessage, "error");
        return null;
      }
    },
    [setAlert]
  );

  const getDocuments = useCallback(async () => {
    dispatch({ type: "SET_LOADING" });
    try {
      const res = await api.get("/employee/documents");
      dispatch({
        type: "FETCH_DOCUMENTS_SUCCESS",
        payload: res.data.data,
      });
      return res.data.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch documents";
      dispatch({
        type: "API_ERROR",
        payload: errorMessage,
      });
      setAlert(errorMessage, "error");
      return null;
    }
  }, [setAlert]);

  const uploadDocument = useCallback(
    async (formData) => {
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
        const errorMessage =
          err.response?.data?.message || "Failed to upload document";
        dispatch({
          type: "API_ERROR",
          payload: errorMessage,
        });
        setAlert(errorMessage, "error");
        return null;
      }
    },
    [setAlert]
  );

  const getVisaStatus = useCallback(async () => {
    dispatch({ type: "SET_LOADING" });
    try {
      const res = await api.get("/visa-status/me");
      dispatch({
        type: "FETCH_VISA_STATUS_SUCCESS",
        payload: res.data.data,
      });
      return res.data.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch visa status";
      dispatch({
        type: "API_ERROR",
        payload: errorMessage,
      });
      setAlert(errorMessage, "error");
      return null;
    }
  }, [setAlert]);

  const uploadVisaDocument = useCallback(
    async (documentType, formData) => {
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
        const errorMessage =
          err.response?.data?.message || "Failed to upload visa document";
        dispatch({
          type: "API_ERROR",
          payload: errorMessage,
        });
        setAlert(errorMessage, "error");
        return null;
      }
    },
    [setAlert, getVisaStatus]
  );

  // Additional utility methods
  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      profile: state.profile,
      documents: state.documents,
      visaStatus: state.visaStatus,
      loading: state.loading,
      error: state.error,

      // Memoized methods
      getProfile,
      updateProfile,
      submitOnboarding,
      getDocuments,
      uploadDocument,
      getVisaStatus,
      uploadVisaDocument,
      clearError,
    }),
    [
      state.profile,
      state.documents,
      state.visaStatus,
      state.loading,
      state.error,
      getProfile,
      updateProfile,
      submitOnboarding,
      getDocuments,
      uploadDocument,
      getVisaStatus,
      uploadVisaDocument,
      clearError,
    ]
  );

  return (
    <EmployeeContext.Provider value={contextValue}>
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
