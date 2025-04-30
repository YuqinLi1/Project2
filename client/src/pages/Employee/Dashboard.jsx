import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ProtectedRoute from "../../components/common/ProtectedRoute";

// Import actions
import { getProfile } from "../../redux/actions/employmentActions";
import { logout } from "../../redux/actions/authActions";
import { setAlert } from "../../redux/actions/uiActions";


const DashboardContent = () => {
  console.log("Dashboard rendered");

  return (
    <div style={{ padding: "2em" }}>
      <h1>Welcome to the Dashboard</h1>
      <p>This content should be visible if rendering works correctly.</p>
    </div>
  );
};

const Dashboard = () => (
  <ProtectedRoute role="employee">
    <DashboardContent />
  </ProtectedRoute>
);

export default Dashboard;
