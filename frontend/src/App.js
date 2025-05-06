import { Routes, Route, Navigate } from "react-router-dom";
import Registration from "./pages/Auth/Registration";
import Login from "./pages/Auth/Login";
import Onboarding from "./pages/Onboarding";
import PersonalProfile from "./pages/PersonalProfile";
import Management from "./pages/Management";

import EmployeeProfiles from "./pages/HR/EmployeeProfiles";
import EmployeeProfileDetail from "./pages/HR/EmployeeProfileDetail";
import VisaManagement from "./pages/HR/Visamanagement";
import HiringManagement from "./pages/HR/HiringManagement";
import Dashboard from "./pages/HrDashBoard";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};

// HR route component
const HRRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (userRole !== "hr") {
    return <Navigate to="/information" />;
  }

  return children;
};

// Employee route component
const EmployeeRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (userRole !== "employee") {
    return <Navigate to="/profiles" />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />
      {/* Protected Routes for Both Roles */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* Employee Routes */}
      <Route
        path="/onboarding"
        element={
          <EmployeeRoute>
            <Onboarding />
          </EmployeeRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <EmployeeRoute>
            <PersonalProfile />
          </EmployeeRoute>
        }
      />
      <Route
        path="/management"
        element={
          <EmployeeRoute>
            <Management />
          </EmployeeRoute>
        }
      />
      {/* HR Routes */}s
      <Route
        path="/profiles"
        element={
          <HRRoute>
            <EmployeeProfiles />
          </HRRoute>
        }
      />
      <Route
        path="/employee-profile/:id"
        element={
          <HRRoute>
            <EmployeeProfileDetail />
          </HRRoute>
        }
      />
      <Route
        path="/visa-management"
        element={
          <HRRoute>
            <VisaManagement />
          </HRRoute>
        }
      />
      <Route
        path="/hiring-management"
        element={
          <HRRoute>
            <HiringManagement />
          </HRRoute>
        }
      />
      {/* Fallback Route */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
