import React from "react";
import { Alert, Space } from "antd";
import { useUi } from "../../contexts/UiContext";

const AlertManager = () => {
  const { alerts, removeAlert } = useUi();

  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        maxWidth: "350px",
      }}
    >
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          message={alert.message}
          type={alert.type}
          showIcon
          closable
          onClose={() => removeAlert(alert.id)}
        />
      ))}
    </div>
  );
};

export default AlertManager;
