import {
  FETCH_PROFILE_REQUEST,
  FETCH_PROFILE_SUCCESS,
  FETCH_PROFILE_FAIL,
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAIL,
  ONBOARDING_SUBMIT_REQUEST,
  ONBOARDING_SUBMIT_SUCCESS,
  ONBOARDING_SUBMIT_FAIL,
  FETCH_DOCUMENTS_REQUEST,
  FETCH_DOCUMENTS_SUCCESS,
  FETCH_DOCUMENTS_FAIL,
  UPLOAD_DOCUMENT_REQUEST,
  UPLOAD_DOCUMENT_SUCCESS,
  UPLOAD_DOCUMENT_FAIL,
  FETCH_VISA_STATUS_REQUEST,
  FETCH_VISA_STATUS_SUCCESS,
  FETCH_VISA_STATUS_FAIL,
} from "../types";
import api from "../../api";
import { setAlert } from "./uiActions";

// Get employee profile
export const getProfile = () => async (dispatch) => {
  try {
    dispatch({ type: FETCH_PROFILE_REQUEST });

    const res = await api.get("/employee/me");

    dispatch({
      type: FETCH_PROFILE_SUCCESS,
      payload: res.data.data,
    });
  } catch (err) {
    dispatch({
      type: FETCH_PROFILE_FAIL,
      payload: err.response?.data?.message || "Failed to fetch profile",
    });

    dispatch(
      setAlert(
        err.response?.data?.message || "Failed to fetch profile",
        "error"
      )
    );
  }
};

// Update employee profile
export const updateProfile = (profileData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_PROFILE_REQUEST });

    const res = await api.put(`/employee/${profileData._id}`, profileData);

    dispatch({
      type: UPDATE_PROFILE_SUCCESS,
      payload: res.data.data,
    });

    dispatch(setAlert("Profile updated successfully", "success"));
  } catch (err) {
    dispatch({
      type: UPDATE_PROFILE_FAIL,
      payload: err.response?.data?.message || "Failed to update profile",
    });

    dispatch(
      setAlert(
        err.response?.data?.message || "Failed to update profile",
        "error"
      )
    );
  }
};

// Submit onboarding application
export const submitOnboarding = (formData, history) => async (dispatch) => {
  try {
    dispatch({ type: ONBOARDING_SUBMIT_REQUEST });

    const res = await api.post("/employee/onboarding", formData);

    dispatch({
      type: ONBOARDING_SUBMIT_SUCCESS,
      payload: res.data.data,
    });

    dispatch(
      setAlert("Onboarding application submitted successfully", "success")
    );

    history.push("/employee");
  } catch (err) {
    dispatch({
      type: ONBOARDING_SUBMIT_FAIL,
      payload:
        err.response?.data?.message ||
        "Failed to submit onboarding application",
    });

    dispatch(
      setAlert(
        err.response?.data?.message ||
          "Failed to submit onboarding application",
        "error"
      )
    );
  }
};

// Get employee documents
export const getDocuments = () => async (dispatch) => {
  try {
    dispatch({ type: FETCH_DOCUMENTS_REQUEST });

    const res = await api.get("/employee/documents");

    dispatch({
      type: FETCH_DOCUMENTS_SUCCESS,
      payload: res.data.data,
    });
  } catch (err) {
    dispatch({
      type: FETCH_DOCUMENTS_FAIL,
      payload: err.response?.data?.message || "Failed to fetch documents",
    });

    dispatch(
      setAlert(
        err.response?.data?.message || "Failed to fetch documents",
        "error"
      )
    );
  }
};

// Upload document
export const uploadDocument = (formData) => async (dispatch) => {
  try {
    dispatch({ type: UPLOAD_DOCUMENT_REQUEST });

    const res = await api.post("/employee/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    dispatch({
      type: UPLOAD_DOCUMENT_SUCCESS,
      payload: res.data.data,
    });

    dispatch(setAlert("Document uploaded successfully", "success"));
    return res.data.data;
  } catch (err) {
    dispatch({
      type: UPLOAD_DOCUMENT_FAIL,
      payload: err.response?.data?.message || "Failed to upload document",
    });

    dispatch(
      setAlert(
        err.response?.data?.message || "Failed to upload document",
        "error"
      )
    );
    return null;
  }
};

// Get visa status
export const getVisaStatus = () => async (dispatch) => {
  try {
    dispatch({ type: FETCH_VISA_STATUS_REQUEST });

    const res = await api.get("/visa-status/me");

    dispatch({
      type: FETCH_VISA_STATUS_SUCCESS,
      payload: res.data.data,
    });
  } catch (err) {
    dispatch({
      type: FETCH_VISA_STATUS_FAIL,
      payload: err.response?.data?.message || "Failed to fetch visa status",
    });

    dispatch(
      setAlert(
        err.response?.data?.message || "Failed to fetch visa status",
        "error"
      )
    );
  }
};

// Upload visa document
export const uploadVisaDocument =
  (documentType, formData) => async (dispatch) => {
    try {
      dispatch({ type: UPLOAD_DOCUMENT_REQUEST });

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

      dispatch({
        type: UPLOAD_DOCUMENT_SUCCESS,
        payload: res.data.data,
      });

      dispatch(setAlert("Visa document uploaded successfully", "success"));
      dispatch(getVisaStatus());
      return res.data.data;
    } catch (err) {
      dispatch({
        type: UPLOAD_DOCUMENT_FAIL,
        payload:
          err.response?.data?.message || "Failed to upload visa document",
      });

      dispatch(
        setAlert(
          err.response?.data?.message || "Failed to upload visa document",
          "error"
        )
      );
      return null;
    }
  };
