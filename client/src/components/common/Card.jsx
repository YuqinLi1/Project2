import React from "react";
import { Card as AntCard } from "antd";

const Card = ({
  title,
  extra,
  children,
  bordered = true,
  hoverable = false,
  loading = false,
  size = "default",
  cover,
  actions,
  ...rest
}) => {
  return (
    <AntCard
      title={title}
      extra={extra}
      bordered={bordered}
      hoverable={hoverable}
      loading={loading}
      size={size}
      cover={cover}
      actions={actions}
      {...rest}
    >
      {children}
    </AntCard>
  );
};

export default Card;
