import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import EmployeeDashboard from "./pages/Employee/Dashboard";
import Onboarding from "./pages/Employee/Onboarding";
import PersonalInfo from "./pages/Employee/PersonalInfo";
import VisaManagement from "./pages/Employee/VisaManagement";
import HRDashboard from "./pages/HR/Dashboard";
import EmployeeProfiles from "./pages/HR/EmployeeProfiles";
import HiringManagement from "./pages/HR/HiringManagement";
import HRVisaManagement from "./pages/HR/VisaManagement";
import PrivateRoute from "./components/common/PrivateRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registration />} />

      {/* Employee Routes */}
      <Route
        path="/employee"
        element={
          <PrivateRoute role="employee">
            <EmployeeDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/employee/onboarding"
        element={
          <PrivateRoute role="employee">
            <Onboarding />
          </PrivateRoute>
        }
      />
      <Route
        path="/employee/personal-info"
        element={
          <PrivateRoute role="employee">
            <PersonalInfo />
          </PrivateRoute>
        }
      />
      <Route
        path="/employee/visa"
        element={
          <PrivateRoute role="employee">
            <VisaManagement />
          </PrivateRoute>
        }
      />

      {/* HR Routes */}
      <Route
        path="/hr"
        element={
          <PrivateRoute role="hr">
            <HRDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/hr/employees"
        element={
          <PrivateRoute role="hr">
            <EmployeeProfiles />
          </PrivateRoute>
        }
      />
      <Route
        path="/hr/hiring"
        element={
          <PrivateRoute role="hr">
            <HiringManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/hr/visa"
        element={
          <PrivateRoute role="hr">
            <HRVisaManagement />
          </PrivateRoute>
        }
      />

      {/* Redirect to login if no route matches */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
