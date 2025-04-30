import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Layout,
  Menu,
  Typography,
  Card,
  Steps,
  Divider,
  Row,
  Col,
  Alert,
  Space,
  Spin,
  Modal,
  Button,
  Result,
  Badge,
  Avatar,
} from "antd";
import {
  UserOutlined,
  HomeOutlined,
  PhoneOutlined,
  IdcardOutlined,
  GlobalOutlined,
  FileOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  BellOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";

// Import components
// Note: Ensure these components exist, or create them if needed
import PersonalInfoForm from "../../components/forms/PersonalInfoForm";
import AddressForm from "../../components/forms/AddressForm";
import EmergencyContactForm from "../../components/forms/EmergencyContactForm";
import VisaForm from "../../components/forms/VisaForm";

import DocumentUpload from "../../components/common/FileUpload";

// Import actions
import {
  getProfile,
  submitOnboarding,
  uploadDocument,
} from "../../redux/actions/employmentActions";
import { logout } from "../../redux/actions/authActions";
import { setAlert } from "../../redux/actions/uiActions";

// Import custom hooks
// Using default exports from the hooks as that's what's available
import useAuth from "../../hooks/useAuth";
import useWindowSize from "../../hooks/useWindowSize";
import useLocalStorage from "../../hooks/useLocalStorage";

// Define a custom pagination hook to use regardless
const usePaginationHook = (initialPage = 0, totalPages = 6) => {
  const [current, setCurrent] = useState(initialPage);

  const next = () => {
    setCurrent((prev) => Math.min(prev + 1, totalPages));
  };

  const prev = () => {
    setCurrent((prev) => Math.max(prev - 1, 0));
  };

  return { current, setCurrent, next, prev };
};

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const Onboarding = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const windowSize = useWindowSize();

  // Redux state
  const { isAuthenticated, user } = useAuth();
  const {
    onboardingApplication,
    loading,
    submitting,
    uploadLoading,
    error,
    submitError,
  } = useSelector((state) => state.employment);
  const { activeMenuItem } = useSelector(
    (state) => state.ui || { activeMenuItem: "onboarding" }
  );

  // Use localStorage for form data persistence
  const cachedApp = useLocalStorage("onboardingApplication", null);
  const [cachedApplication, setCachedApplication] = React.useState(
    cachedApp || null
  );

  // Local state
  const [currentStep, setCurrentStep] = useState(0);
  const [collapsed, setCollapsed] = useState(windowSize.width < 768);
  const [formData, setFormData] = useState({
    personalInfo: {},
    address: {},
    contactInfo: {},
    visaInfo: {
      isUSCitizenOrPermanentResident: false,
    },
    reference: {},
    emergencyContacts: [{}],
    documents: {},
  });
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  // Use custom pagination hook
  const paginationHook = usePaginationHook(0, 6);
  const { current, setCurrent, next, prev } = paginationHook;

  // Update collapsed state when window size changes
  useEffect(() => {
    setCollapsed(windowSize.width < 768);
  }, [windowSize.width]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Fetch onboarding application when component mounts
    // Using getProfile as a replacement for getOnboardingApplication
    dispatch(getProfile());

    // Set active menu item - using setAlert as a placeholder
    dispatch(
      setAlert({
        type: "info",
        message: "Onboarding page loaded",
        activeMenuItem: "onboarding",
      })
    );

    // Initialize form data with user email
    if (user && user.email) {
      setFormData((prevData) => ({
        ...prevData,
        personalInfo: {
          ...prevData.personalInfo,
          email: user.email,
        },
      }));
    }
  }, [isAuthenticated, dispatch, navigate, user]);

  // Update cached data when API returns new data
  useEffect(() => {
    if (onboardingApplication) {
      localStorage.setItem(
        "onboardingApplication",
        JSON.stringify(onboardingApplication)
      );
      setCachedApplication(onboardingApplication);

      // If application is approved, redirect to dashboard
      if (onboardingApplication.status === "Approved") {
        navigate("/employee/dashboard");
      }
    }
  }, [onboardingApplication, navigate]);

  // Update current step when pagination changes
  useEffect(() => {
    setCurrentStep(current);
  }, [current]);

  // Handle menu item click
  const handleMenuClick = (key) => {
    // Using setAlert as a placeholder for setActiveMenuItem
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

  // Handle form data changes
  const handleFormDataChange = (section, data) => {
    setFormData((prevData) => ({
      ...prevData,
      [section]: data,
    }));

    // Save to localStorage
    const updatedCachedApp = {
      ...cachedApplication,
      [section]: data,
    };
    localStorage.setItem(
      "onboardingApplication",
      JSON.stringify(updatedCachedApp)
    );
    setCachedApplication(updatedCachedApp);
  };

  // Handle step navigation
  const handleNext = () => {
    next();
  };

  const handlePrev = () => {
    prev();
  };

  // Handle document upload
  const handleDocumentUpload = (type, file) => {
    if (!file) return;

    // Create form data
    const formData = new FormData();
    formData.append("document", file);
    formData.append("documentType", type);

    // Using uploadDocument as replacement for uploadOnboardingDocument
    dispatch(uploadDocument(formData));

    // Update local state
    setFormData((prevData) => ({
      ...prevData,
      documents: {
        ...prevData.documents,
        [type]: {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
        },
      },
    }));
  };

  // Handle final submission
  const handleSubmit = () => {
    // Create form data
    const formData = new FormData();

    // Add all form data as JSON
    formData.append("applicationData", JSON.stringify(formData));

    // Using submitOnboarding as replacement for submitOnboardingApplication
    dispatch(submitOnboarding(formData));

    // Show success modal upon successful submission
    if (!submitError) {
      setSuccessModalVisible(true);
    }
  };

  // Check if application is in pending status
  const isPending =
    onboardingApplication && onboardingApplication.status === "Pending";

  // Check if application is rejected
  const isRejected =
    onboardingApplication && onboardingApplication.status === "Rejected";

  // Render pending application view
  const renderPendingApplication = () => {
    return (
      <Card>
        <Result
          status="info"
          title="Application Pending"
          subTitle="Please wait for HR to review your application."
          icon={<ClockCircleOutlined style={{ color: "#1890ff" }} />}
        />

        <Divider />

        <Title level={4}>Submitted Information</Title>
        <Row gutter={[16, 16]}>
          <Col span={24} md={12}>
            <Card title="Personal Information" bordered={false}>
              <p>
                <strong>Name:</strong>{" "}
                {onboardingApplication.personalInfo.firstName}{" "}
                {onboardingApplication.personalInfo.middleName}{" "}
                {onboardingApplication.personalInfo.lastName}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                {onboardingApplication.personalInfo.email}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                {onboardingApplication.contactInfo.cellPhone}
              </p>
            </Card>
          </Col>
          <Col span={24} md={12}>
            <Card title="Work Authorization" bordered={false}>
              <p>
                <strong>Status:</strong>{" "}
                {onboardingApplication.visaInfo.isUSCitizenOrPermanentResident
                  ? onboardingApplication.visaInfo.citizenship
                  : onboardingApplication.visaInfo.workAuthType}
              </p>
              {!onboardingApplication.visaInfo
                .isUSCitizenOrPermanentResident && (
                <p>
                  <strong>Valid Until:</strong>{" "}
                  {moment(
                    onboardingApplication.visaInfo.workAuthEndDate
                  ).format("MMMM D, YYYY")}
                </p>
              )}
            </Card>
          </Col>
        </Row>

        <Divider />

        <Title level={4}>Uploaded Documents</Title>
        <Row gutter={[16, 16]}>
          {onboardingApplication.documents &&
            Object.entries(onboardingApplication.documents).map(
              ([key, doc]) => (
                <Col span={24} md={8} key={key}>
                  <Card hoverable>
                    <Card.Meta title={doc.name} />
                    <Space style={{ marginTop: 16 }}>
                      <Button type="primary" icon={<FileOutlined />}>
                        Preview
                      </Button>
                    </Space>
                  </Card>
                </Col>
              )
            )}
        </Row>

        <Divider />

        <Button type="primary" onClick={() => navigate("/employee/dashboard")}>
          Return to Dashboard
        </Button>
      </Card>
    );
  };

  // Render rejected application view
  const renderRejectedApplication = () => {
    return (
      <Card>
        <Result
          status="error"
          title="Application Rejected"
          subTitle="Please review the feedback below and resubmit your application."
        />

        <Alert
          message="Feedback from HR"
          description={onboardingApplication.feedback}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Divider />

        <Title level={4}>Resubmit Your Application</Title>
        {/* Onboarding form will render below */}
      </Card>
    );
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
            {isPending
              ? "Application Status"
              : isRejected
              ? "Resubmit Application"
              : "Onboarding Application"}
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
          <Card
            style={{
              borderRadius: "8px",
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.03)",
            }}
          >
            {/* Loading state */}
            {loading && !cachedApplication && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Spin size="large" />
              </div>
            )}

            {/* Error state */}
            {error && !cachedApplication && (
              <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
              />
            )}

            {/* Show different views based on application status */}
            {isPending ? (
              renderPendingApplication()
            ) : isRejected ? (
              renderRejectedApplication()
            ) : (
              <>
                <div style={{ padding: "0 20px" }}>
                  <Steps
                    current={currentStep}
                    responsive={true}
                    size={windowSize.width < 768 ? "small" : "default"}
                    style={{ marginBottom: 40 }}
                  >
                    <Step title="Personal Info" icon={<UserOutlined />} />
                    <Step title="Address" icon={<HomeOutlined />} />
                    <Step title="Contact" icon={<PhoneOutlined />} />
                    <Step
                      title="Work Authorization"
                      icon={<GlobalOutlined />}
                    />
                    <Step title="References" icon={<UserOutlined />} />
                    <Step title="Emergency Contacts" icon={<PhoneOutlined />} />
                    <Step title="Documents" icon={<FileOutlined />} />
                  </Steps>
                </div>

                <Divider style={{ margin: "0 0 24px 0" }} />

                <div style={{ padding: "0 20px" }}>
                  {/* Step 1: Personal Information */}
                  {currentStep === 0 && (
                    <div>
                      <Card
                        title={
                          <Space>
                            <UserOutlined />
                            <span>Personal Information</span>
                          </Space>
                        }
                        bordered={false}
                      >
                        <PersonalInfoForm
                          initialValues={formData.personalInfo}
                          emailValue={user?.email}
                          onChange={(values) =>
                            handleFormDataChange("personalInfo", values)
                          }
                          onComplete={handleNext}
                        />
                      </Card>
                    </div>
                  )}

                  {/* Step 2: Address */}
                  {currentStep === 1 && (
                    <div>
                      <Card
                        title={
                          <Space>
                            <HomeOutlined />
                            <span>Current Address</span>
                          </Space>
                        }
                        bordered={false}
                      >
                        <AddressForm
                          initialValues={formData.address}
                          onChange={(values) =>
                            handleFormDataChange("address", values)
                          }
                          onComplete={handleNext}
                          onBack={handlePrev}
                        />
                      </Card>
                    </div>
                  )}

                  {/* Step 3: Contact Information */}
                  {currentStep === 2 && (
                    <div>
                      <Card
                        title={
                          <Space>
                            <PhoneOutlined />
                            <span>Contact Information</span>
                          </Space>
                        }
                        bordered={false}
                      >
                        <PersonalInfoForm
                          initialValues={formData.contactInfo}
                          emailValue={user?.email}
                          onChange={(values) =>
                            handleFormDataChange("contactInfo", values)
                          }
                          onComplete={handleNext}
                          onBack={handlePrev}
                          contactInfoOnly={true}
                        />
                      </Card>
                    </div>
                  )}

                  {/* Step 4: Work Authorization */}
                  {currentStep === 3 && (
                    <div>
                      <Card
                        title={
                          <Space>
                            <GlobalOutlined />
                            <span>Work Authorization</span>
                          </Space>
                        }
                        bordered={false}
                      >
                        <VisaForm
                          initialValues={formData.visaInfo}
                          onChange={(values) =>
                            handleFormDataChange("visaInfo", values)
                          }
                          onComplete={handleNext}
                          onBack={handlePrev}
                          onDocumentUpload={handleDocumentUpload}
                        />
                      </Card>
                    </div>
                  )}

                  {/* Step 5: References */}
                  {currentStep === 4 && (
                    <div>
                      <Card
                        title={
                          <Space>
                            <UserOutlined />
                            <span>References</span>
                          </Space>
                        }
                        bordered={false}
                      >
                        <PersonalInfoForm
                          initialValues={formData.reference}
                          onChange={(values) =>
                            handleFormDataChange("reference", values)
                          }
                          onComplete={handleNext}
                          onBack={handlePrev}
                          referenceOnly={true}
                        />
                      </Card>
                    </div>
                  )}

                  {/* Step 6: Emergency Contacts */}
                  {currentStep === 5 && (
                    <div>
                      <Card
                        title={
                          <Space>
                            <PhoneOutlined />
                            <span>Emergency Contacts</span>
                          </Space>
                        }
                        bordered={false}
                      >
                        <EmergencyContactForm
                          initialValues={formData.emergencyContacts}
                          onChange={(values) =>
                            handleFormDataChange("emergencyContacts", values)
                          }
                          onComplete={handleNext}
                          onBack={handlePrev}
                        />
                      </Card>
                    </div>
                  )}

                  {/* Step 7: Documents */}
                  {currentStep === 6 && (
                    <div>
                      <Card
                        title={
                          <Space>
                            <FileOutlined />
                            <span>Required Documents</span>
                          </Space>
                        }
                        bordered={false}
                      >
                        <Alert
                          message="Document Requirements"
                          description="Please upload all required documents. This includes your driver's license and any work authorization documents."
                          type="info"
                          showIcon
                          style={{ marginBottom: 24 }}
                        />

                        <Row gutter={[16, 24]}>
                          <Col span={24} md={12}>
                            <Card title="Driver's License" size="small">
                              <DocumentUpload
                                documentType="driverLicense"
                                onUpload={(file) =>
                                  handleDocumentUpload("driverLicense", file)
                                }
                                loading={uploadLoading === "driverLicense"}
                              />
                              {formData.documents.driverLicense && (
                                <Alert
                                  message="Document Uploaded"
                                  description={
                                    formData.documents.driverLicense.name
                                  }
                                  type="success"
                                  showIcon
                                  style={{ marginTop: 16 }}
                                />
                              )}
                            </Card>
                          </Col>

                          {formData.visaInfo &&
                            !formData.visaInfo
                              .isUSCitizenOrPermanentResident && (
                              <Col span={24} md={12}>
                                <Card title="Work Authorization" size="small">
                                  <DocumentUpload
                                    documentType="workAuthorization"
                                    onUpload={(file) =>
                                      handleDocumentUpload(
                                        "workAuthorization",
                                        file
                                      )
                                    }
                                    loading={
                                      uploadLoading === "workAuthorization"
                                    }
                                  />
                                  {formData.documents.workAuthorization && (
                                    <Alert
                                      message="Document Uploaded"
                                      description={
                                        formData.documents.workAuthorization
                                          .name
                                      }
                                      type="success"
                                      showIcon
                                      style={{ marginTop: 16 }}
                                    />
                                  )}
                                </Card>
                              </Col>
                            )}
                        </Row>

                        <div
                          style={{
                            marginTop: 32,
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Button onClick={handlePrev}>Previous</Button>
                          <Button
                            type="primary"
                            onClick={handleSubmit}
                            loading={submitting}
                            disabled={!formData.documents.driverLicense}
                          >
                            Submit Application
                          </Button>
                        </div>

                        {submitError && (
                          <Alert
                            message="Submission Error"
                            description={submitError}
                            type="error"
                            showIcon
                            style={{ marginTop: 16 }}
                          />
                        )}
                      </Card>
                    </div>
                  )}

                  {/* Navigation buttons (shown on steps 0-5) */}
                  {currentStep < 6 && (
                    <div
                      style={{
                        marginTop: 32,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      {currentStep > 0 && (
                        <Button onClick={handlePrev}>Previous</Button>
                      )}
                      {currentStep === 0 && (
                        <Button
                          type="primary"
                          onClick={handleNext}
                          style={{ marginLeft: "auto" }}
                        >
                          Next
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>

          {/* Success Modal */}
          <Modal
            visible={successModalVisible}
            footer={null}
            onCancel={() => {
              setSuccessModalVisible(false);
              navigate("/employee/dashboard");
            }}
            width={500}
            centered
            bodyStyle={{ padding: "32px 24px" }}
          >
            <Result
              status="success"
              title="Application Submitted Successfully"
              subTitle="Your onboarding application has been submitted. HR will review it shortly."
              extra={[
                <Button
                  type="primary"
                  key="dashboard"
                  onClick={() => {
                    setSuccessModalVisible(false);
                    navigate("/employee/dashboard");
                  }}
                >
                  Go to Dashboard
                </Button>,
              ]}
            />
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Onboarding;
