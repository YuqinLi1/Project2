import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes";
import { ConfigProvider } from "antd";
import { AuthProvider } from "./contexts/AuthContext";
import { UiProvider } from "./contexts/UiContext";
import { EmployeeProvider } from "./contexts/EmployeeContext";
import { HrProvider } from "./contexts/HrContext";
import AlertManager from "./components/common/AlertManager";
import "./App.less";

function App() {
  return (
    <ConfigProvider>
      <UiProvider>
        <AuthProvider>
          <EmployeeProvider>
            <HrProvider>
              <Router>
                <AlertManager />
                <AppRoutes />
              </Router>
            </HrProvider>
          </EmployeeProvider>
        </AuthProvider>
      </UiProvider>
    </ConfigProvider>
  );
}

export default App;
