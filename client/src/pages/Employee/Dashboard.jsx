import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

// Import actions
import { getProfile } from "../../redux/actions/employmentActions";
import { logout } from "../../redux/actions/authActions";
import { setAlert } from "../../redux/actions/uiActions";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("Dashboard rendered");

    // Fetch employee status when component mounts
    dispatch(getProfile());

    // Set active menu item - using setAlert as a placeholder since setActiveMenuItem isn't available
    dispatch(
      setAlert({
        type: "info",
        message: "Dashboard loaded",
        activeMenuItem: "dashboard",
      })
    );
  }, [dispatch, navigate]);

  // Handle menu item click
  const handleMenuClick = (key) => {
    // Using setAlert as a placeholder since setActiveMenuItem isn't available
    dispatch(
      setAlert({
        type: "info",
        message: `Navigating to ${key}`,
        activeMenuItem: key,
      })
    );
    navigate(`/employee/${key}`);
  };

  console.log("Component rendered");

  return (
    <div style={{ padding: "2em" }}>
      <h1>Welcome to the Dashboard</h1>
      <p>This content should be visible if rendering works correctly.</p>
    </div>
  );
};

export default Dashboard;
