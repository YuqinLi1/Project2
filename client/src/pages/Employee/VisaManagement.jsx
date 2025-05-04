import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Layout,
  Typography,
  Card,
  Steps,
  Space,
  Divider,
  Row,
  Col,
  Modal,
  Spin,
  Alert,
  List,
  Empty,
  message,
  Timeline,
  Statistic,
  Badge,
  Tooltip,
  Button,
  Avatar,
  Tag,
  Upload,
} from "antd";
import {
  UserOutlined,
  GlobalOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  IdcardOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import moment from "moment";

// Import components
import DocumentUpload from "../../components/common/FileUpload";
import MainLayout from "../../components/common/MainLayout";

// Import Redux actions - using only the available actions
import {
  getVisaStatus,
  uploadDocument, // Use this for all document uploads
  getProfile,
} from "../../redux/actions/employmentActions";
import { logout } from "../../redux/actions/authActions";
import { setAlert } from "../../redux/actions/uiActions";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Dragger } = Upload;

const VisaManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { visaStatus, loading, error, uploadLoading, employeeInfo } =
    useSelector((state) => state.employment || {});

  // Local state
  const [documentToUpload, setDocumentToUpload] = useState(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);

  // Fetch visa status on component mount
  useEffect(() => {
    dispatch(getVisaStatus());
    dispatch(getProfile());
  }, [dispatch]);

  // Handle file upload
  const handleFileChange = (info) => {
    setFileList(info.fileList.slice(-1)); // Only keep the latest file
  };

  // Handle document upload
  const handleUploadClick = (docType) => {
    setDocumentToUpload(docType);
    setUploadModalVisible(true);
  };

  // Handle document upload submission
  const handleUpload = async () => {
    if (fileList.length === 0) {
      dispatch(setAlert("Please select a file to upload", "error"));
      return;
    }

    const file = fileList[0].originFileObj;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentToUpload);

    try {
      // Use the available uploadDocument action
      await dispatch(uploadDocument(formData));

      // Show success message
      dispatch(
        setAlert(`${documentToUpload} uploaded successfully`, "success")
      );

      // Reset state
      setUploadModalVisible(false);
      setFileList([]);

      // Refresh visa status
      dispatch(getVisaStatus());
    } catch (err) {
      dispatch(
        setAlert(
          `Failed to upload document: ${err?.message || "Unknown error"}`,
          "error"
        )
      );
    }
  };

  // Handle document preview
  const handlePreviewDocument = (document) => {
    setPreviewDocument(document);
    setPreviewModalVisible(true);
  };

  // Handle document download
  const handleDownloadDocument = (document) => {
    // Without a dedicated downloadDocument action, we can handle it with window.open
    window.open(`/api/documents/${document._id}/download`, "_blank");
    dispatch(setAlert("Document download started", "success"));
  };

  // Handle template download
  const handleDownloadTemplate = (type) => {
    // You can implement template download with window.open
    window.open(`/api/visa-status/templates/${type}`, "_blank");
    dispatch(setAlert(`${type} template download started`, "success"));
  };

  // Get document status
  const getDocumentStatus = (documentType) => {
    if (!visaStatus?.documents) return "not-started";

    const document = visaStatus.documents.find(
      (doc) => doc.type === documentType
    );
    return document ? document.status : "not-started";
  };

  // Get status badge
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

  // Get current step in OPT process
  const getCurrentStep = () => {
    // OPT process steps: OPT Receipt -> OPT EAD -> I-983 -> I-20
    const steps = ["OPT Receipt", "OPT EAD", "I-983", "I-20"];

    if (!visaStatus?.documents) {
      return { index: 0, current: "OPT Receipt", nextDocument: "OPT Receipt" };
    }

    const statuses = steps.map((step) => {
      const doc = visaStatus.documents.find((d) => d.type === step);
      return doc ? doc.status : "not-started";
    });

    // If all documents are approved, return completed
    if (statuses.every((status) => status === "approved")) {
      return {
        index: steps.length,
        current: "completed",
        nextDocument: null,
      };
    }

    // Find the first document that is not approved
    const currentIndex = statuses.findIndex((status) => status !== "approved");
    if (currentIndex === -1)
      return { index: 0, current: "OPT Receipt", nextDocument: "OPT Receipt" };

    return {
      index: currentIndex,
      current: steps[currentIndex],
      nextDocument: steps[currentIndex],
    };
  };

  // Calculate days remaining for visa
  const calculateDaysRemaining = () => {
    if (!visaStatus || !visaStatus.visaEndDate) {
      // If we have employeeInfo but no visaStatus, try to get visa end date from employee info
      if (employeeInfo?.employment?.visaEndDate) {
        const end = new Date(employeeInfo.employment.visaEndDate);
        const today = new Date();
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
      }
      return null;
    }

    const end = new Date(visaStatus.visaEndDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = calculateDaysRemaining();
  const {
    index: currentStepIndex,
    current: currentStep,
    nextDocument,
  } = getCurrentStep();

  // Handle the case where there's no OPT visa
  const visaType = visaStatus?.visaType || employeeInfo?.employment?.visaType;

  if (
    employeeInfo &&
    employeeInfo.employment &&
    employeeInfo.employment.visaType !== "F1(OPT)"
  ) {
    return (
      <MainLayout activeMenuItem="visa-status">
        <Content style={{ padding: "24px" }}>
          <Card>
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <GlobalOutlined style={{ fontSize: 64, color: "#1890ff" }} />
              <Title level={3} style={{ marginTop: 16 }}>
                Visa Status Management
              </Title>
              <Paragraph>
                Visa status tracking is not required for your work authorization
                type.
              </Paragraph>
              <Button
                type="primary"
                onClick={() => navigate("/employee/dashboard")}
                style={{ marginTop: 16 }}
              >
                Return to Dashboard
              </Button>
            </div>
          </Card>
        </Content>
      </MainLayout>
    );
  }

  // Loading state
  if (loading && !visaStatus) {
    return (
      <MainLayout activeMenuItem="visa-status">
        <Content
          style={{
            padding: "24px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "70vh",
          }}
        >
          <Spin size="large" />
        </Content>
      </MainLayout>
    );
  }

  // Error state
  if (error && !visaStatus) {
    return (
      <MainLayout activeMenuItem="visa-status">
        <Content style={{ padding: "24px" }}>
          <Alert
            message="Error Loading Visa Status"
            description={error}
            type="error"
            showIcon
          />
        </Content>
      </MainLayout>
    );
  }

  return (
    <MainLayout activeMenuItem="visa-status">
      <Content style={{ padding: "24px" }}>
        <Row gutter={[16, 16]}>
          {/* Visa Status Summary */}
          <Col xs={24} lg={8}>
            <Card>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <GlobalOutlined style={{ fontSize: 48, color: "#1890ff" }} />
                <Title level={3} style={{ marginTop: 16, marginBottom: 0 }}>
                  {visaType || "F1(OPT)"}
                </Title>
                <Text type="secondary">Work Authorization Status</Text>
              </div>

              <Divider />

              <Statistic
                title="Days Remaining"
                value={daysRemaining || 0}
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

              <Space direction="vertical" style={{ width: "100%" }}>
                <Row>
                  <Col span={12}>
                    <Text strong>Start Date:</Text>
                  </Col>
                  <Col span={12}>
                    {visaStatus?.visaStartDate ||
                    employeeInfo?.employment?.visaStartDate
                      ? moment(
                          visaStatus?.visaStartDate ||
                            employeeInfo?.employment?.visaStartDate
                        ).format("MMMM D, YYYY")
                      : "N/A"}
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <Text strong>End Date:</Text>
                  </Col>
                  <Col span={12}>
                    {visaStatus?.visaEndDate ||
                    employeeInfo?.employment?.visaEndDate
                      ? moment(
                          visaStatus?.visaEndDate ||
                            employeeInfo?.employment?.visaEndDate
                        ).format("MMMM D, YYYY")
                      : "N/A"}
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <Text strong>Status:</Text>
                  </Col>
                  <Col span={12}>
                    <Tag
                      color={
                        daysRemaining < 30
                          ? "red"
                          : daysRemaining < 90
                          ? "orange"
                          : "green"
                      }
                    >
                      {daysRemaining < 30
                        ? "Critical"
                        : daysRemaining < 90
                        ? "Warning"
                        : "Good Standing"}
                    </Tag>
                  </Col>
                </Row>
              </Space>

              {daysRemaining < 90 && (
                <Alert
                  message="Visa Expiration Warning"
                  description={`Your OPT will expire in ${daysRemaining} days. Please complete the required documentation to maintain your work authorization.`}
                  type="warning"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>

            {/* Document History */}
            <Card
              title={
                <>
                  <FileOutlined /> Document History
                </>
              }
              style={{ marginTop: 16 }}
            >
              {visaStatus?.documents && visaStatus.documents.length > 0 ? (
                <Timeline>
                  {visaStatus.documents.map((doc) => (
                    <Timeline.Item
                      key={doc._id || `doc-${doc.type}`}
                      color={
                        doc.status === "approved"
                          ? "green"
                          : doc.status === "pending"
                          ? "blue"
                          : "red"
                      }
                    >
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>{doc.type}</Text>{" "}
                        {getStatusBadge(doc.status)}
                      </div>
                      <div>
                        Uploaded:{" "}
                        {moment(doc.createdAt || doc.uploadDate).format(
                          "MMM D, YYYY"
                        )}
                      </div>
                      {doc.status === "rejected" && doc.feedback && (
                        <div style={{ marginTop: 8 }}>
                          <Text type="danger">Feedback: {doc.feedback}</Text>
                        </div>
                      )}
                      <div style={{ marginTop: 8 }}>
                        <Button
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownloadDocument(doc)}
                          style={{ marginRight: 8 }}
                        >
                          Download
                        </Button>
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handlePreviewDocument(doc)}
                        >
                          Preview
                        </Button>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <Empty description="No documents uploaded yet" />
              )}
            </Card>
          </Col>

          {/* OPT Document Process */}
          <Col xs={24} lg={16}>
            <Card>
              <Title level={4}>OPT Document Process</Title>
              <Text type="secondary">
                Follow these steps to maintain your OPT status. Upload each
                document as required and wait for HR approval before proceeding
                to the next step.
              </Text>

              <Steps
                current={currentStepIndex}
                direction="vertical"
                style={{ marginTop: 24, marginBottom: 24 }}
              >
                <Step
                  title="OPT Receipt"
                  description="Submit your OPT receipt from USCIS"
                  status={
                    getDocumentStatus("OPT Receipt") === "approved"
                      ? "finish"
                      : getDocumentStatus("OPT Receipt") === "rejected"
                      ? "error"
                      : getDocumentStatus("OPT Receipt") === "pending"
                      ? "process"
                      : currentStep === "OPT Receipt"
                      ? "process"
                      : "wait"
                  }
                />
                <Step
                  title="OPT EAD"
                  description="Upload your Employment Authorization Document"
                  status={
                    getDocumentStatus("OPT EAD") === "approved"
                      ? "finish"
                      : getDocumentStatus("OPT EAD") === "rejected"
                      ? "error"
                      : getDocumentStatus("OPT EAD") === "pending"
                      ? "process"
                      : currentStep === "OPT EAD"
                      ? "process"
                      : "wait"
                  }
                />
                <Step
                  title="I-983"
                  description="Complete and upload the I-983 training plan"
                  status={
                    getDocumentStatus("I-983") === "approved"
                      ? "finish"
                      : getDocumentStatus("I-983") === "rejected"
                      ? "error"
                      : getDocumentStatus("I-983") === "pending"
                      ? "process"
                      : currentStep === "I-983"
                      ? "process"
                      : "wait"
                  }
                />
                <Step
                  title="I-20"
                  description="Upload your new I-20 with OPT endorsement"
                  status={
                    getDocumentStatus("I-20") === "approved"
                      ? "finish"
                      : getDocumentStatus("I-20") === "rejected"
                      ? "error"
                      : getDocumentStatus("I-20") === "pending"
                      ? "process"
                      : currentStep === "I-20"
                      ? "process"
                      : "wait"
                  }
                />
              </Steps>

              <Divider />

              {/* Current Step Status */}
              {currentStep === "completed" ? (
                <Alert
                  message="All Documents Approved"
                  description="You have completed all required document submissions for your OPT status."
                  type="success"
                  showIcon
                />
              ) : getDocumentStatus(currentStep) === "pending" ? (
                <Alert
                  message="Document Under Review"
                  description={`Your ${currentStep} is currently being reviewed by HR. You will be notified once it's approved.`}
                  type="info"
                  showIcon
                />
              ) : getDocumentStatus(currentStep) === "rejected" ? (
                <Alert
                  message="Document Rejected"
                  description={`Your ${currentStep} has been rejected. Please review the feedback and upload a corrected version.`}
                  type="error"
                  showIcon
                />
              ) : (
                <Alert
                  message="Action Required"
                  description={`Please upload your ${currentStep} document to continue the OPT process.`}
                  type="warning"
                  showIcon
                />
              )}

              {/* OPT Receipt Upload Section */}
              {currentStep === "OPT Receipt" &&
                getDocumentStatus("OPT Receipt") !== "pending" && (
                  <Card
                    title={
                      <>
                        <FileOutlined /> Upload OPT Receipt
                      </>
                    }
                    style={{ marginTop: 16 }}
                    extra={
                      <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        onClick={() => handleUploadClick("OPT Receipt")}
                        loading={uploadLoading}
                      >
                        Upload Document
                      </Button>
                    }
                  >
                    <Paragraph>
                      After applying for OPT, you will receive a receipt notice
                      from USCIS. Please upload a clear scan or photo of this
                      receipt.
                    </Paragraph>
                    <Paragraph>
                      <strong>Note:</strong> Make sure the document clearly
                      shows your name, receipt number, and USCIS case number.
                    </Paragraph>
                  </Card>
                )}

              {/* OPT EAD Upload Section */}
              {currentStep === "OPT EAD" &&
                getDocumentStatus("OPT EAD") !== "pending" && (
                  <Card
                    title={
                      <>
                        <IdcardOutlined /> Upload OPT EAD
                      </>
                    }
                    style={{ marginTop: 16 }}
                    extra={
                      <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        onClick={() => handleUploadClick("OPT EAD")}
                        loading={uploadLoading}
                      >
                        Upload Document
                      </Button>
                    }
                  >
                    <Paragraph>
                      After receiving your OPT EAD card, please upload a clear
                      scan or photo of the card (front and back).
                    </Paragraph>
                    <Paragraph>
                      <strong>Note:</strong> Make sure the document clearly
                      shows your name, SEVIS number, and validity dates.
                    </Paragraph>
                  </Card>
                )}

              {/* I-983 Upload Section */}
              {currentStep === "I-983" &&
                getDocumentStatus("I-983") !== "pending" && (
                  <Card
                    title={
                      <>
                        <FileTextOutlined /> I-983 Form
                      </>
                    }
                    style={{ marginTop: 16 }}
                    extra={
                      <Space>
                        <Button
                          icon={<DownloadOutlined />}
                          onClick={() => setTemplateModalVisible(true)}
                        >
                          Get Templates
                        </Button>
                        <Button
                          type="primary"
                          icon={<UploadOutlined />}
                          onClick={() => handleUploadClick("I-983")}
                          loading={uploadLoading}
                        >
                          Upload Document
                        </Button>
                      </Space>
                    }
                  >
                    <Paragraph>
                      The I-983 form is required for all STEM OPT extensions.
                      Please download the form template, fill out the required
                      sections, and then upload the completed form.
                    </Paragraph>
                    <Paragraph>
                      <strong>Instructions:</strong>
                    </Paragraph>
                    <ul>
                      <li>
                        Download both the empty template and sample template
                      </li>
                      <li>Fill out all student sections based on the sample</li>
                      <li>Leave employer sections blank for HR to complete</li>
                      <li>Upload the filled form as a PDF</li>
                    </ul>
                  </Card>
                )}

              {/* I-20 Upload Section */}
              {currentStep === "I-20" &&
                getDocumentStatus("I-20") !== "pending" && (
                  <Card
                    title={
                      <>
                        <FileTextOutlined /> Upload New I-20
                      </>
                    }
                    style={{ marginTop: 16 }}
                    extra={
                      <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        onClick={() => handleUploadClick("I-20")}
                        loading={uploadLoading}
                      >
                        Upload Document
                      </Button>
                    }
                  >
                    <Paragraph>
                      After your school has approved your I-983 form, you will
                      receive a new I-20 document. Please upload a scan of all
                      pages of your new I-20.
                    </Paragraph>
                    <Paragraph>
                      <strong>Important:</strong> The I-20 must be signed by
                      both you and the DSO (Designated School Official). Make
                      sure all pages are included in the upload.
                    </Paragraph>
                  </Card>
                )}

              {/* Rejected Documents Section */}
              {visaStatus?.documents &&
                visaStatus.documents.filter((doc) => doc.status === "rejected")
                  .length > 0 && (
                  <Card
                    title={
                      <>
                        <CloseCircleOutlined style={{ color: "#f5222d" }} />{" "}
                        Rejected Documents
                      </>
                    }
                    style={{ marginTop: 24, borderLeft: "4px solid #f5222d" }}
                  >
                    {visaStatus.documents
                      .filter((doc) => doc.status === "rejected")
                      .map((doc) => (
                        <div
                          key={doc._id || `doc-${doc.type}`}
                          style={{ marginBottom: 16 }}
                        >
                          <Space align="start">
                            <CloseCircleOutlined
                              style={{ color: "#f5222d", fontSize: 20 }}
                            />
                            <div>
                              <Text strong>{doc.type}</Text>
                              <div style={{ marginTop: 4 }}>
                                <Text type="danger">
                                  Feedback: {doc.feedback}
                                </Text>
                              </div>
                              <div style={{ marginTop: 8 }}>
                                <Button
                                  type="primary"
                                  danger
                                  onClick={() => handleUploadClick(doc.type)}
                                  loading={
                                    uploadLoading &&
                                    documentToUpload === doc.type
                                  }
                                >
                                  Re-upload
                                </Button>
                              </div>
                            </div>
                          </Space>
                        </div>
                      ))}
                  </Card>
                )}
            </Card>
          </Col>
        </Row>

        {/* Document Preview Modal */}
        <Modal
          title={`Document Preview: ${previewDocument?.type || "Document"}`}
          open={previewModalVisible}
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
                handleDownloadDocument(previewDocument);
                setPreviewModalVisible(false);
              }}
            >
              Download
            </Button>,
          ]}
          width={800}
        >
          <div style={{ textAlign: "center", padding: "20px" }}>
            <FileOutlined style={{ fontSize: 64, color: "#1890ff" }} />
            <p style={{ marginTop: 16 }}>
              Document preview would display here when connected to backend.
            </p>
            <p>
              <Text type="secondary">
                Uploaded on:{" "}
                {previewDocument?.createdAt &&
                  moment(previewDocument.createdAt).format("MMMM D, YYYY")}
              </Text>
            </p>
          </div>
        </Modal>

        {/* Template Download Modal */}
        <Modal
          title="I-983 Form Templates"
          open={templateModalVisible}
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
                type: "empty-i983",
              },
              {
                title: "Sample I-983 Template",
                description: "View a sample filled form as a reference",
                type: "sample-i983",
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
                  Download and carefully review both the empty form and the
                  sample form
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
          title={`Upload ${documentToUpload}`}
          open={uploadModalVisible}
          onOk={handleUpload}
          onCancel={() => {
            setUploadModalVisible(false);
            setFileList([]);
          }}
          okText="Upload"
          okButtonProps={{
            disabled: fileList.length === 0,
            loading: uploadLoading,
          }}
        >
          <Dragger
            fileList={fileList}
            onChange={handleFileChange}
            beforeUpload={() => false}
            accept=".pdf,.jpg,.jpeg,.png"
            multiple={false}
            listType="picture"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: "#1890ff", fontSize: 48 }} />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for PDF, JPG, JPEG or PNG. File size must be less than
              5MB.
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
      </Content>
    </MainLayout>
  );
};

export default VisaManagement;
