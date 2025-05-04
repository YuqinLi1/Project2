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
import EmployeeProfile from "./pages/HR/EmployeeProfile";
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
      <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
      <Route path="/employee/onboarding" element={<Onboarding />} />
      <Route path="/employee/personal-info" element={<PersonalInfo />} />
      <Route path="/employee/visa-status" element={<VisaManagement />} />

      {/* HR Routes */}
      <Route path="/hr/dashboard" element={<HRDashboard />} />
      <Route path="/hr/employees" element={<EmployeeProfiles />} />
      <Route path="/hr/employees/:id" element={<EmployeeProfile />} />
      <Route path="/hr/hiring" element={<HiringManagement />} />
      <Route path="/hr/visa" element={<HRVisaManagement />} />

      {/* Redirect to login if no route matches */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
