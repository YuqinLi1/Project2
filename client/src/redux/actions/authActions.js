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
export const login = (username, password) => async (dispatch) => {
  try {
    dispatch({ type: LOGIN_REQUEST });

    const { data } = await api.post("/auth/login", { username, password });

    // Store the token in localStorage for persistent authentication
    localStorage.setItem("token", data.token);
    if (data.user && data.user.role) {
      localStorage.setItem("userRole", data.user.role);
    }

    dispatch({ type: LOGIN_SUCCESS, payload: data });
    dispatch(loadUser());

    // No need to manually navigate here - this will be handled by the component
    // after the Redux state is updated
    return { success: true, role: data.user?.role };
  } catch (err) {
    const message = err.response?.data?.message || "username doesn't match password, please try again";
    dispatch({ type: LOGIN_FAIL, payload: message });
    dispatch(setAlert(message, "error"));
    return { success: false, message };
  }
};

// Logout
export const logout = () => (dispatch) => {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  dispatch({ type: LOGOUT });
  // No need to manually navigate here - this will be handled by the component
};

// Clear Errors
export const clearErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};
