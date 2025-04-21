import React from "react";
import { Empty, Button } from "antd";

const EmptyState = ({
  description = "No data found",
  image = Empty.PRESENTED_IMAGE_DEFAULT,
  showAction = false,
  actionText = "Create New",
  onAction,
  style,
}) => {
  return (
    <Empty
      image={image}
      description={description}
      style={{ padding: "40px 0", ...style }}
    >
      {showAction && (
        <Button type="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Empty>
  );
};

export default EmptyState;
