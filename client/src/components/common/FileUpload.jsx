import React, { useState } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;

const FileUpload = ({
  multiple = false,
  accept,
  maxSize = 5, // in MB
  onChange,
  value,
  dragger = false,
  buttonText = "Upload",
  draggerText = "Click or drag file to this area to upload",
  draggerHint = "Support for a single or bulk upload",
  disabled = false,
}) => {
  const [fileList, setFileList] = useState(value || []);

  const handleChange = (info) => {
    let newFileList = [...info.fileList];

    // Limit number of files if not multiple
    if (!multiple) {
      newFileList = newFileList.slice(-1);
    }

    // Handle file status
    newFileList = newFileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });

    setFileList(newFileList);

    // Call parent onChange
    if (onChange) {
      const files = multiple ? newFileList : newFileList[0];
      onChange(files);
    }

    // Handle status change
    const { status, name } = info.file;
    if (status === "done") {
      message.success(`${name} file uploaded successfully.`);
    } else if (status === "error") {
      message.error(`${name} file upload failed.`);
    }
  };

  const beforeUpload = (file) => {
    const isAccepted =
      !accept ||
      accept
        .split(",")
        .some((type) =>
          file.type.match(new RegExp(type.trim().replace("*", ".*")))
        );

    if (!isAccepted) {
      message.error(`${file.name} is not a valid file type.`);
    }

    const isLessThanMaxSize = file.size / 1024 / 1024 < maxSize;
    if (!isLessThanMaxSize) {
      message.error(`File must be smaller than ${maxSize}MB.`);
    }

    return isAccepted && isLessThanMaxSize;
  };

  const uploadProps = {
    name: "file",
    fileList,
    beforeUpload,
    onChange: handleChange,
    multiple,
    accept,
    disabled,
  };

  if (dragger) {
    return (
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{draggerText}</p>
        <p className="ant-upload-hint">{draggerHint}</p>
      </Dragger>
    );
  }

  return (
    <Upload {...uploadProps}>
      <Button icon={<UploadOutlined />} disabled={disabled}>
        {buttonText}
      </Button>
    </Upload>
  );
};

export default FileUpload;
