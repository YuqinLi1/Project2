import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "../../contexts/AuthContext";

console.log("PrivateRoute state", {
  loading,
  isAuthenticated,
  user,
  expectedRole: role
});

const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    console.log("Not authenticated, redirecting...");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    // Redirect based on role
    return <Navigate to={user.role === "hr" ? "/hr" : "/employee"} replace />;
  }

  return children;
};

export default PrivateRoute;
