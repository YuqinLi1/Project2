import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Import pages
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Dashboard from "./pages/Employee/Dashboard";
import Onboarding from "./pages/Employee/Onboarding";
import PersonalInfo from "./pages/Employee/PersonalInfo";
import VisaManagement from "./pages/Employee/VisaManagement";
import HrLogin from "./pages/HR/Login";
import HrDashboard from "./pages/HR/Dashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";

const EmployeeLayout = () => {
  console.log("EmployeeLayout rendered");

  return (
    <div style={{ padding: "2em" }}>
      <h2>Employee Layout</h2>
      <Outlet />
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register/:token" element={<Registration />} />
      <Route path="/hr/login" element={<HrLogin />} />

      {/* Employee Protected Routes */}
      <Route path="/employee" element={<EmployeeLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute role="employee">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="onboarding"
          element={
            <ProtectedRoute role="employee">
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="personal-info"
          element={
            <ProtectedRoute role="employee">
              <PersonalInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="visa-status"
          element={
            <ProtectedRoute role="employee">
              <VisaManagement />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* HR Protected Routes */}
      <Route path="/hr">
        <Route
          path="dashboard"
          element={
            <ProtectedRoute role="hr">
              <HrDashboard />
            </ProtectedRoute>
          }
        />
        {/* Add other HR routes here */}
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
