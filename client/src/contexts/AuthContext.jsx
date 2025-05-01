import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Assuming you're using axios for API calls

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication on initial load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      validateToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Validate token with backend
  const validateToken = async (token) => {
    try {
      const response = await axios.get("/api/auth/validate", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data.user);
      setIsLoading(false);
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem("token");
      setUser(null);
      setIsLoading(false);
      navigate("/login");
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });

      // Assuming the response contains user data and token
      const { token, user: userData } = response.data;

      // Store token in localStorage
      localStorage.setItem("token", token);

      // Set user in context
      setUser(userData);

      // Redirect to dashboard
      navigate("/employee/dashboard");
    } catch (error) {
      // Handle login errors
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");

    // Clear user from context
    setUser(null);

    // Redirect to login
    navigate("/login");
  };

  // Provide context value
  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};