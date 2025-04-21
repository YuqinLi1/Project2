import {
  FETCH_EMPLOYEES_REQUEST,
  FETCH_EMPLOYEES_SUCCESS,
  FETCH_EMPLOYEES_FAIL,
  FETCH_EMPLOYEE_DETAIL_REQUEST,
  FETCH_EMPLOYEE_DETAIL_SUCCESS,
  FETCH_EMPLOYEE_DETAIL_FAIL,
  SEARCH_EMPLOYEES_REQUEST,
  SEARCH_EMPLOYEES_SUCCESS,
  SEARCH_EMPLOYEES_FAIL,
  GENERATE_TOKEN_REQUEST,
  GENERATE_TOKEN_SUCCESS,
  GENERATE_TOKEN_FAIL,
  FETCH_TOKENS_REQUEST,
  FETCH_TOKENS_SUCCESS,
  FETCH_TOKENS_FAIL,
  FETCH_APPLICATIONS_REQUEST,
  FETCH_APPLICATIONS_SUCCESS,
  FETCH_APPLICATIONS_FAIL,
  REVIEW_APPLICATION_REQUEST,
  REVIEW_APPLICATION_SUCCESS,
  REVIEW_APPLICATION_FAIL,
  REVIEW_DOCUMENT_REQUEST,
  REVIEW_DOCUMENT_SUCCESS,
  REVIEW_DOCUMENT_FAIL,
  FETCH_VISA_MANAGEMENT_REQUEST,
  FETCH_VISA_MANAGEMENT_SUCCESS,
  FETCH_VISA_MANAGEMENT_FAIL,
  SEND_NOTIFICATION_REQUEST,
  SEND_NOTIFICATION_SUCCESS,
  SEND_NOTIFICATION_FAIL,
} from "../types";
import api from "../../api";
import { setAlert } from "./uiActions";

// Get all employees
export const getAllEmployees = () => async (dispatch) => {
  try {
    dispatch({ type: FETCH_EMPLOYEES_REQUEST });

    const res = await api.get("/hr/employees");

    dispatch({
      type: FETCH_EMPLOYEES_SUCCESS,
      payload: res.data.data,
    });
  } catch (err) {
    dispatch({
      type: FETCH_EMPLOYEES_FAIL,
      payload: err.response?.data?.message || "Failed to fetch employees",
    });

    dispatch(
      setAlert(
        err.response?.data?.message || "Failed to fetch employees",
        "error"
      )
    );
  }
};

// Get employee detail
export const getEmployeeDetail = (employeeId) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_EMPLOYEE_DETAIL_REQUEST });

    const res = await api.get(`/employee/${employeeId}`);

    dispatch({
      type: FETCH_EMPLOYEE_DETAIL_SUCCESS,
      payload: res.data.data,
    });
  } catch (err) {
    dispatch({
      type: FETCH_EMPLOYEE_DETAIL_FAIL,
      payload:
        err.response?.data?.message || "Failed to fetch employee details",
    });

    dispatch(
      setAlert(
        err.response?.data?.message || "Failed to fetch employee details",
        "error"
      )
    );
  }
};

// Search employees
export const searchEmployees = (searchTerm) => async (dispatch) => {
  try {
    dispatch({ type: SEARCH_EMPLOYEES_REQUEST });

    const res = await api.get(`/hr/employees/search?term=${searchTerm}`);

    dispatch({
      type: SEARCH_EMPLOYEES_SUCCESS,
      payload: res.data.data,
    });
  } catch (err) {
    dispatch({
      type: SEARCH_EMPLOYEES_FAIL,
      payload: err.response?.data?.message || "Failed to search employees",
    });

    dispatch(
      setAlert(
        err.response?.data?.message || "Failed to search employees",
        "error"
      )
    );
  }
};

// Generate registration token
export const generateToken = (email, name) => async (dispatch) => {
  try {
    dispatch({ type: GENERATE_TOKEN_REQUEST });

    const res = await api.post("/hr/registration-token", { email, name });

    dispatch({
      type: GENERATE_TOKEN_SUCCESS,
      payload: res.data.data,
    });

    dispatch(
      setAlert(
        "Registration token generated and email sent successfully",
        "success"
      )
    );
    return res.data.data;
  } catch (err) {
    dispatch({
      type: GENERATE_TOKEN_FAIL,
      payload: err.response?.data?.message || "Failed to generate token",
    });

    dispatch(
      setAlert(
        err.response?.data?.message || "Failed to generate token",
        "error"
      )
    );
    return null;
  }
};

// Get registration tokens history
export const getTokensHistory = () => async (dispatch) => {
  try {
    dispatch({ type: FETCH_TOKENS_REQUEST });

    const res = await api.get("/hr/registration-tokens");

    dispatch({
      type: FETCH_TOKENS_SUCCESS,
      payload: res.data.data,
    });
  } catch (err) {
    dispatch({
      type: FETCH_TOKENS_FAIL,
      payload: err.response?.data?.message || "Failed to fetch token history",
    });

    dispatch(
      setAlert(
        err.response?.data?.message || "Failed to fetch token history",
        "error"
      )
    );
  }
};

// Get pending onboarding applications
export const getPendingApplications = () => async (dispatch) => {
  try {
    dispatch({ type: FETCH_APPLICATIONS_REQUEST });

    const res = await api.get("/hr/onboarding/pending");

    dispatch({
      type: FETCH_APPLICATIONS_SUCCESS,
      payload: res.data.data,
    });
  } catch (err) {
    dispatch({
      type: FETCH_APPLICATIONS_FAIL,
      payload: err.response?.data?.message || "Failed to fetch applications",
    });

    dispatch(
      setAlert(
        err.response?.data?.message || "Failed to fetch applications",
        "error"
      )
    );
  }
};

// Review onboarding application
export const reviewApplication =
  (applicationId, status, feedback) => async (dispatch) => {
    try {
      dispatch({ type: REVIEW_APPLICATION_REQUEST });

      const res = await api.put(`/hr/onboarding/${applicationId}`, {
        status,
        feedback,
      });

      dispatch({
        type: REVIEW_APPLICATION_SUCCESS,
        payload: res.data.data,
      });

      dispatch(setAlert(`Application ${status} successfully`, "success"));
      return res.data.data;
    } catch (err) {
      dispatch({
        type: REVIEW_APPLICATION_FAIL,
        payload: err.response?.data?.message || "Failed to review application",
      });

      dispatch(
        setAlert(
          err.response?.data?.message || "Failed to review application",
          "error"
        )
      );
      return null;
    }
  };

// Review visa document
export const reviewDocument =
  (documentId, status, feedback) => async (dispatch) => {
    try {
      dispatch({ type: REVIEW_DOCUMENT_REQUEST });

      const res = await api.put(`/visa-status/document/${documentId}`, {
        status,
        feedback,
      });

      dispatch({
        type: REVIEW_DOCUMENT_SUCCESS,
        payload: res.data.data,
      });

      dispatch(setAlert(`Document ${status} successfully`, "success"));
      return res.data.data;
    } catch (err) {
      dispatch({
        type: REVIEW_DOCUMENT_FAIL,
        payload: err.response?.data?.message || "Failed to review document",
      });

      dispatch(
        setAlert(
          err.response?.data?.message || "Failed to review document",
          "error"
        )
      );
      return null;
    }
  };

// Get employees with visa status in progress
export const getVisaManagement = () => async (dispatch) => {
  try {
    dispatch({ type: FETCH_VISA_MANAGEMENT_REQUEST });

    const res = await api.get("/visa-status/in-progress");

    dispatch({
      type: FETCH_VISA_MANAGEMENT_SUCCESS,
      payload: res.data.data,
    });
  } catch (err) {
    dispatch({
      type: FETCH_VISA_MANAGEMENT_FAIL,
      payload:
        err.response?.data?.message || "Failed to fetch visa management data",
    });

    dispatch(
      setAlert(
        err.response?.data?.message || "Failed to fetch visa management data",
        "error"
      )
    );
  }
};

// Send notification email for next visa document
export const sendNotification = (employeeId) => async (dispatch) => {
  try {
    dispatch({ type: SEND_NOTIFICATION_REQUEST });

    const res = await api.post(`/visa-status/notify/${employeeId}`);

    dispatch({
      type: SEND_NOTIFICATION_SUCCESS,
      payload: res.data,
    });

    dispatch(setAlert("Notification sent successfully", "success"));
    return true;
  } catch (err) {
    dispatch({
      type: SEND_NOTIFICATION_FAIL,
      payload: err.response?.data?.message || "Failed to send notification",
    });

    dispatch(
      setAlert(
        err.response?.data?.message || "Failed to send notification",
        "error"
      )
    );
    return false;
  }
};
