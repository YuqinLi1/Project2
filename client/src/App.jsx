// App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Import pages
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Dashboard from "./pages/Employee/Dashboard";
import Onboarding from "./pages/Employee/Onboarding";
import PersonalInfo from "./pages/Employee/PersonalInfo";
import VisaManagement from "./pages/Employee/VisaManagement";
import HrLogin from "./pages/HR/Login";
import HrDashboard from "./pages/HR/Dashboard";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register/:token" element={<Registration />} />
      <Route path="/hr/login" element={<HrLogin />} />

      {/* Employee – 暂时不做鉴权，直接渲染 */}
      <Route path="/employee/dashboard" element={<Dashboard />} />
      <Route path="/employee/onboarding" element={<Onboarding />} />
      <Route path="/employee/personal-info" element={<PersonalInfo />} />
      <Route path="/employee/visa-status" element={<VisaManagement />} />

      {/* HR – 同样取消鉴权，直接渲染 */}
      <Route path="/hr/dashboard" element={<HrDashboard />} />

      {/* 根路径和 404 都跳到登录 */}
      <Route path="/" element={<Dashboard />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
