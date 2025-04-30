import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Layout,
  Menu,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Alert,
  Badge,
  Space,
  Avatar,
  Divider,
  List,
  Spin,
  Tag,
} from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  IdcardOutlined,
  BellOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  CalendarOutlined,
  FileOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import moment from "moment";

// Import actions
import { getProfile } from "../../redux/actions/employmentActions";
import { logout } from "../../redux/actions/authActions";
import { setAlert } from "../../redux/actions/uiActions";

// Import custom hooks
import useAuth from "../../hooks/useAuth";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const windowSize = useWindowSize();

  // Redux state
  const { isAuthenticated, user } = useAuth();
  const { employeeInfo, onboardingStatus, visaStatus, loading, error } =
    useSelector((state) => state.employment);
  const { activeMenuItem } = useSelector(
    (state) => state.ui || { activeMenuItem: "dashboard" }
  );


  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Fetch employee status when component mounts
    dispatch(getProfile());

    // Set active menu item - using setAlert as a placeholder since setActiveMenuItem isn't available
    dispatch(
      setAlert({
        type: "info",
        message: "Dashboard loaded",
        activeMenuItem: "dashboard",
      })
    );
  }, [isAuthenticated, dispatch, navigate]);

  // Handle menu item click
  const handleMenuClick = (key) => {
    // Using setAlert as a placeholder since setActiveMenuItem isn't available
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

  // Get status color for statistics
  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "#52c41a"; // green
      case "Pending":
        return "#faad14"; // yellow
      case "Rejected":
        return "#f5222d"; // red
      default:
        return undefined; // default
    }
  };

  // Get badge color based on days remaining
  const getVisaBadgeColor = () => {
    if (!daysRemaining) return "default";

    if (daysRemaining < 30) return "red";
    if (daysRemaining < 90) return "orange";
    return "green";
  };

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

  // Mock notification data (remove when API is connected)
  const notifications = [
    {
      id: 1,
      title: "Onboarding Approved",
      description: "Your onboarding application has been approved.",
      date: "2025-04-25",
      read: false,
    },
    {
      id: 2,
      title: "Upload OPT EAD",
      description: "Please upload your OPT EAD document.",
      date: "2025-04-26",
      read: true,
    },
  ];

  // Mock tasks data (remove when API is connected)
  const tasks = [
    {
      id: 1,
      title: "Upload I-20",
      description:
        "Upload your new I-20 after sending the I-983 to your school.",
      dueDate: "2025-05-10",
      completed: false,
    },
    {
      id: 2,
      title: "Review Personal Information",
      description: "Verify your personal information is up to date.",
      dueDate: "2025-05-05",
      completed: true,
    },
  ];

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
            Dashboard
          </Title>
          <Space>
            <Badge count={notifications.filter((n) => !n.read).length}>
              <Button type="text" icon={<BellOutlined />} size="large" />
            </Badge>
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
          {loading && (
            <div style={{ textAlign: "center", margin: "20px 0" }}>
              <Spin size="large" />
            </div>
          )}

          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {!loading && !error && (
            <>
              <Title level={4} style={{ marginBottom: 24 }}>
                Welcome, {employeeInfo?.personalInfo?.firstName}!
              </Title>

              {/* Status Cards */}
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Onboarding Status"
                      value={onboardingStatus || "Not Started"}
                      valueStyle={{ color: getStatusColor(onboardingStatus) }}
                      prefix={<FileTextOutlined />}
                    />
                    <div style={{ marginTop: 16 }}>
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handleMenuClick("onboarding")}
                        danger={onboardingStatus === "Rejected"}
                      >
                        {onboardingStatus === "Rejected"
                          ? "Review & Resubmit"
                          : onboardingStatus === "Pending"
                          ? "View Status"
                          : onboardingStatus === "Approved"
                          ? "View Details"
                          : "Complete Onboarding"}
                      </Button>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Profile Completion"
                      value={employeeInfo?.profileCompletion || "0%"}
                      prefix={<UserOutlined />}
                    />
                    <div style={{ marginTop: 16 }}>
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handleMenuClick("personal-info")}
                      >
                        Update Profile
                      </Button>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Visa Status"
                      value={employeeInfo?.employment?.visaType || "N/A"}
                      prefix={<GlobalOutlined />}
                    />
                    <div style={{ marginTop: 16 }}>
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handleMenuClick("visa-status")}
                        disabled={!employeeInfo?.employment?.visaType}
                      >
                        Manage Visa
                      </Button>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Days Remaining"
                      value={daysRemaining || "N/A"}
                      valueStyle={{
                        color:
                          daysRemaining < 30
                            ? "#f5222d"
                            : daysRemaining < 90
                            ? "#faad14"
                            : "#52c41a",
                      }}
                      prefix={<CalendarOutlined />}
                      suffix={daysRemaining ? "days" : ""}
                    />
                    <div style={{ marginTop: 16 }}>
                      <Tag color={getVisaBadgeColor()}>
                        {daysRemaining < 30
                          ? "Critical"
                          : daysRemaining < 90
                          ? "Warning"
                          : "Good Standing"}
                      </Tag>
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Alerts Section */}
              <div style={{ marginTop: 24 }}>
                {onboardingStatus === "Rejected" && (
                  <Alert
                    message="Action Required"
                    description="Your onboarding application has been rejected. Please review the feedback and resubmit."
                    type="error"
                    showIcon
                    action={
                      <Button
                        size="small"
                        danger
                        onClick={() => handleMenuClick("onboarding")}
                      >
                        Review & Resubmit
                      </Button>
                    }
                    style={{ marginBottom: 16 }}
                  />
                )}

                {employeeInfo?.employment?.visaType === "F1(OPT)" &&
                  daysRemaining < 90 && (
                    <Alert
                      message="Visa Expiration Warning"
                      description={`Your OPT will expire in ${daysRemaining} days. Please check the Visa Status page for next steps or contact HR.`}
                      type="warning"
                      showIcon
                      action={
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => handleMenuClick("visa-status")}
                        >
                          View Visa Status
                        </Button>
                      }
                      style={{ marginBottom: 16 }}
                    />
                  )}
              </div>

              {/* Detail Cards */}
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}>
                  <Card
                    title={
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <ClockCircleOutlined style={{ marginRight: 8 }} />
                        <span>Pending Tasks</span>
                      </div>
                    }
                    bordered={false}
                  >
                    <List
                      dataSource={tasks}
                      renderItem={(item) => (
                        <List.Item
                          actions={[
                            <Button
                              type="link"
                              onClick={() => {
                                if (item.id === 1)
                                  handleMenuClick("visa-status");
                                if (item.id === 2)
                                  handleMenuClick("personal-info");
                              }}
                            >
                              {item.completed ? "View" : "Complete"}
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Badge
                                status={
                                  item.completed ? "success" : "processing"
                                }
                              />
                            }
                            title={item.title}
                            description={
                              <>
                                <div>{item.description}</div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color:
                                      new Date(item.dueDate) < new Date()
                                        ? "#f5222d"
                                        : "#8c8c8c",
                                  }}
                                >
                                  Due:{" "}
                                  {moment(item.dueDate).format("MM/DD/YYYY")}
                                </div>
                              </>
                            }
                          />
                        </List.Item>
                      )}
                      locale={{ emptyText: "No pending tasks" }}
                    />
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card
                    title={
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <BellOutlined style={{ marginRight: 8 }} />
                        <span>Recent Notifications</span>
                      </div>
                    }
                    bordered={false}
                    extra={<Button type="link">View All</Button>}
                  >
                    <List
                      dataSource={notifications}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <Badge dot={!item.read} offset={[0, 0]}>
                                <Avatar
                                  icon={<BellOutlined />}
                                  style={{
                                    backgroundColor: !item.read
                                      ? "#1890ff"
                                      : "#d9d9d9",
                                  }}
                                />
                              </Badge>
                            }
                            title={item.title}
                            description={
                              <>
                                <div>{item.description}</div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#8c8c8c",
                                  }}
                                >
                                  {moment(item.date).format("MM/DD/YYYY")}
                                </div>
                              </>
                            }
                          />
                        </List.Item>
                      )}
                      locale={{ emptyText: "No notifications" }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Quick Links Card */}
              <Card
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <FileOutlined style={{ marginRight: 8 }} />
                    <span>Quick Actions</span>
                  </div>
                }
                style={{ marginTop: 16 }}
                bordered={false}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <Button
                      type="primary"
                      icon={<FileTextOutlined />}
                      size="large"
                      block
                      onClick={() => handleMenuClick("onboarding")}
                    >
                      Onboarding Application
                    </Button>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Button
                      type="default"
                      icon={<IdcardOutlined />}
                      size="large"
                      block
                      onClick={() => handleMenuClick("personal-info")}
                    >
                      Personal Information
                    </Button>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Button
                      type="default"
                      icon={<GlobalOutlined />}
                      size="large"
                      block
                      onClick={() => handleMenuClick("visa-status")}
                      disabled={!employeeInfo?.employment?.visaType}
                    >
                      Visa Status Management
                    </Button>
                  </Col>
                </Row>
              </Card>

              {/* Profile Summary Card */}
              <Card
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <UserOutlined style={{ marginRight: 8 }} />
                    <span>Profile Summary</span>
                  </div>
                }
                style={{ marginTop: 16 }}
                bordered={false}
              >
                <Row gutter={[24, 16]} align="middle">
                  <Col xs={24} md={4} style={{ textAlign: "center" }}>
                    <Avatar
                      size={100}
                      icon={<UserOutlined />}
                      src={employeeInfo?.personalInfo?.profilePicture}
                    />
                  </Col>
                  <Col xs={24} md={20}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={8}>
                        <div>
                          <Text type="secondary">Full Name</Text>
                          <div>
                            <Text strong>
                              {employeeInfo?.personalInfo?.firstName}{" "}
                              {employeeInfo?.personalInfo?.lastName}
                            </Text>
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div>
                          <Text type="secondary">Email</Text>
                          <div>
                            <Text strong>
                              {employeeInfo?.personalInfo?.email}
                            </Text>
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div>
                          <Text type="secondary">Phone</Text>
                          <div>
                            <Text strong>
                              {employeeInfo?.contactInfo?.cellPhone ||
                                "Not provided"}
                            </Text>
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div>
                          <Text type="secondary">Position</Text>
                          <div>
                            <Text strong>
                              {employeeInfo?.employment?.title || "Employee"}
                            </Text>
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div>
                          <Text type="secondary">Work Authorization</Text>
                          <div>
                            <Text strong>
                              {employeeInfo?.employment?.visaType ||
                                "Not applicable"}
                            </Text>
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div>
                          <Text type="secondary">Status</Text>
                          <div>
                            {getStatusBadge(onboardingStatus || "Not Started")}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
