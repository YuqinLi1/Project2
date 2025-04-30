import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Layout,
  Menu,
  Typography,
  Card,
  Steps,
  Descriptions,
  Upload,
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
  Result,
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
  InfoCircleOutlined,
  CalendarOutlined,
  InboxOutlined,
  FileTextOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import moment from "moment";

import DocumentUpload from "../../components/common/FileUpload";

// Import actions
import {
  getVisaStatus,
  uploadVisaDocument,
  uploadDocument,
  getProfile,
  updateProfile,
} from "../../redux/actions/employmentActions";
import { logout } from "../../redux/actions/authActions";
import { setAlert } from "../../redux/actions/uiActions"; // Replacing setActiveMenuItem
import { useAuth } from "../../contexts/AuthContext";

import useWindowSize from "../../hooks/useWindowSize"; // Updated from useWindowSize
import useLocalStorage from "../../hooks/useLocalStorage"; // Updated from useLocalStorage

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Dragger } = Upload;

const VisaManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const windowSize = useWindowSize();

  // Redux state
  const { isAuthenticated, user } = useAuth();
  const {
    visaStatus = null,
    loading = false,
    uploadLoading = false,
    downloadLoading = false,
    previewLoading = false,
    error = null,
    uploadError = null,
  } = useSelector((state) => {
    const employmentState = state.employment || {};
    return {
      visaStatus: employmentState.visaStatus,
      loading: employmentState.loading,
      uploadLoading: employmentState.uploadLoading,
      downloadLoading: employmentState.downloadLoading,
      previewLoading: employmentState.previewLoading,
      error: employmentState.error,
      uploadError: employmentState.uploadError,
    };
  });
  const { activeMenuItem } = useSelector(
    (state) => state.ui || { activeMenuItem: "visa-status" }
  );

  // Use localStorage for caching visa status
  const [cachedVisaStatus, setCachedVisaStatus] = useLocalStorage(
    "visaStatus",
    null
  );

  // Local state
  const [documentToUpload, setDocumentToUpload] = useState(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [collapsed, setCollapsed] = useState(windowSize.width < 768);

  // Update collapsed state when window size changes
  useEffect(() => {
    setCollapsed(windowSize.width < 768);
  }, [windowSize.width]);

  useEffect(() => {
    // if (!isAuthenticated) {
    //   navigate("/login");
    //   return;
    // }

    // Fetch visa status when component mounts
    dispatch(getVisaStatus());

    // Set active menu item - using setAlert as a placeholder
    dispatch(
      setAlert({
        type: "info",
        message: "Visa status page loaded",
        activeMenuItem: "visa-status",
      })
    );
  }, [isAuthenticated, dispatch, navigate]);

  // Update cached data when API returns new data
  useEffect(() => {
    if (visaStatus) {
      setCachedVisaStatus(visaStatus);
    }
  }, [visaStatus, setCachedVisaStatus]);

  // Reset file list when upload is successful
  useEffect(() => {
    if (!uploadLoading && fileList.length > 0) {
      setFileList([]);
      setUploadModalVisible(false);
    }
  }, [uploadLoading]);

  // Handle menu item click
  const handleMenuClick = (key) => {
    // Using setAlert as placeholder for setActiveMenuItem
    dispatch(
      setAlert({
        type: "info",
        message: `Navigating to ${key}`,
        activeMenuItem: key,
      })
    );
    navigate(`/employee/${key}`);
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Use data from API or cache
  const currentVisaStatus = visaStatus ||
    cachedVisaStatus || {
      visaType: "",
      visaStartDate: null,
      visaEndDate: null,
      documents: [],
      nextDocument: "",
      steps: [],
    };

  // Calculate days remaining for visa
  const calculateDaysRemaining = () => {
    if (!currentVisaStatus.visaEndDate) return null;

    const end = new Date(currentVisaStatus.visaEndDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();

  // Get current step status
  const getCurrentStepStatus = () => {
    if (!currentVisaStatus.steps || currentVisaStatus.steps.length === 0)
      return null;

    const currentStep = currentVisaStatus.steps.find(
      (step) => step.status === "process"
    );
    if (!currentStep) return null;

    const currentDocumentStatus = currentVisaStatus.documents?.find(
      (doc) => doc.name === currentStep.title
    );

    if (currentDocumentStatus) {
      return currentDocumentStatus.status;
    }

    return null;
  };

  // Get current step index
  const getCurrentStepIndex = () => {
    if (!currentVisaStatus.steps || currentVisaStatus.steps.length === 0)
      return -1;
    return currentVisaStatus.steps.findIndex(
      (step) => step.status === "process"
    );
  };

  // Get current step
  const getCurrentStep = () => {
    if (!currentVisaStatus.steps || currentVisaStatus.steps.length === 0)
      return null;
    return currentVisaStatus.steps.find((step) => step.status === "process");
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
  const handleUpload = () => {
    if (fileList.length === 0) {
      message.error("Please select a file to upload");
      return;
    }

    const file = fileList[0].originFileObj;

    // Create form data
    const formData = new FormData();
    formData.append("document", file);
    formData.append("documentType", documentToUpload);

    // Dispatch upload action
    dispatch(uploadVisaDocument(formData));
  };

  // Handle close upload modal
  const handleCloseUploadModal = () => {
    setUploadModalVisible(false);
    setFileList([]);
  };

  // Handle document download
  const handleDownloadDocument = (document) => {
    // Using uploadDocument as a replacement for downloadVisaDocument
    dispatch(uploadDocument({ id: document.id, action: "download" }));
  };

  // Handle document preview
  const handlePreviewDocument = (document) => {
    // Using uploadDocument as a replacement for previewVisaDocument
    dispatch(uploadDocument({ id: document.id, action: "preview" }));
    setPreviewDocument(document);
    setPreviewModalVisible(true);
  };

  // Handle template download
  const handleTemplateModalOpen = () => {
    setTemplateModalVisible(true);
  };

  // Handle template download action
  const handleDownloadTemplate = (templateType) => {
    // Using uploadDocument as a replacement for downloadTemplate
    dispatch(uploadDocument({ type: templateType, action: "template" }));
    message.success(`Downloading ${templateType} template...`);
  };

  // Get status message based on current document status
  const getStatusMessage = () => {
    const currentStep = getCurrentStep();
    if (!currentStep) return null;

    const currentDocumentStatus = currentVisaStatus.documents?.find(
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

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="light"
        breakpoint="md"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "16px",
          }}
        >
          <GlobalOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
          {!collapsed && (
            <Title level={4} style={{ margin: "0 0 0 12px" }}>
              Employee Portal
            </Title>
          )}
        </div>

        <Menu
          theme="light"
          selectedKeys={[activeMenuItem]}
          mode="inline"
          items={[
            {
              key: "dashboard",
              icon: <UserOutlined />,
              label: "Dashboard",
              onClick: () => handleMenuClick("dashboard"),
            },
            {
              key: "onboarding",
              icon: <FileTextOutlined />,
              label: "Onboarding",
              onClick: () => handleMenuClick("onboarding"),
            },
            {
              key: "personal-info",
              icon: <IdcardOutlined />,
              label: "Personal Info",
              onClick: () => handleMenuClick("personal-info"),
            },
            {
              key: "visa-status",
              icon: <GlobalOutlined />,
              label: "Visa Status",
              onClick: () => handleMenuClick("visa-status"),
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0, 21, 41, 0.08)",
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            Visa Status Management
          </Title>
          <Space>
            <Avatar icon={<UserOutlined />} src={user?.profilePicture} />
            <Text>
              {user?.firstName} {user?.lastName}
            </Text>
            <Button type="primary" danger onClick={handleLogout}>
              Logout
            </Button>
          </Space>
        </Header>

        <Content
          style={{
            margin: windowSize.width < 768 ? "12px" : "24px",
            background: "#f0f2f5",
            minHeight: 280,
          }}
        >
          {/* Loading state */}
          {loading && !cachedVisaStatus && (
            <Card>
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Spin size="large" />
              </div>
            </Card>
          )}

          {/* Error state */}
          {error && !cachedVisaStatus && (
            <Card>
              <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
              />
            </Card>
          )}

          {/* No visa status required */}
          {!loading && !error && currentVisaStatus.visaType !== "F1(OPT)" && (
            <Card
              style={{
                borderRadius: "8px",
                boxShadow:
                  "0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.03)",
              }}
            >
              <Result
                icon={<GlobalOutlined style={{ color: "#1890ff" }} />}
                title="Visa Status Management"
                subTitle="Visa status tracking is not required for your work authorization type."
                extra={
                  <Button
                    type="primary"
                    onClick={() => handleMenuClick("dashboard")}
                  >
                    Return to Dashboard
                  </Button>
                }
              />
            </Card>
          )}

          {/* Visa status management */}
          {!loading && !error && currentVisaStatus.visaType === "F1(OPT)" && (
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={8}>
                <Card
                  style={{
                    borderRadius: "8px",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <GlobalOutlined
                      style={{ fontSize: 48, color: "#1890ff" }}
                    />
                    <Title level={3} style={{ marginTop: 16, marginBottom: 0 }}>
                      {currentVisaStatus.visaType}
                    </Title>
                    <Text type="secondary">Work Authorization Status</Text>
                  </div>

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
                      {currentVisaStatus.visaStartDate
                        ? moment(currentVisaStatus.visaStartDate).format(
                            "MMMM D, YYYY"
                          )
                        : "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="End Date">
                      {currentVisaStatus.visaEndDate
                        ? moment(currentVisaStatus.visaEndDate).format(
                            "MMMM D, YYYY"
                          )
                        : "N/A"}
                    </Descriptions.Item>
                  </Descriptions>

                  {daysRemaining < 90 && (
                    <Alert
                      message="Visa Expiration Warning"
                      description={`Your OPT will expire in ${daysRemaining} days. Please contact HR for next steps.`}
                      type="warning"
                      showIcon
                      style={{ marginTop: 16 }}
                    />
                  )}

                  <div style={{ marginTop: 16 }}>
                    <Text strong>Status:</Text>
                    <Tag
                      color={
                        daysRemaining < 30
                          ? "red"
                          : daysRemaining < 90
                          ? "orange"
                          : "green"
                      }
                      style={{ marginLeft: 8 }}
                    >
                      {daysRemaining < 30
                        ? "Critical"
                        : daysRemaining < 90
                        ? "Warning"
                        : "Good Standing"}
                    </Tag>
                  </div>
                </Card>

                <Card
                  title={
                    <Space>
                      <FileOutlined />
                      <span>Document History</span>
                    </Space>
                  }
                  style={{
                    marginTop: 16,
                    borderRadius: "8px",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.03)",
                  }}
                >
                  {currentVisaStatus.documents &&
                  currentVisaStatus.documents.length > 0 ? (
                    <Timeline>
                      {currentVisaStatus.documents.map((doc) => (
                        <Timeline.Item
                          key={doc._id || doc.id}
                          color={
                            doc.status === "approved"
                              ? "green"
                              : doc.status === "pending"
                              ? "blue"
                              : "red"
                          }
                          dot={
                            doc.status === "approved" ? (
                              <CheckCircleOutlined />
                            ) : doc.status === "pending" ? (
                              <ClockCircleOutlined />
                            ) : (
                              <CloseCircleOutlined />
                            )
                          }
                        >
                          <div style={{ marginBottom: 8 }}>
                            <Text strong>{doc.name}</Text>{" "}
                            {getStatusBadge(doc.status)}
                          </div>
                          <div>
                            Uploaded:{" "}
                            {moment(doc.createdAt || doc.uploadDate).format(
                              "MMM D, YYYY"
                            )}
                          </div>
                          {doc.status === "approved" &&
                            (doc.reviewedAt || doc.approvalDate) && (
                              <div>
                                Approved:{" "}
                                {moment(
                                  doc.reviewedAt || doc.approvalDate
                                ).format("MMM D, YYYY")}
                              </div>
                            )}
                          {doc.status === "rejected" && doc.feedback && (
                            <div style={{ marginTop: 8 }}>
                              <Text type="danger">
                                Feedback: {doc.feedback}
                              </Text>
                            </div>
                          )}
                          <Space style={{ marginTop: 8 }}>
                            <Button
                              size="small"
                              icon={<DownloadOutlined />}
                              onClick={() => handleDownloadDocument(doc)}
                              loading={downloadLoading === (doc._id || doc.id)}
                            >
                              Download
                            </Button>
                            <Button
                              size="small"
                              icon={<EyeOutlined />}
                              onClick={() => handlePreviewDocument(doc)}
                              loading={previewLoading === (doc._id || doc.id)}
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
                <Card
                  style={{
                    borderRadius: "8px",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ marginBottom: 24 }}>
                    <Title level={4}>OPT Document Process</Title>
                    <Text type="secondary">
                      Follow these steps to maintain your OPT status. Upload
                      each document as required and wait for HR approval before
                      proceeding to the next step.
                    </Text>
                  </div>

                  <Steps
                    current={getCurrentStepIndex()}
                    direction={
                      windowSize.width < 768 ? "horizontal" : "vertical"
                    }
                    style={{ marginBottom: 24 }}
                    responsive={true}
                  >
                    {currentVisaStatus.steps &&
                      currentVisaStatus.steps.map((step, index) => (
                        <Step
                          key={index}
                          title={step.title}
                          description={
                            windowSize.width < 768 ? null : step.description
                          }
                          status={step.status}
                          icon={
                            step.status === "finish" ? (
                              <CheckCircleOutlined />
                            ) : step.status === "process" ? (
                              <ClockCircleOutlined />
                            ) : step.status === "error" ? (
                              <CloseCircleOutlined />
                            ) : undefined
                          }
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

                  {currentVisaStatus.nextDocument === "OPT EAD" && (
                    <Card
                      title={
                        <Space>
                          <IdcardOutlined />
                          <span>Upload OPT EAD</span>
                        </Space>
                      }
                      style={{ marginBottom: 16 }}
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
                      bordered={false}
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

                  {currentVisaStatus.nextDocument === "I-983" && (
                    <Card
                      title={
                        <Space>
                          <FileTextOutlined />
                          <span>I-983 Form</span>
                        </Space>
                      }
                      style={{ marginBottom: 16 }}
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
                      bordered={false}
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
                        <li>
                          Fill out all student sections based on the sample
                        </li>
                        <li>
                          Leave employer sections blank for HR to complete
                        </li>
                        <li>Upload the filled form as a PDF</li>
                      </ul>
                    </Card>
                  )}

                  {currentVisaStatus.nextDocument === "I-20" && (
                    <Card
                      title={
                        <Space>
                          <FileTextOutlined />
                          <span>Upload New I-20</span>
                        </Space>
                      }
                      style={{ marginBottom: 16 }}
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
                      bordered={false}
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

                  {currentVisaStatus.documents &&
                    currentVisaStatus.documents.some(
                      (doc) => doc.status === "rejected"
                    ) && (
                      <Card
                        title={
                          <Space>
                            <CloseCircleOutlined style={{ color: "#f5222d" }} />
                            <span>Rejected Documents</span>
                          </Space>
                        }
                        style={{
                          marginTop: 24,
                          borderLeft: "4px solid #f5222d",
                        }}
                        bordered={false}
                      >
                        {currentVisaStatus.documents
                          .filter((doc) => doc.status === "rejected")
                          .map((doc) => (
                            <div
                              key={doc._id || doc.id}
                              style={{ marginBottom: 16 }}
                            >
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
                                      onClick={() =>
                                        handleUploadClick(doc.name)
                                      }
                                      loading={uploadLoading === doc.name}
                                    >
                                      Reupload
                                    </Button>
                                  </div>
                                </div>
                              </Space>
                              {currentVisaStatus.documents
                                .filter((doc) => doc.status === "rejected")
                                .indexOf(doc) <
                                currentVisaStatus.documents.filter(
                                  (doc) => doc.status === "rejected"
                                ).length -
                                  1 && <Divider />}
                            </div>
                          ))}
                      </Card>
                    )}
                </Card>
              </Col>
            </Row>
          )}

          {/* Document Preview Modal */}
          <Modal
            title={`Document Preview: ${previewDocument?.name || "Document"}`}
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
                  handleDownloadDocument(previewDocument);
                  setPreviewModalVisible(false);
                }}
                loading={
                  downloadLoading ===
                  (previewDocument?._id || previewDocument?.id)
                }
              >
                Download
              </Button>,
            ]}
            width={800}
          >
            <div style={{ textAlign: "center", padding: "20px" }}>
              {previewLoading ? (
                <Spin size="large" />
              ) : (
                <>
                  <FileOutlined style={{ fontSize: 64, color: "#1890ff" }} />
                  <p style={{ marginTop: 16 }}>
                    Document preview would display here when connected to
                    backend.
                  </p>
                  <p>
                    <Text type="secondary">
                      Uploaded on:{" "}
                      {previewDocument?.uploadDate &&
                        moment(previewDocument.uploadDate).format(
                          "MMMM D, YYYY"
                        )}
                    </Text>
                  </p>
                </>
              )}
            </div>
          </Modal>

          {/* Template Download Modal */}
          <Modal
            title="I-983 Form Templates"
            visible={templateModalVisible}
            onCancel={() => setTemplateModalVisible(false)}
            footer={[
              <Button
                key="close"
                onClick={() => setTemplateModalVisible(false)}
              >
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
                    Download and carefully review both the empty form and the
                    sample form
                  </li>
                  <li>Fill out Sections 1 and 2 (Student Information)</li>
                  <li>Complete the Student Evaluation sections</li>
                  <li>Sign the form where required</li>
                  <li>
                    Leave employer sections blank - HR will complete these
                  </li>
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
            visible={uploadModalVisible}
            onOk={handleUpload}
            onCancel={handleCloseUploadModal}
            okText="Upload"
            okButtonProps={{
              disabled: fileList.length === 0,
              loading: uploadLoading === documentToUpload,
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

            {uploadError && (
              <Alert
                message="Upload Error"
                description={uploadError}
                type="error"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default VisaManagement;
