import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Layout,
  Menu,
  Typography,
  Card,
  Tabs,
  Descriptions,
  Avatar,
  Space,
  Divider,
  Row,
  Col,
  Modal,
  Spin,
  Alert,
  List,
  message,
  Tag,
  Button,
  Badge,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  HomeOutlined,
  PhoneOutlined,
  IdcardOutlined,
  GlobalOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  FileOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import moment from "moment";

// Import components
// Use these components if they exist, otherwise create placeholders
import PersonalInfoForm from "../../components/forms/PersonalInfoForm";
import AddressForm from "../../components/forms/AddressForm";
import EmergencyContactForm from "../../components/forms/EmergencyContactForm";
import DocumentUpload from "../../components/common/FileUpload";

// Import actions
import {
  getProfile, // Replacing getEmployeeInfo
  updateProfile, // Replacing updatePersonalInfo
  uploadDocument, // Use for downloading and uploading
  uploadVisaDocument, // Use if needed
} from "../../redux/actions/employmentActions";
import { logout } from "../../redux/actions/authActions";
import { setAlert } from "../../redux/actions/uiActions"; // Replacing setActiveMenuItem

// Import custom hooks
import useAuth from "../../hooks/useAuth"; // Updated from useAuth
import useWindowSize from "../../hooks/useWindowSize"; // Updated from useWindowSize

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const PersonalInfo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const windowSize = useWindowSize();

  // Redux state
  const { isAuthenticated, user } = useAuth();
  const {
    employeeInfo,
    loading,
    updateLoading,
    downloadLoading,
    previewLoading,
    error,
    updateError,
  } = useSelector((state) => state.employment);
  const { activeMenuItem } = useSelector(
    (state) => state.ui || { activeMenuItem: "personal-info" }
  );

  // Local state
  const [editMode, setEditMode] = useState({
    personalInfo: false,
    address: false,
    contactInfo: false,
    emergencyContact: false,
  });
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [collapsed, setCollapsed] = useState(windowSize.width < 768);
  const [activeTab, setActiveTab] = useState("profile");

  // Update collapsed state when window size changes
  useEffect(() => {
    setCollapsed(windowSize.width < 768);
  }, [windowSize.width]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Fetch employee info when component mounts
    // Using getProfile as replacement for getEmployeeInfo
    dispatch(getProfile());

    // Set active menu item - using setAlert as placeholder for setActiveMenuItem
    dispatch(
      setAlert({
        type: "info",
        message: "Personal info page loaded",
        activeMenuItem: "personal-info",
      })
    );
  }, [isAuthenticated, dispatch, navigate]);

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

  // Handle edit button click
  const handleEdit = (section) => {
    setEditMode({ ...editMode, [section]: true });
    setActiveSection(section);
  };

  // Handle save for Personal Info
  const handleSavePersonalInfo = (values) => {
    // Using updateProfile as replacement for updatePersonalInfo
    dispatch(updateProfile({ type: "personalInfo", data: values }));
    setEditMode({ ...editMode, personalInfo: false });
    setActiveSection(null);
  };

  // Handle save for Address
  const handleSaveAddress = (values) => {
    // Using updateProfile as replacement for updateAddress
    dispatch(updateProfile({ type: "address", data: values }));
    setEditMode({ ...editMode, address: false });
    setActiveSection(null);
  };

  // Handle save for Contact Info
  const handleSaveContactInfo = (values) => {
    // Using updateProfile as replacement for updateContactInfo
    dispatch(updateProfile({ type: "contactInfo", data: values }));
    setEditMode({ ...editMode, contactInfo: false });
    setActiveSection(null);
  };

  // Handle save for Emergency Contact
  const handleSaveEmergencyContact = (values) => {
    // Using updateProfile as replacement for updateEmergencyContact
    dispatch(updateProfile({ type: "emergencyContact", data: values }));
    setEditMode({ ...editMode, emergencyContact: false });
    setActiveSection(null);
  };

  // Handle cancel button click
  const handleCancel = () => {
    setConfirmModalVisible(true);
  };

  // Handle discard changes
  const handleDiscard = () => {
    setConfirmModalVisible(false);

    if (activeSection) {
      setEditMode({ ...editMode, [activeSection]: false });
      setActiveSection(null);
    }
  };

  // Handle continue editing
  const handleContinueEditing = () => {
    setConfirmModalVisible(false);
  };

  // Handle document download
  const handleDownloadDocument = (document) => {
    // Using uploadDocument action for download functionality
    dispatch(uploadDocument({ type: "download", id: document.id }));
  };

  // Handle document preview
  const handlePreviewDocument = (document) => {
    // Using uploadDocument action for preview functionality
    dispatch(uploadDocument({ type: "preview", id: document.id }));
    setPreviewDocument(document);
    setPreviewModalVisible(true);
  };

  // Calculate days remaining for visa
  const calculateDaysRemaining = () => {
    if (!employeeInfo?.employment?.visaEndDate) return null;

    const end = new Date(employeeInfo.employment.visaEndDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return <Badge status="success" text="Approved" />;
      case "Pending":
        return <Badge status="processing" text="Pending" />;
      case "Rejected":
        return <Badge status="error" text="Rejected" />;
      default:
        return <Badge status="default" text="Not Started" />;
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
            Personal Information
          </Title>
          <Space>
            <Avatar
              icon={<UserOutlined />}
              src={employeeInfo?.personalInfo?.profilePicture}
            />
            <Text>
              {employeeInfo?.personalInfo?.firstName}{" "}
              {employeeInfo?.personalInfo?.lastName}
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
          {loading && !employeeInfo && (
            <Card>
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Spin size="large" />
              </div>
            </Card>
          )}

          {/* Error state */}
          {error && !employeeInfo && (
            <Card>
              <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
              />
            </Card>
          )}

          {employeeInfo && (
            <Card
              activeTabKey={activeTab}
              onTabChange={setActiveTab}
              tabList={[
                {
                  key: "profile",
                  tab: (
                    <span>
                      <UserOutlined /> Profile
                    </span>
                  ),
                },
                {
                  key: "documents",
                  tab: (
                    <span>
                      <FileOutlined /> Documents
                    </span>
                  ),
                },
              ]}
              style={{
                borderRadius: "8px",
                boxShadow:
                  "0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.03)",
              }}
            >
              {activeTab === "profile" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "24px",
                    }}
                  >
                    <Avatar
                      size={windowSize.width < 576 ? 64 : 100}
                      icon={<UserOutlined />}
                      src={employeeInfo.personalInfo?.profilePicture}
                    />
                    <div style={{ marginLeft: "24px" }}>
                      <Title
                        level={windowSize.width < 576 ? 4 : 3}
                        style={{ margin: 0 }}
                      >
                        {employeeInfo.personalInfo?.firstName}{" "}
                        {employeeInfo.personalInfo?.lastName}
                      </Title>
                      <Text type="secondary">
                        {employeeInfo.employment?.title}
                      </Text>
                    </div>
                  </div>

                  {/* Personal Information Section */}
                  <Card
                    title={
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <UserOutlined style={{ marginRight: 8 }} />
                        <span>Personal Information</span>
                      </div>
                    }
                    style={{ marginBottom: 24 }}
                    extra={
                      !editMode.personalInfo ? (
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit("personalInfo")}
                        >
                          Edit
                        </Button>
                      ) : null
                    }
                    bordered={false}
                  >
                    {!editMode.personalInfo ? (
                      <Descriptions
                        bordered
                        column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
                      >
                        <Descriptions.Item label="First Name">
                          {employeeInfo.personalInfo?.firstName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Last Name">
                          {employeeInfo.personalInfo?.lastName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Middle Name">
                          {employeeInfo.personalInfo?.middleName || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Preferred Name">
                          {employeeInfo.personalInfo?.preferredName || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                          {employeeInfo.personalInfo?.email}
                        </Descriptions.Item>
                        <Descriptions.Item label="SSN">
                          {employeeInfo.personalInfo?.ssn
                            ? employeeInfo.personalInfo.ssn.replace(
                                /^\d{3}-\d{2}/,
                                "XXX-XX"
                              )
                            : "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Date of Birth">
                          {employeeInfo.personalInfo?.dateOfBirth
                            ? moment(
                                employeeInfo.personalInfo.dateOfBirth
                              ).format("MMMM D, YYYY")
                            : "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Gender">
                          {employeeInfo.personalInfo?.gender === "male"
                            ? "Male"
                            : employeeInfo.personalInfo?.gender === "female"
                            ? "Female"
                            : employeeInfo.personalInfo?.gender ===
                              "do_not_wish_to_answer"
                            ? "Prefer not to say"
                            : "N/A"}
                        </Descriptions.Item>
                      </Descriptions>
                    ) : (
                      <PersonalInfoForm
                        initialValues={employeeInfo.personalInfo}
                        onSave={handleSavePersonalInfo}
                        onCancel={handleCancel}
                        loading={updateLoading}
                        error={updateError}
                      />
                    )}
                  </Card>

                  {/* Address Section */}
                  <Card
                    title={
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <HomeOutlined style={{ marginRight: 8 }} />
                        <span>Current Address</span>
                      </div>
                    }
                    style={{ marginBottom: 24 }}
                    extra={
                      !editMode.address ? (
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit("address")}
                        >
                          Edit
                        </Button>
                      ) : null
                    }
                    bordered={false}
                  >
                    {!editMode.address ? (
                      <Descriptions
                        bordered
                        column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
                      >
                        <Descriptions.Item label="Building/Apt #">
                          {employeeInfo.address?.building}
                        </Descriptions.Item>
                        <Descriptions.Item label="Street">
                          {employeeInfo.address?.street}
                        </Descriptions.Item>
                        <Descriptions.Item label="City">
                          {employeeInfo.address?.city}
                        </Descriptions.Item>
                        <Descriptions.Item label="State">
                          {employeeInfo.address?.state}
                        </Descriptions.Item>
                        <Descriptions.Item label="Zip Code">
                          {employeeInfo.address?.zipcode}
                        </Descriptions.Item>
                      </Descriptions>
                    ) : (
                      <AddressForm
                        initialValues={employeeInfo.address}
                        onSave={handleSaveAddress}
                        onCancel={handleCancel}
                        loading={updateLoading}
                        error={updateError}
                      />
                    )}
                  </Card>

                  {/* Contact Information Section */}
                  <Card
                    title={
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <PhoneOutlined style={{ marginRight: 8 }} />
                        <span>Contact Information</span>
                      </div>
                    }
                    style={{ marginBottom: 24 }}
                    extra={
                      !editMode.contactInfo ? (
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit("contactInfo")}
                        >
                          Edit
                        </Button>
                      ) : null
                    }
                    bordered={false}
                  >
                    {!editMode.contactInfo ? (
                      <Descriptions
                        bordered
                        column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
                      >
                        <Descriptions.Item label="Cell Phone">
                          {employeeInfo.contactInfo?.cellPhone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Work Phone">
                          {employeeInfo.contactInfo?.workPhone || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                          {employeeInfo.personalInfo?.email}
                        </Descriptions.Item>
                      </Descriptions>
                    ) : (
                      <PersonalInfoForm
                        initialValues={employeeInfo.contactInfo}
                        emailValue={employeeInfo.personalInfo?.email}
                        onSave={handleSaveContactInfo}
                        onCancel={handleCancel}
                        loading={updateLoading}
                        error={updateError}
                        contactInfoOnly={true}
                      />
                    )}
                  </Card>

                  {/* Employment Section */}
                  <Card
                    title={
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <IdcardOutlined style={{ marginRight: 8 }} />
                        <span>Employment</span>
                      </div>
                    }
                    style={{ marginBottom: 24 }}
                    bordered={false}
                  >
                    <Descriptions
                      bordered
                      column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
                    >
                      <Descriptions.Item label="Job Title">
                        {employeeInfo.employment?.title}
                      </Descriptions.Item>
                      <Descriptions.Item label="Start Date">
                        {employeeInfo.employment?.startDate
                          ? moment(employeeInfo.employment.startDate).format(
                              "MMMM D, YYYY"
                            )
                          : "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Visa Type">
                        <Tag color="blue">
                          {employeeInfo.employment?.visaType || "N/A"}
                        </Tag>
                      </Descriptions.Item>

                      {employeeInfo.employment?.visaType && (
                        <>
                          <Descriptions.Item label="Visa Start Date">
                            {moment(
                              employeeInfo.employment.visaStartDate
                            ).format("MMMM D, YYYY")}
                          </Descriptions.Item>
                          <Descriptions.Item label="Visa End Date">
                            {moment(employeeInfo.employment.visaEndDate).format(
                              "MMMM D, YYYY"
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label="Days Remaining">
                            <Tag
                              color={
                                daysRemaining < 30
                                  ? "red"
                                  : daysRemaining < 90
                                  ? "orange"
                                  : "green"
                              }
                            >
                              {daysRemaining} days
                            </Tag>
                          </Descriptions.Item>
                        </>
                      )}
                    </Descriptions>

                    {employeeInfo.employment?.visaType === "F1(OPT)" &&
                      daysRemaining < 90 && (
                        <Alert
                          message="Visa Expiration Warning"
                          description={`Your OPT will expire in ${daysRemaining} days. Please check the Visa Status Management page for next steps or contact HR.`}
                          type="warning"
                          showIcon
                          style={{ marginTop: 16 }}
                          action={
                            <Button
                              type="primary"
                              size="small"
                              onClick={() => handleMenuClick("visa-status")}
                            >
                              View Visa Status
                            </Button>
                          }
                        />
                      )}
                  </Card>

                  {/* Emergency Contact Section */}
                  <Card
                    title={
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <PhoneOutlined style={{ marginRight: 8 }} />
                        <span>Emergency Contact</span>
                      </div>
                    }
                    style={{ marginBottom: 24 }}
                    extra={
                      !editMode.emergencyContact ? (
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit("emergencyContact")}
                        >
                          Edit
                        </Button>
                      ) : null
                    }
                    bordered={false}
                  >
                    {!editMode.emergencyContact ? (
                      employeeInfo.emergencyContacts?.length > 0 ? (
                        employeeInfo.emergencyContacts.map((contact, index) => (
                          <div key={contact.id || index}>
                            {index > 0 && <Divider />}
                            <Descriptions
                              bordered
                              column={{
                                xxl: 3,
                                xl: 3,
                                lg: 2,
                                md: 2,
                                sm: 1,
                                xs: 1,
                              }}
                              title={`Contact #${index + 1}`}
                            >
                              <Descriptions.Item label="First Name">
                                {contact.firstName}
                              </Descriptions.Item>
                              <Descriptions.Item label="Last Name">
                                {contact.lastName}
                              </Descriptions.Item>
                              <Descriptions.Item label="Middle Name">
                                {contact.middleName || "N/A"}
                              </Descriptions.Item>
                              <Descriptions.Item label="Phone">
                                {contact.phone}
                              </Descriptions.Item>
                              <Descriptions.Item label="Email">
                                {contact.email}
                              </Descriptions.Item>
                              <Descriptions.Item label="Relationship">
                                {contact.relationship}
                              </Descriptions.Item>
                            </Descriptions>
                          </div>
                        ))
                      ) : (
                        <Alert
                          message="No emergency contacts added"
                          type="info"
                          showIcon
                        />
                      )
                    ) : (
                      <EmergencyContactForm
                        initialValues={employeeInfo.emergencyContacts}
                        onSave={handleSaveEmergencyContact}
                        onCancel={handleCancel}
                        loading={updateLoading}
                        error={updateError}
                      />
                    )}
                  </Card>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === "documents" && (
                <div>
                  <Title level={4}>Uploaded Documents</Title>

                  {employeeInfo.documents?.length > 0 ? (
                    <Row gutter={[16, 16]}>
                      {employeeInfo.documents.map((document) => (
                        <Col xs={24} sm={12} md={8} key={document.id}>
                          <Card
                            hoverable
                            actions={[
                              <Tooltip title="Preview">
                                <EyeOutlined
                                  key="preview"
                                  onClick={() =>
                                    handlePreviewDocument(document)
                                  }
                                />
                              </Tooltip>,
                              <Tooltip title="Download">
                                <DownloadOutlined
                                  key="download"
                                  onClick={() =>
                                    handleDownloadDocument(document)
                                  }
                                />
                              </Tooltip>,
                            ]}
                          >
                            <Card.Meta
                              avatar={
                                <FileOutlined
                                  style={{ fontSize: 24, color: "#1890ff" }}
                                />
                              }
                              title={document.name}
                              description={
                                <>
                                  <div>
                                    Type:{" "}
                                    {document.type?.charAt(0).toUpperCase() +
                                      document.type?.slice(1) || "Document"}
                                  </div>
                                  <div>
                                    Uploaded:{" "}
                                    {moment(document.uploadDate).format(
                                      "MMMM D, YYYY"
                                    )}
                                  </div>
                                </>
                              }
                            />
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Alert
                      message="No documents uploaded"
                      type="info"
                      showIcon
                    />
                  )}

                  <div style={{ marginTop: 24 }}>
                    <DocumentUpload />
                  </div>

                  {employeeInfo.employment?.visaType && (
                    <div style={{ marginTop: 24 }}>
                      <Alert
                        message="Visa Documents"
                        description="For visa-related documents, please visit the Visa Status Management page."
                        type="info"
                        showIcon
                        action={
                          <Button
                            type="primary"
                            onClick={() => handleMenuClick("visa-status")}
                          >
                            Visa Status
                          </Button>
                        }
                      />
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Confirm Modal */}
          <Modal
            title="Discard Changes"
            visible={confirmModalVisible}
            onOk={handleDiscard}
            onCancel={handleContinueEditing}
            okText="Yes, Discard"
            cancelText="No, Continue Editing"
          >
            <p>Are you sure you want to discard all changes?</p>
          </Modal>

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
                loading={downloadLoading === previewDocument?.id}
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
        </Content>
      </Layout>
    </Layout>
  );
};

export default PersonalInfo;
