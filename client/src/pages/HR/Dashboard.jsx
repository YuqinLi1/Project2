import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  Spin,
  Table,
} from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  GlobalOutlined,
  EditOutlined,
  ClockCircleOutlined,
  FileOutlined,
  WarningOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

// Import components
import MainLayout from "../../components/common/MainLayout";

// Import context hook
import { useHr } from "../../contexts/HrContext";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// Utility function to calculate days remaining for visas
const calculateDaysRemaining = (endDate) => {
  if (!endDate) return null;

  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
};

// Employee Summary Table Component
const EmployeeSummaryTable = ({ employees, navigate }) => {
  // Ensure employees is an array
  const safeEmployees = Array.isArray(employees) ? employees : [];

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <a
          href={`/hr/employees/${record._id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text}
        </a>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "SSN",
      dataIndex: "ssn",
      key: "ssn",
    },
    {
      title: "Work Authorization",
      dataIndex: "visaType",
      key: "visaType",
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
  ];

  // Transform employees data to match table requirements
  const dataSource = safeEmployees.map((emp) => ({
    key: emp._id || Math.random().toString(),
    _id: emp._id || "",
    name: `${emp.personalInfo?.firstName || ""} ${
      emp.personalInfo?.lastName || ""
    }`.trim(),
    ssn: emp.personalInfo?.ssn || "N/A",
    visaType: emp.employment?.visaType || "N/A",
    phone: emp.contactInfo?.cellPhone || "N/A",
    email: emp.personalInfo?.email || "N/A",
  }));

  return (
    <Card
      title={
        <>
          <UserOutlined /> Employee Summary
        </>
      }
      extra={
        <Button type="primary" onClick={() => navigate("/hr/employees")}>
          Manage Employees
        </Button>
      }
    >
      {safeEmployees.length > 0 ? (
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
          }}
        />
      ) : (
        <div style={{ textAlign: "center", padding: "20px" }}>
          No employees found
        </div>
      )}
    </Card>
  );
};

// HR Management Steps Component
const HrManagementSteps = ({ employees, applications, visaManagement }) => {
  const hrSteps = [
    {
      title: "Total Employees",
      value: employees.length,
      status: employees.length > 0 ? "completed" : "pending",
      icon: <UserOutlined />,
    },
    {
      title: "Pending Applications",
      value: applications.filter((app) => app.status === "pending").length,
      status: applications.some((app) => app.status === "pending")
        ? "pending"
        : "completed",
      icon: <FileTextOutlined />,
    },
    {
      title: "Pending Visa Actions",
      value: visaManagement.filter((visa) =>
        visa.documents.some((doc) => doc.status === "pending")
      ).length,
      status: visaManagement.some((visa) =>
        visa.documents.some((doc) => doc.status === "pending")
      )
        ? "pending"
        : "completed",
      icon: <GlobalOutlined />,
    },
    {
      title: "Expiring Visas",
      value: visaManagement.filter((visa) => {
        if (!visa.endDate) return false;
        const daysRemaining = calculateDaysRemaining(visa.endDate);
        return daysRemaining !== null && daysRemaining < 90;
      }).length,
      status: visaManagement.some((visa) => {
        if (!visa.endDate) return false;
        const daysRemaining = calculateDaysRemaining(visa.endDate);
        return daysRemaining !== null && daysRemaining < 90;
      })
        ? "warning"
        : "completed",
      icon: <WarningOutlined />,
    },
  ];

  return (
    <List
      size="small"
      header={<Text strong>HR Management Overview:</Text>}
      dataSource={hrSteps}
      renderItem={(item) => (
        <List.Item>
          <Space>
            {item.icon}
            <Text>{item.title}</Text>
          </Space>
          <Space>
            <Text strong>{item.value}</Text>
            <Tag
              color={
                item.status === "completed"
                  ? "success"
                  : item.status === "warning"
                  ? "warning"
                  : "warning"
              }
            >
              {item.status === "completed"
                ? "All Clear"
                : item.status === "warning"
                ? "Attention Needed"
                : "Pending"}
            </Tag>
          </Space>
        </List.Item>
      )}
    />
  );
};

// Visa Management Component
const VisaManagementSection = ({ visaManagement, navigate }) => {
  // Group visas by status and calculate expiring visas
  const visaStats = useMemo(() => {
    const now = new Date();
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(now.getDate() + 90);

    return {
      pendingDocuments: visaManagement.filter((visa) =>
        visa.documents.some((doc) => doc.status === "pending")
      ).length,
      expiringVisas: visaManagement.filter((visa) => {
        if (!visa.endDate) return false;
        const endDate = new Date(visa.endDate);
        return endDate > now && endDate < ninetyDaysFromNow;
      }).length,
    };
  }, [visaManagement]);

  return (
    <>
      <Row>
        <Col span={12}>
          <Statistic
            title="Pending Visa Documents"
            value={visaStats.pendingDocuments}
            prefix={<ClockCircleOutlined />}
            valueStyle={{
              color: visaStats.pendingDocuments > 0 ? "#faad14" : "inherit",
            }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Visas Expiring Soon"
            value={visaStats.expiringVisas}
            prefix={<WarningOutlined />}
            valueStyle={{
              color: visaStats.expiringVisas > 0 ? "#f5222d" : "inherit",
            }}
          />
        </Col>
      </Row>

      <Divider />

      {visaStats.pendingDocuments > 0 ? (
        <Alert
          message="Visa Document Review Needed"
          description={`You have ${visaStats.pendingDocuments} visa documents pending review.`}
          type="warning"
          showIcon
          action={
            <Button
              size="small"
              type="primary"
              onClick={() => navigate("/hr/visa")}
            >
              Review Documents
            </Button>
          }
        />
      ) : (
        <Alert
          message="Visa Management"
          description="All visa documents are up to date."
          type="success"
          showIcon
        />
      )}
    </>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    getAllEmployees,
    getPendingApplications,
    getVisaManagement,
    employees,
    applications,
    visaManagement,
    loading,
  } = useHr();

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      await Promise.all([
        getAllEmployees(),
        getPendingApplications(),
        getVisaManagement(),
      ]);
    };

    fetchDashboardData();
  }, []);

  // Loading state
  if (
    loading &&
    (!employees.length || !applications.length || !visaManagement.length)
  ) {
    return (
      <MainLayout>
        <Content
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            tip="Loading HR Dashboard..."
          />
        </Content>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Content style={{ padding: "24px" }}>
        <Title level={2}>HR Dashboard</Title>

        <Row gutter={[16, 16]}>
          {/* Welcome Card */}
          <Col xs={24}>
            <Card>
              <Title level={4}>Welcome, HR Manager!</Title>
              <Paragraph>
                This is your HR portal dashboard where you can manage employees,
                track applications, and oversee visa documentation.
              </Paragraph>
            </Card>
          </Col>
        </Row>

        {/* Employee Summary */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <EmployeeSummaryTable employees={employees} navigate={navigate} />
          </Col>
        </Row>

        {/* HR Management Overview */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} md={12}>
            <Card
              title={
                <>
                  <FileTextOutlined /> HR Management Overview
                </>
              }
              extra={
                <Button
                  type="primary"
                  onClick={() => navigate("/hr/employees")}
                >
                  Manage Employees
                </Button>
              }
            >
              <HrManagementSteps
                employees={employees}
                applications={applications}
                visaManagement={visaManagement}
              />
            </Card>
          </Col>

          {/* Visa Management Card */}
          <Col xs={24} md={12}>
            <Card
              title={
                <>
                  <GlobalOutlined /> Visa Management
                </>
              }
              extra={
                <Button type="primary" onClick={() => navigate("/hr/visa")}>
                  Manage Visas
                </Button>
              }
            >
              <VisaManagementSection
                visaManagement={visaManagement}
                navigate={navigate}
              />
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card title="Quick Actions">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Button
                    type="primary"
                    block
                    icon={<UserOutlined />}
                    onClick={() => navigate("/hr/hiring")}
                  >
                    New Employee Registration
                  </Button>
                </Col>
                <Col xs={24} sm={8}>
                  <Button
                    block
                    icon={<FileOutlined />}
                    onClick={() => navigate("/hr/applications")}
                  >
                    Review Applications
                  </Button>
                </Col>
                <Col xs={24} sm={8}>
                  <Button
                    block
                    icon={<GlobalOutlined />}
                    onClick={() => navigate("/hr/visa")}
                  >
                    Visa Management
                  </Button>
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
