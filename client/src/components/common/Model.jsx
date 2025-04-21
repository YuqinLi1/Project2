import React from "react";
import { Modal as AntModal, Button } from "antd";

const Modal = ({
  title,
  visible,
  onOk,
  onCancel,
  okText = "OK",
  cancelText = "Cancel",
  children,
  okButtonProps,
  cancelButtonProps,
  width,
  closable = true,
  footer,
  ...rest
}) => {
  return (
    <AntModal
      title={title}
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      okButtonProps={okButtonProps}
      cancelButtonProps={cancelButtonProps}
      width={width}
      closable={closable}
      footer={footer}
      {...rest}
    >
      {children}
    </AntModal>
  );
};

export default Modal;
