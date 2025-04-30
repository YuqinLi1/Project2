import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Typography,
  Steps,
  Tag,
  Space,
  Alert,
  Divider,
  Row,
  Col,
  Statistic,
  Timeline,
  Modal,
  Descriptions,
  Badge,
  Tooltip,
  List,
  Upload,
  Spin,
  Empty,
} from "antd";
import {
  GlobalOutlined,
  UploadOutlined,
  DownloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Dragger } = Upload;

const VisaStatus = ({
  visaData,
  loading,
  uploadLoading,
  downloadLoading,
  previewLoading,
  onUploadDocument,
  onDownloadDocument,
  onPreviewDocument,
  onDownloadTemplate,
  error,
}) => {
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    // Reset file list when upload is successful
    if (!uploadLoading && fileList.length > 0) {
      setFileList([]);
      setUploadModalVisible(false);
    }
  }, [uploadLoading]);

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Alert message="Error" description={error} type="error" showIcon />
      </Card>
    );
  }

  if (!visaData) {
    return (
      <Card>
        <Empty description="No visa information available" />
      </Card>
    );
  }

  const {
    visaType,
    visaStartDate,
    visaEndDate,
    documents,
    nextDocument,
    steps,
  } = visaData;

  const calculateDaysRemaining = () => {
    if (!visaEndDate) return null;

    const end = dayjs(visaEndDate);
    const today = dayjs();
    return end.diff(today, "day");
  };

  const daysRemaining = calculateDaysRemaining();

  const getCurrentStepIndex = () => {
    if (!steps || steps.length === 0) return -1;
    return steps.findIndex((step) => step.status === "process");
  };

  const getCurrentStepStatus = () => {
    if (!steps || steps.length === 0) return null;

    const currentStep = steps.find((step) => step.status === "process");
    if (!currentStep) return null;

    const currentDocumentStatus = documents?.find(
      (doc) => doc.name === currentStep.title
    );

    if (currentDocumentStatus) {
      return currentDocumentStatus.status;
    }

    return null;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge status="success" text="Approved" />;
      case "pending":
        return <Badge status="processing" text="Pending" />;
      case "rejected":
        return <Badge status="error" text="Rejected" />;
      default:
        return <Badge status="default" text="Not Started" />;
    }
  };

  const getStatusMessage = () => {
    if (!steps || steps.length === 0) return null;

    const currentStep = steps.find((step) => step.status === "process");
    if (!currentStep) return null;

    const currentDocumentStatus = documents?.find(
      (doc) => doc.name === currentStep.title
    );

    if (currentDocumentStatus) {
      switch (currentDocumentStatus.status) {
        case "pending":
          return `Waiting for HR to approve your ${currentStep.title}.`;
        case "approved":
          return `Your ${currentStep.title} has been approved.`;
        case "rejected":
          return `Your ${currentStep.title} has been rejected. Please see feedback and resubmit.`;
        default:
          return null;
      }
    } else {
      return `Please upload your ${currentStep.title}.`;
    }
  };

  const handlePreviewDocument = (document) => {
    setCurrentDocument(document);
    setPreviewModalVisible(true);
    onPreviewDocument && onPreviewDocument(document._id);
  };

  const handleTemplateModalOpen = () => {
    setTemplateModalVisible(true);
  };

  const handleDownloadTemplate = (templateType) => {
    onDownloadTemplate && onDownloadTemplate(templateType);
  };

  const handleUploadClick = (docType) => {
    setDocumentType(docType);
    setUploadModalVisible(true);
  };

  const handleFileChange = (info) => {
    setFileList(info.fileList.slice(-1)); // Only keep the latest file
  };

  const handleUpload = () => {
    if (fileList.length === 0) {
      return;
    }

    const file = fileList[0].originFileObj;
    onUploadDocument(documentType, file);
  };

  const handleCloseUploadModal = () => {
    setUploadModalVisible(false);
    setFileList([]);
  };

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <GlobalOutlined style={{ marginRight: 8, fontSize: 20 }} />
          <Title level={4} style={{ margin: 0 }}>
            Visa Status Management
          </Title>
        </div>
      }
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card>
            <Statistic
              title="Visa Type"
              value={visaType}
              prefix={<GlobalOutlined />}
            />
            <Divider />
            <Statistic
              title="Days Remaining"
              value={daysRemaining}
              valueStyle={{
                color:
                  daysRemaining < 30
                    ? "#f5222d"
                    : daysRemaining < 90
                    ? "#faad14"
                    : "#52c41a",
              }}
              suffix="days"
            />
            <Divider />
            <Descriptions column={1}>
              <Descriptions.Item label="Start Date">
                {visaStartDate
                  ? dayjs(visaStartDate).format("MM/DD/YYYY")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {visaEndDate ? dayjs(visaEndDate).format("MM/DD/YYYY") : "N/A"}
              </Descriptions.Item>
            </Descriptions>

            {daysRemaining < 90 && (
              <Alert
                message="Visa Expiration Warning"
                description={`Your ${visaType} will expire in ${daysRemaining} days. Please contact HR for next steps.`}
                type="warning"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </Card>

          <Card title="Document History" style={{ marginTop: 24 }}>
            {documents && documents.length > 0 ? (
              <Timeline>
                {documents.map((doc) => (
                  <Timeline.Item
                    key={doc._id}
                    color={
                      doc.status === "approved"
                        ? "green"
                        : doc.status === "pending"
                        ? "blue"
                        : "red"
                    }
                  >
                    <div style={{ marginBottom: 8 }}>
                      <Text strong>{doc.name}</Text>{" "}
                      {getStatusBadge(doc.status)}
                    </div>
                    <div>
                      Uploaded: {dayjs(doc.createdAt).format("MM/DD/YYYY")}
                    </div>
                    {doc.status === "approved" && doc.reviewedAt && (
                      <div>
                        Approved: {dayjs(doc.reviewedAt).format("MM/DD/YYYY")}
                      </div>
                    )}
                    {doc.status === "rejected" && doc.feedback && (
                      <div style={{ marginTop: 8 }}>
                        <Text type="danger">Feedback: {doc.feedback}</Text>
                      </div>
                    )}
                    <Space style={{ marginTop: 8 }}>
                      <Button
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => onDownloadDocument(doc._id)}
                        loading={downloadLoading === doc._id}
                      >
                        Download
                      </Button>
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handlePreviewDocument(doc)}
                        loading={previewLoading === doc._id}
                      >
                        Preview
                      </Button>
                    </Space>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty description="No documents uploaded yet" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card>
            <Steps
              current={getCurrentStepIndex()}
              direction="vertical"
              style={{ marginBottom: 24 }}
            >
              {steps &&
                steps.map((step, index) => (
                  <Step
                    key={index}
                    title={step.title}
                    description={step.description}
                    status={step.status}
                  />
                ))}
            </Steps>

            <Divider />

            <div style={{ marginBottom: 24 }}>
              <Alert
                message="Current Status"
                description={getStatusMessage()}
                type={
                  getCurrentStepStatus() === "approved"
                    ? "success"
                    : getCurrentStepStatus() === "pending"
                    ? "info"
                    : getCurrentStepStatus() === "rejected"
                    ? "error"
                    : "warning"
                }
                showIcon
              />
            </div>

            {nextDocument === "OPT EAD" && (
              <Card
                title="Upload OPT EAD"
                type="inner"
                extra={
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={() => handleUploadClick("OPT EAD")}
                    disabled={getCurrentStepStatus() === "pending"}
                    loading={uploadLoading === "OPT EAD"}
                  >
                    Upload Document
                  </Button>
                }
              >
                <Paragraph>
                  After receiving your OPT EAD card, please upload a clear scan
                  or photo of the card (front and back).
                </Paragraph>
                <Paragraph>
                  <strong>Note:</strong> Make sure the document clearly shows
                  your name, SEVIS number, and validity dates.
                </Paragraph>
              </Card>
            )}

            {nextDocument === "I-983" && (
              <Card
                title="I-983 Form"
                type="inner"
                extra={
                  <Space>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={handleTemplateModalOpen}
                    >
                      Get Templates
                    </Button>
                    <Button
                      type="primary"
                      icon={<UploadOutlined />}
                      onClick={() => handleUploadClick("I-983")}
                      disabled={getCurrentStepStatus() === "pending"}
                      loading={uploadLoading === "I-983"}
                    >
                      Upload Document
                    </Button>
                  </Space>
                }
              >
                <Paragraph>
                  The I-983 form is required for all STEM OPT extensions. Please
                  download the form template, fill out the required sections,
                  and then upload the completed form.
                </Paragraph>
                <Paragraph>
                  <strong>Instructions:</strong>
                </Paragraph>
                <ul>
                  <li>Download both the empty template and sample template</li>
                  <li>Fill out all student sections based on the sample</li>
                  <li>Leave employer sections blank for HR to complete</li>
                  <li>Upload the filled form as a PDF</li>
                </ul>
              </Card>
            )}

            {nextDocument === "I-20" && (
              <Card
                title="Upload New I-20"
                type="inner"
                extra={
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={() => handleUploadClick("I-20")}
                    disabled={getCurrentStepStatus() === "pending"}
                    loading={uploadLoading === "I-20"}
                  >
                    Upload Document
                  </Button>
                }
              >
                <Paragraph>
                  After your school has approved your I-983 form, you will
                  receive a new I-20 document. Please upload a scan of all pages
                  of your new I-20.
                </Paragraph>
                <Paragraph>
                  <strong>Important:</strong> The I-20 must be signed by both
                  you and the DSO (Designated School Official). Make sure all
                  pages are included in the upload.
                </Paragraph>
              </Card>
            )}

            {documents &&
              documents.some((doc) => doc.status === "rejected") && (
                <Card
                  title="Rejected Documents"
                  type="inner"
                  style={{ marginTop: 24, borderLeft: "4px solid #f5222d" }}
                >
                  {documents
                    .filter((doc) => doc.status === "rejected")
                    .map((doc) => (
                      <div key={doc._id} style={{ marginBottom: 16 }}>
                        <Space align="start">
                          <CloseCircleOutlined
                            style={{ color: "#f5222d", fontSize: 20 }}
                          />
                          <div>
                            <Text strong>{doc.name}</Text>
                            <div style={{ marginTop: 4 }}>
                              <Text type="danger">
                                Feedback: {doc.feedback}
                              </Text>
                            </div>
                            <div style={{ marginTop: 8 }}>
                              <Button
                                type="primary"
                                danger
                                onClick={() => handleUploadClick(doc.name)}
                                loading={uploadLoading === doc.name}
                              >
                                Reupload
                              </Button>
                            </div>
                          </div>
                        </Space>
                        {documents
                          .filter((doc) => doc.status === "rejected")
                          .indexOf(doc) <
                          documents.filter((doc) => doc.status === "rejected")
                            .length -
                            1 && <Divider />}
                      </div>
                    ))}
                </Card>
              )}
          </Card>
        </Col>
      </Row>

      {/* Document Preview Modal */}
      <Modal
        title={`Document Preview: ${currentDocument?.name || "Document"}`}
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
              onDownloadDocument(currentDocument._id);
              setPreviewModalVisible(false);
            }}
            loading={downloadLoading === currentDocument?._id}
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
                  <Text strong>Type:</Text> {currentDocument.name}
                </Col>
                <Col span={12}>
                  <Text strong>Status:</Text>{" "}
                  {getStatusBadge(currentDocument.status)}
                </Col>
                <Col span={12}>
                  <Text strong>Upload Date:</Text>{" "}
                  {dayjs(currentDocument.createdAt).format("MM/DD/YYYY")}
                </Col>
                {currentDocument.reviewedAt && (
                  <Col span={12}>
                    <Text strong>Review Date:</Text>{" "}
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
              {previewLoading === currentDocument._id ? (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Spin size="large" />
                </div>
              ) : (
                <iframe
                  src={`/api/documents/${currentDocument._id}/preview`}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title="Document Preview"
                />
              )}
            </div>
          </>
        )}
      </Modal>

      {/* Template Download Modal */}
      <Modal
        title="I-983 Form Templates"
        visible={templateModalVisible}
        onCancel={() => setTemplateModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setTemplateModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        <List
          itemLayout="horizontal"
          dataSource={[
            {
              title: "Empty I-983 Template",
              description: "Download the empty form to fill out",
              type: "empty",
            },
            {
              title: "Sample I-983 Template",
              description: "View a sample filled form as a reference",
              type: "sample",
            },
          ]}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="download"
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownloadTemplate(item.type)}
                >
                  Download
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<FileOutlined style={{ fontSize: 24 }} />}
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
        <Divider />
        <Alert
          message="Instructions for I-983 Form"
          description={
            <ul>
              <li>
                Download and carefully review both the empty form and the sample
                form
              </li>
              <li>Fill out Sections 1 and 2 (Student Information)</li>
              <li>Complete the Student Evaluation sections</li>
              <li>Sign the form where required</li>
              <li>Leave employer sections blank - HR will complete these</li>
              <li>Upload the form as a PDF when complete</li>
            </ul>
          }
          type="info"
          showIcon
        />
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        title={`Upload ${documentType}`}
        visible={uploadModalVisible}
        onOk={handleUpload}
        onCancel={handleCloseUploadModal}
        okText="Upload"
        okButtonProps={{
          disabled: fileList.length === 0,
          loading: uploadLoading === documentType,
        }}
      >
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

        {error && (
          <Alert
            message="Upload Error"
            description={error}
            type="error"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Modal>
    </Card>
  );
};

export default VisaStatus;
