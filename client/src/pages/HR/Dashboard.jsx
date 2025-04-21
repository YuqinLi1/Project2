import React, { useEffect } from "react";
import { Layout, Typography, Row, Col, Card, Statistic, Button } from "antd";
import {
  UserOutlined,
  FileOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useHr } from "../../contexts/HrContext";
import MainLayout from "../../components/common/MainLayout";

const { Title } = Typography;
const { Content } = Layout;

const Dashboard = () => {
  const {
    getAllEmployees,
    getPendingApplications,
    getVisaManagement,
    employees,
    applications,
    visaManagement,
    loading,
  } = useHr();

  useEffect(() => {
    getAllEmployees();
    getPendingApplications();
    getVisaManagement();
  }, []);

  const pendingApplicationsCount = applications.filter(
    (app) => app.status === "pending"
  ).length;
  const pendingVisaActionsCount = visaManagement.filter((visa) =>
    visa.documents.some((doc) => doc.status === "pending")
  ).length;

  const getExpiringVisas = () => {
    const today = new Date();
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(today.getDate() + 90);

    return visaManagement.filter((visa) => {
      if (!visa.endDate) return false;
      const endDate = new Date(visa.endDate);
      return endDate > today && endDate < ninetyDaysFromNow;
    }).length;
  };

  const expiringVisasCount = getExpiringVisas();

  return (
    <MainLayout>
      <Content style={{ padding: "24px" }}>
        <Title level={2}>HR Dashboard</Title>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card loading={loading}>
              <Statistic
                title="Total Employees"
                value={employees.length}
                prefix={<UserOutlined />}
              />
              <div style={{ marginTop: 16 }}>
                <Link to="/hr/employees">
                  <Button type="primary" size="small">
                    View Details
                  </Button>
                </Link>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card loading={loading}>
              <Statistic
                title="Pending Applications"
                value={pendingApplicationsCount}
                prefix={<FileOutlined />}
                valueStyle={{
                  color: pendingApplicationsCount > 0 ? "#faad14" : "inherit",
                }}
              />
              <div style={{ marginTop: 16 }}>
                <Link to="/hr/hiring">
                  <Button type="primary" size="small">
                    Review Applications
                  </Button>
                </Link>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card loading={loading}>
              <Statistic
                title="Pending Visa Actions"
                value={pendingVisaActionsCount}
                prefix={<ClockCircleOutlined />}
                valueStyle={{
                  color: pendingVisaActionsCount > 0 ? "#faad14" : "inherit",
                }}
              />
              <div style={{ marginTop: 16 }}>
                <Link to="/hr/visa">
                  <Button type="primary" size="small">
                    Manage Visas
                  </Button>
                </Link>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card loading={loading}>
              <Statistic
                title="Visas Expiring Soon"
                value={expiringVisasCount}
                prefix={<WarningOutlined />}
                valueStyle={{
                  color: expiringVisasCount > 0 ? "#f5222d" : "inherit",
                }}
              />
              <div style={{ marginTop: 16 }}>
                <Link to="/hr/visa">
                  <Button type="primary" size="small">
                    View Details
                  </Button>
                </Link>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card title="Quick Actions" loading={loading}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Link to="/hr/hiring">
                    <Button type="primary" block icon={<UserOutlined />}>
                      New Employee Registration
                    </Button>
                  </Link>
                </Col>
                <Col xs={24} sm={8}>
                  <Link to="/hr/employees">
                    <Button block icon={<UserOutlined />}>
                      Manage Employees
                    </Button>
                  </Link>
                </Col>
                <Col xs={24} sm={8}>
                  <Link to="/hr/visa">
                    <Button block icon={<FileOutlined />}>
                      Visa Management
                    </Button>
                  </Link>
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
