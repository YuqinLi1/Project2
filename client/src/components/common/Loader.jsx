import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const Loader = ({
  size = "default",
  fullScreen = false,
  tip = "Loading...",
}) => {
  const antIcon = (
    <LoadingOutlined style={{ fontSize: size === "large" ? 40 : 24 }} spin />
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.7)",
          zIndex: 9999,
        }}
      >
        <Spin indicator={antIcon} size={size} tip={tip} />
      </div>
    );
  }

  return <Spin indicator={antIcon} size={size} tip={tip} />;
};

export default Loader;
