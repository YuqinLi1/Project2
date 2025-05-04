import React from "react";
import { Button as AntButton } from "antd";

const Button = ({
  children,
  type = "primary",
  size = "middle",
  icon,
  loading = false,
  danger = false,
  block = false,
  ghost = false,
  shape,
  onClick,
  ...rest
}) => {
  return (
    <AntButton
      type={type}
      size={size}
      icon={icon}
      loading={loading}
      danger={danger}
      block={block}
      ghost={ghost}
      shape={shape}
      onClick={onClick}
      {...rest}
    >
      {children}
    </AntButton>
  );
};

export default Button;
