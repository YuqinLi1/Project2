import React, { createContext, useReducer, useEffect } from "react";
import api from "../api";

// Create context
export const AuthContext = createContext();

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      localStorage.setItem("token", action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        loading: false,
        error: null,
      };
    case "USER_LOADED":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };
    case "AUTH_ERROR":
    case "LOGIN_FAIL":
    case "REGISTER_FAIL":
    case "LOGOUT":
      localStorage.removeItem("token");
      return {
        ...state,
        isAuthenticated: false,
        user: null,
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
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user
  const loadUser = async () => {
    try {
      const res = await api.get("/auth/me");
      dispatch({
        type: "USER_LOADED",
        payload: res.data.data,
      });
    } catch (err) {
      dispatch({
        type: "AUTH_ERROR",
        payload: err.response?.data?.message || "Authentication error",
      });
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      const res = await api.post("/auth/login", credentials);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: res.data,
      });
      return true;
    } catch (err) {
      dispatch({
        type: "LOGIN_FAIL",
        payload: err.response?.data?.message || "Invalid credentials",
      });
      return false;
    }
  };

  // Register user
  const register = async (formData, token) => {
    try {
      const res = await api.post("/auth/register", {
        ...formData,
        token,
      });
      dispatch({
        type: "REGISTER_SUCCESS",
        payload: res.data,
      });
      return true;
    } catch (err) {
      dispatch({
        type: "REGISTER_FAIL",
        payload: err.response?.data?.message || "Registration failed",
      });
      return false;
    }
  };

  // Logout
  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  // Clear errors
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // Check if token exists on first render
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      loadUser();
    } else {
      dispatch({ type: "AUTH_ERROR" });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        loading: state.loading,
        error: state.error,
        login,
        register,
        logout,
        clearError,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
