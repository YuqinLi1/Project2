import React, { useState } from "react";
import { Form, Select, Upload, Button as AntButton } from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import Button from "../common/Button";

const { Option } = Select;
const { Dragger } = Upload;

const DocumentUploadForm = ({ onSubmit, loading, documentTypes = [] }) => {
  const [fileList, setFileList] = useState([]);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const handleFileChange = (info) => {
    let newFileList = [...info.fileList];
    // Keep only the latest file
    newFileList = newFileList.slice(-1);
    setFileList(newFileList);
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Controller
        name="type"
        control={control}
        rules={{ required: "Please select document type" }}
        render={({ field }) => (
          <Form.Item
            label="Document Type"
            required
            validateStatus={errors.type ? "error" : ""}
            help={errors.type?.message}
          >
            <Select placeholder="Select document type" {...field}>
              {documentTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
      />

      <Controller
        name="document"
        control={control}
        rules={{ required: "Please upload a document" }}
        valuePropName="fileList"
        getValueFromEvent={normFile}
        render={({ field }) => (
          <Form.Item
            label="Document"
            required
            validateStatus={errors.document ? "error" : ""}
            help={errors.document?.message}
          >
            <Dragger
              {...field}
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={() => false}
              maxCount={1}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single upload. PDF, JPG, PNG files only.
              </p>
            </Dragger>
          </Form.Item>
        )}
      />

      <Form.Item style={{ marginTop: 16 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Upload Document
        </Button>
      </Form.Item>
    </Form>
  );
};

export default DocumentUploadForm;
