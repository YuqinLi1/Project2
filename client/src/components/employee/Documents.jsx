import React, { useState } from "react";
import {
  Card,
  Button,
  Typography,
  Space,
  List,
  Tag,
  Upload,
  Modal,
  Spin,
  Empty,
  Row,
  Col,
  Tooltip,
} from "antd";
import {
  FileOutlined,
  UploadOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileAddOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

const Documents = ({
  documents,
  loading,
  onUpload,
  onDownload,
  onPreview,
  allowUpload = true,
}) => {
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [fileList, setFileList] = useState([]);

  const documentTypes = [
    { value: "driverLicense", label: "Driver's License" },
    { value: "passport", label: "Passport" },
    { value: "socialSecurity", label: "Social Security Card" },
    { value: "workAuthorization", label: "Work Authorization" },
  ];

  const handlePreview = (document) => {
    setCurrentDocument(document);
    setPreviewModalVisible(true);
    onPreview && onPreview(document._id);
  };

  const handleUploadModalOpen = () => {
    setUploadModalVisible(true);
  };

  const handleUploadModalClose = () => {
    setUploadModalVisible(false);
    setFileList([]);
    setDocumentType("");
  };

  const handleFileChange = (info) => {
    setFileList(info.fileList.slice(-1)); // Only keep the latest file
  };

  const handleDocumentTypeChange = (type) => {
    setDocumentType(type);
  };

  const handleUpload = () => {
    if (fileList.length === 0 || !documentType) {
      return;
    }

    const file = fileList[0].originFileObj;
    onUpload(documentType, file);
    handleUploadModalClose();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "rejected":
        return <CloseCircleOutlined style={{ color: "#f5222d" }} />;
      case "pending":
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
      default:
        return <FileOutlined />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <FileOutlined style={{ marginRight: 8, fontSize: 20 }} />
          <Title level={4} style={{ margin: 0 }}>
            Documents
          </Title>
        </div>
      }
      extra={
        allowUpload && (
          <Button
            type="primary"
            icon={<FileAddOutlined />}
            onClick={handleUploadModalOpen}
          >
            Upload Document
          </Button>
        )
      }
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
        </div>
      ) : documents && documents.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={documents}
          renderItem={(document) => (
            <List.Item
              actions={[
                <Tooltip title="Preview">
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() => handlePreview(document)}
                  />
                </Tooltip>,
                <Tooltip title="Download">
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => onDownload(document._id)}
                  />
                </Tooltip>,
              ]}
            >
              <List.Item.Meta
                avatar={getStatusIcon(document.status)}
                title={
                  <Space>
                    <Text strong>{document.type}</Text>
                    <Tag color={getStatusColor(document.status)}>
                      {document.status.toUpperCase()}
                    </Tag>
                  </Space>
                }
                description={
                  <>
                    <div>File Name: {document.fileName}</div>
                    <div>
                      Uploaded: {dayjs(document.createdAt).format("MM/DD/YYYY")}
                    </div>
                    {document.feedback && (
                      <div>
                        <Text
                          type={
                            document.status === "rejected"
                              ? "danger"
                              : "secondary"
                          }
                        >
                          Feedback: {document.feedback}
                        </Text>
                      </div>
                    )}
                  </>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty
          description="No documents uploaded yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      {/* Preview Modal */}
      <Modal
        title={`Document Preview: ${currentDocument?.type}`}
        visible={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => {
              onDownload(currentDocument._id);
              setPreviewModalVisible(false);
            }}
          >
            Download
          </Button>,
        ]}
        width={800}
      >
        {currentDocument && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>File Name:</Text> {currentDocument.fileName}
                </Col>
                <Col span={12}>
                  <Text strong>Upload Date:</Text>{" "}
                  {dayjs(currentDocument.createdAt).format("MM/DD/YYYY")}
                </Col>
                <Col span={12}>
                  <Text strong>Status:</Text>{" "}
                  <Tag color={getStatusColor(currentDocument.status)}>
                    {currentDocument.status.toUpperCase()}
                  </Tag>
                </Col>
                {currentDocument.reviewedAt && (
                  <Col span={12}>
                    <Text strong>Reviewed Date:</Text>{" "}
                    {dayjs(currentDocument.reviewedAt).format("MM/DD/YYYY")}
                  </Col>
                )}
              </Row>
            </div>

            {currentDocument.feedback && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>Feedback:</Text>
                <div
                  style={{
                    background: "#f5f5f5",
                    padding: 12,
                    borderRadius: 4,
                    marginTop: 8,
                  }}
                >
                  {currentDocument.feedback}
                </div>
              </div>
            )}

            <div
              style={{
                height: "60vh",
                border: "1px solid #d9d9d9",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <iframe
                src={`/api/documents/${currentDocument._id}/preview`}
                style={{ width: "100%", height: "100%", border: "none" }}
                title="Document Preview"
              />
            </div>
          </>
        )}
      </Modal>

      {/* Upload Modal */}
      <Modal
        title="Upload Document"
        visible={uploadModalVisible}
        onOk={handleUpload}
        onCancel={handleUploadModalClose}
        okText="Upload"
        okButtonProps={{ disabled: fileList.length === 0 || !documentType }}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Select Document Type:</Text>
          <div style={{ marginTop: 8 }}>
            <Space wrap>
              {documentTypes.map((type) => (
                <Button
                  key={type.value}
                  type={documentType === type.value ? "primary" : "default"}
                  onClick={() => handleDocumentTypeChange(type.value)}
                >
                  {type.label}
                </Button>
              ))}
            </Space>
          </div>
        </div>

        <Dragger
          fileList={fileList}
          onChange={handleFileChange}
          beforeUpload={() => false}
          accept=".pdf,.jpg,.jpeg,.png"
          multiple={false}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for PDF, JPG, JPEG or PNG. File size must be less than 5MB.
          </p>
        </Dragger>
      </Modal>
    </Card>
  );
};

export default Documents;
