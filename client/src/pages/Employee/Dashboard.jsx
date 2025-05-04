import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Layout,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Alert,
  List,
  Divider,
  Tag,
  Space,
} from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  IdcardOutlined,
  GlobalOutlined,
  EditOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  ContactsOutlined,
} from "@ant-design/icons";

// Import components
import MainLayout from "../../components/common/MainLayout";

// Import Redux actions
import {
  getProfile,
  getVisaStatus,
} from "../../redux/actions/employmentActions";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { employeeInfo, profileLoading, profileError } = useSelector(
    (state) => state.employment || {}
  );
  const { visaStatus } = useSelector((state) => state.employment || {});

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getProfile());
    dispatch(getVisaStatus());
  }, [dispatch]);

  // Calculate days remaining for visa if applicable
  const calculateDaysRemaining = () => {
    if (!employeeInfo?.employment?.visaEndDate) return null;

    const end = new Date(employeeInfo.employment.visaEndDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = calculateDaysRemaining();

  // Check if onboarding is complete
  const isOnboardingComplete = employeeInfo?.onboardingStatus === "approved";

  // Get next visa document to upload
  const getNextDocument = () => {
    if (!visaStatus || !visaStatus.documents) return null;

    // OPT process steps
    const steps = ["OPT Receipt", "OPT EAD", "I-983", "I-20"];

    // Check each step in order
    for (const step of steps) {
      const document = visaStatus.documents.find((doc) => doc.type === step);

      // If document doesn't exist or is rejected, this is the next step
      if (!document || document.status === "rejected") {
        return step;
      }

      // If document is pending, we're waiting for approval
      if (document.status === "pending") {
        return null; // No next document while waiting for approval
      }
    }

    return null; // All documents are approved
  };

  const nextDocument = getNextDocument();

  // Loading state
  if (profileLoading && !employeeInfo) {
    return (
      <MainLayout activeMenuItem="dashboard">
        <Content style={{ padding: "24px" }}>
          <Card loading={true}>
            <div style={{ textAlign: "center", padding: "50px" }}>
              Loading...
            </div>
          </Card>
        </Content>
      </MainLayout>
    );
  }

  return (
    <MainLayout activeMenuItem="dashboard">
      <Content style={{ padding: "24px" }}>
        <Title level={2}>Employee Dashboard</Title>

        <Row gutter={[16, 16]}>
          {/* Welcome Card */}
          <Col xs={24}>
            <Card>
              <Title level={4}>
                Welcome, {employeeInfo?.personalInfo?.firstName || "User"}!
              </Title>
              <Paragraph>
                This is your employee portal dashboard where you can manage your
                personal information, onboarding status, and visa documents.
              </Paragraph>
            </Card>
          </Col>
        </Row>

        {/* Onboarding Status Card */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} md={12}>
            <Card
              title={
                <>
                  <FileTextOutlined /> Onboarding Status
                </>
              }
              extra={
                <Button
                  type="primary"
                  onClick={() => navigate("/employee/onboarding")}
                  disabled={isOnboardingComplete}
                >
                  {isOnboardingComplete ? "Completed" : "Complete Now"}
                </Button>
              }
            >
              {!isOnboardingComplete ? (
                <Alert
                  message="Action Required"
                  description="Please complete your onboarding application to access all employee features."
                  type="warning"
                  showIcon
                />
              ) : (
                <Alert
                  message="Onboarding Complete"
                  description="Your onboarding application has been approved."
                  type="success"
                  showIcon
                />
              )}

              <Divider />

              <List
                size="small"
                header={<Text strong>Required Steps:</Text>}
                dataSource={[
                  {
                    title: "Personal Information",
                    status: employeeInfo?.personalInfo
                      ? "completed"
                      : "pending",
                    icon: <UserOutlined />,
                  },
                  {
                    title: "Address Information",
                    status: employeeInfo?.address ? "completed" : "pending",
                    icon: <IdcardOutlined />,
                  },
                  {
                    title: "Contact Information",
                    status: employeeInfo?.contactInfo ? "completed" : "pending",
                    icon: <PhoneOutlined />,
                  },
                  {
                    title: "Emergency Contacts",
                    status:
                      employeeInfo?.emergencyContacts?.length > 0
                        ? "completed"
                        : "pending",
                    icon: <ContactsOutlined />,
                  },
                  {
                    title: "Work Authorization",
                    status: employeeInfo?.employment?.visaType
                      ? "completed"
                      : "pending",
                    icon: <GlobalOutlined />,
                  },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Space>
                      {item.icon}
                      <Text>{item.title}</Text>
                    </Space>
                    <Tag
                      color={
                        item.status === "completed" ? "success" : "warning"
                      }
                    >
                      {item.status === "completed" ? "Completed" : "Pending"}
                    </Tag>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Visa Status Card */}
          <Col xs={24} md={12}>
            <Card
              title={
                <>
                  <GlobalOutlined /> Visa Status
                </>
              }
              extra={
                <Button
                  type="primary"
                  onClick={() => navigate("/employee/visa-status")}
                  disabled={
                    !employeeInfo?.employment?.visaType ||
                    employeeInfo?.employment?.visaType !== "F1(OPT)"
                  }
                >
                  Manage
                </Button>
              }
            >
              {employeeInfo?.employment?.visaType ? (
                <>
                  <Row>
                    <Col span={12}>
                      <Statistic
                        title="Visa Type"
                        value={employeeInfo.employment.visaType}
                        valueStyle={{ fontSize: "16px" }}
                      />
                    </Col>
                    {daysRemaining !== null && (
                      <Col span={12}>
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
                            fontSize: "16px",
                          }}
                          suffix="days"
                        />
                      </Col>
                    )}
                  </Row>

                  <Divider />

                  {employeeInfo.employment.visaType === "F1(OPT)" ? (
                    <>
                      <Text strong>Document Status:</Text>

                      {nextDocument ? (
                        <Alert
                          style={{ marginTop: 12 }}
                          message="Action Required"
                          description={`Your next document to upload: ${nextDocument}`}
                          type="warning"
                          showIcon
                          action={
                            <Button
                              size="small"
                              type="primary"
                              onClick={() => navigate("/employee/visa-status")}
                            >
                              Upload Now
                            </Button>
                          }
                        />
                      ) : visaStatus?.documents?.some(
                          (doc) => doc.status === "pending"
                        ) ? (
                        <Alert
                          style={{ marginTop: 12 }}
                          message="Under Review"
                          description="Your document is being reviewed by HR"
                          type="info"
                          showIcon
                        />
                      ) : (
                        <Alert
                          style={{ marginTop: 12 }}
                          message="All Set!"
                          description="All required documents have been approved"
                          type="success"
                          showIcon
                        />
                      )}

                      {daysRemaining < 90 && (
                        <Alert
                          style={{ marginTop: 12 }}
                          message="Visa Expiration Warning"
                          description={`Your OPT will expire in ${daysRemaining} days.`}
                          type="warning"
                          showIcon
                        />
                      )}
                    </>
                  ) : (
                    <Alert
                      message="No Action Required"
                      description="Your visa status does not require additional document uploads."
                      type="info"
                      showIcon
                    />
                  )}
                </>
              ) : (
                <Alert
                  message="Visa Status Not Available"
                  description="Please complete your onboarding application to provide visa information."
                  type="warning"
                  showIcon
                />
              )}
            </Card>
          </Col>
        </Row>

        {/* Personal Information Card */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card
              title={
                <>
                  <UserOutlined /> Personal Information
                </>
              }
              extra={
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => navigate("/employee/personal-info")}
                >
                  Manage
                </Button>
              }
            >
              <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                  <Text strong>Name:</Text>
                  <div>
                    {employeeInfo?.personalInfo
                      ? `${employeeInfo.personalInfo.firstName} ${employeeInfo.personalInfo.lastName}`
                      : "Not provided"}
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <Text strong>Email:</Text>
                  <div>
                    {employeeInfo?.personalInfo?.email || "Not provided"}
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <Text strong>Phone:</Text>
                  <div>
                    {employeeInfo?.contactInfo?.cellPhone || "Not provided"}
                  </div>
                </Col>
              </Row>
              <Row gutter={[24, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} md={16}>
                  <Text strong>Address:</Text>
                  <div>
                    {employeeInfo?.address
                      ? `${employeeInfo.address.building || ""} ${
                          employeeInfo.address.street || ""
                        }, ${employeeInfo.address.city || ""}, ${
                          employeeInfo.address.state || ""
                        } ${employeeInfo.address.zipcode || ""}`
                      : "Not provided"}
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <Text strong>Emergency Contacts:</Text>
                  <div>
                    {employeeInfo?.emergencyContacts?.length || 0} contacts
                    added
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Content>
    </MainLayout>
  );
};

export default Dashboard;
