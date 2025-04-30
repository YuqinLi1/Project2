import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const isAuthenticated = localStorage.getItem("token") ? true : false;
  const userRole = localStorage.getItem("userRole");

  console.log("ProtectedRoute check:", {
    isAuthenticated,
    userRole,
    expectedRole: role,
  });

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to /login");
    return <Navigate to="/login" />;
  }

  if (role && userRole !== role) {
    console.log("Role mismatch, redirecting based on role");
    return (
      <Navigate
        to={userRole === "hr" ? "/hr/dashboard" : "/employee/dashboard"}
      />
    );
  }

  console.log("Access granted");
  return children;
};

export default ProtectedRoute;