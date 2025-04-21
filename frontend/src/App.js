import { Routes, Route, Navigate } from "react-router-dom";
import Registration from "./pages/Auth/Registration";
import Login from "./pages/Auth/Login";
import Application from "./pages/Application"
import Information from "./pages/Information";
import Management from "./pages/Management";

function App() {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path = "/registration" element={<Registration />} />
        <Route path="/application" element={<Application />} />
        <Route path = "/information" element={<Information />} />
        <Route path="/management" element={<Management />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
  );
}

export default App;
