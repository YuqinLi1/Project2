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
import { jwtDecode } from "jwt-decode";

// Import actions
import { getProfile } from "../../redux/actions/employmentActions";
import { logout } from "../../redux/actions/authActions";
import { setAlert } from "../../redux/actions/uiActions";
import { useAuth } from "../../contexts/AuthContext";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userEmail, setUserEmail] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  const { user } = useAuth();

  // Employment state from Redux - with safe fallbacks
  const employmentState = useSelector((state) => state.employment) || {};
  const {
    employeeInfo = null,
    onboardingStatus = null,
    visaStatus = null,
    loading = false,
    error = null,
  } = employmentState;

  // UI state
  const uiState = useSelector((state) => state.ui) || {
    activeMenuItem: "dashboard",
  };
  const { activeMenuItem } = uiState;

  useEffect(() => {

    dispatch(getProfile());

    // Set active menu item
    dispatch(
      setAlert({
        type: "info",
        message: "Dashboard loaded",
        activeMenuItem: "dashboard",
      })
    );
  }, [dispatch, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUnauthorized(true);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUserEmail(decoded.email);
    } catch (err) {
      setUnauthorized(true);
    }
  }, []);

  if (unauthorized) {
    return <Alert message="401 Unauthorized" type="error" showIcon />;
  }


  // Handle menu item click
  const handleMenuClick = (key) => {
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

  // Empty placeholder lists for now - to be replaced with API data later
  const emptyNotifications = [];
  const emptyTasks = [];

  // Display a loading state when data is being fetched
  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Content
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin size="large" tip="Loading your dashboard..." />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
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
          {(
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
    </Layout>
  );
};

export default Dashboard;