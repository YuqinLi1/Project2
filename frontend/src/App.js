import { Routes, Route, Navigate } from "react-router-dom";
import Registration from "./pages/Auth/Registration";
import Login from "./pages/Auth/Login";
import Onboarding from "./pages/Onboarding"
import PersonalProfile from "./pages/PersonalProfile";
import Management from "./pages/Management";
import Dashboard from "./pages/Dashboard";  // ✅ Added import

function App() {
  return (
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />  {/* ✅ Added route */}
        <Route path="/login" element={<Login />} />
        <Route path = "/registration" element={<Registration />} />
        <Route path="/application" element={<Onboarding />} />
        <Route path="/information" element={<PersonalProfile />} />
        <Route path="/management" element={<Management />} />
      </Routes>
  );
}

export default App;