import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { AuthProvider } from "./contexts/AuthContext";
import { UiProvider } from "./contexts/UiContext";
import { HrProvider } from "./contexts/HrContext";
import { EmployeeProvider } from "./contexts/EmployeeContext";

import App from "./App";
import store from "./redux/store";
import "./index.css";
import "semantic-ui-css/semantic.min.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <AuthProvider>
          <UiProvider>
            <HrProvider>
              <EmployeeProvider>
                <App />
              </EmployeeProvider>
            </HrProvider>
          </UiProvider>
        </AuthProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);