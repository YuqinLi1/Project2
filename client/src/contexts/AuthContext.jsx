import React, { createContext, useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loadUser } from "../redux/actions/authActions";

// Create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Load user data
      dispatch(loadUser()).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [dispatch]);

  // Value to be provided by the context
  const value = {
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    loading: auth.loading || loading,
    error: auth.error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
