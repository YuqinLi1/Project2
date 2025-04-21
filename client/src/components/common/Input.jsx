import React from "react";
import { Input as AntInput, Form } from "antd";

const { TextArea, Password } = AntInput;

const Input = ({
  type = "text",
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  prefix,
  suffix,
  addonBefore,
  addonAfter,
  size = "middle",
  error,
  rows,
  ...rest
}) => {
  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <TextArea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows || 4}
            {...rest}
          />
        );
      case "password":
        return (
          <Password
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            prefix={prefix}
            size={size}
            {...rest}
          />
        );
      default:
        return (
          <AntInput
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            prefix={prefix}
            suffix={suffix}
            addonBefore={addonBefore}
            addonAfter={addonAfter}
            size={size}
            {...rest}
          />
        );
    }
  };

  if (label) {
    return (
      <Form.Item
        label={label}
        required={required}
        validateStatus={error ? "error" : ""}
        help={error}
      >
        {renderInput()}
      </Form.Item>
    );
  }

  return renderInput();
};

export default Input;
