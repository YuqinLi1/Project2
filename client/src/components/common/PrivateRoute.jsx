import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show nothing while loading
  if (isLoading) {
    return null; // Or return a loading spinner
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specified
  if (role && user?.role !== role) {
    // Redirect to appropriate dashboard based on role
    const dashboardRoute =
      user.role === "hr" ? "/hr/dashboard" : "/employee/dashboard";

    return <Navigate to={dashboardRoute} replace />;
  }

  return children;
};

export default PrivateRoute;
