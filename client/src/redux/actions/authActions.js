import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  USER_LOADING,
  AUTH_ERROR,
  CLEAR_ERRORS,
} from "../types";
import api from "../../api";
import { setAlert } from "./uiActions";

// Load User
export const loadUser = () => async (dispatch) => {
  try {
    dispatch({ type: USER_LOADING });

    const res = await api.get("/auth/me");

    dispatch({
      type: USER_LOADED,
      payload: res.data.data,
    });
  } catch (err) {
    dispatch({
      type: AUTH_ERROR,
      payload: err.response?.data?.message || "Server Error",
    });
  }
};

// Register User
export const register = (formData, token, history) => async (dispatch) => {
  try {
    dispatch({ type: REGISTER_REQUEST });

    const res = await api.post("/auth/register", {
      ...formData,
      token,
    });

    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data,
    });

    dispatch(loadUser());

    dispatch(
      setAlert("Registration successful! Welcome to the team!", "success")
    );

    history.push("/employee/onboarding");
  } catch (err) {
    dispatch({
      type: REGISTER_FAIL,
      payload: err.response?.data?.message || "Registration failed",
    });

    dispatch(
      setAlert(err.response?.data?.message || "Registration failed", "error")
    );
  }
};

// Login User
export const login = (credentials, history) => async (dispatch) => {
  try {
    dispatch({ type: LOGIN_REQUEST });

    const res = await api.post("/auth/login", credentials);

    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data,
    });

    dispatch(loadUser());

    // Redirect based on user role
    const redirectPath = res.data.user.role === "hr" ? "/hr" : "/employee";
    history.push(redirectPath);
  } catch (err) {
    dispatch({
      type: LOGIN_FAIL,
      payload: err.response?.data?.message || "Invalid credentials",
    });

    dispatch(setAlert(err.response?.data?.message || "Login failed", "error"));
  }
};

// Logout
export const logout = (history) => (dispatch) => {
  dispatch({ type: LOGOUT });
  history.push("/login");
};

// Change Password
export const changePassword = (passwordData) => async (dispatch) => {
  try {
    await api.put("/auth/change-password", passwordData);

    dispatch(setAlert("Password changed successfully", "success"));
    return true;
  } catch (err) {
    dispatch(
      setAlert(
        err.response?.data?.message || "Failed to change password",
        "error"
      )
    );
    return false;
  }
};

// Clear Errors
export const clearErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};
