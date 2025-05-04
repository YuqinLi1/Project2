import React, { useEffect, useState, useMemo } from "react";
import {
  Layout,
  Typography,
  Breadcrumb,
  Modal,
  Spin,
  Card,
  Row,
  Col,
  Button,
  Alert,
  Tabs,
  Tag,
  Descriptions,
} from "antd";
import {
  HomeOutlined,
  UserAddOutlined,
  FileOutlined,
  UserOutlined,
  MailOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useHr } from "../../contexts/HrContext";
import HiringManager from "../../components/hr/HiringManager";
import MainLayout from "../../components/common/MainLayout";

const { Title, Text } = Typography;
const { Content } = Layout;
const { TabPane } = Tabs;

const HiringManagement = () => {
  const {
    getRegistrationTokens,
    getPendingApplications,
    generateRegistrationToken,
    updateApplicationStatus,
    registrationTokens,
    applications,
    loading,
    error,
    registrationResult,
    clearRegistrationResult,
  } = useHr();
  const navigate = useNavigate();

  // State for modals and selected items
  const [applicationDetailVisible, setApplicationDetailVisible] =
    useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [activeTab, setActiveTab] = useState("tokens");

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([getRegistrationTokens(), getPendingApplications()]);
    };

    fetchInitialData();
  }, []);

  // Memoized data processing
  const processedApplications = useMemo(() => {
    return {
      pending: applications.filter((app) => app.status === "pending"),
      approved: applications.filter((app) => app.status === "approved"),
      rejected: applications.filter((app) => app.status === "rejected"),
    };
  }, [applications]);

  // Handler for generating registration token
  const handleGenerateToken = async (email, name) => {
    await generateRegistrationToken(email, name);
  };

  // Handler for reviewing application
  const handleReviewApplication = async (applicationId, status, feedback) => {
    await updateApplicationStatus(applicationId, status, feedback);
  };

  // View application details
  const handleViewApplication = (applicationId) => {
    const application = applications.find((app) => app._id === applicationId);
    if (application) {
      setSelectedApplication(application);
      setApplicationDetailVisible(true);
    }
  };

  // View full employee profile
  const handleViewEmployee = (employeeId) => {
    setApplicationDetailVisible(false);
    navigate(`/hr/employees/${employeeId}`);
  };

  // Render application details modal
  const renderApplicationDetailsModal = () => (
    <Modal
      title="Application Details"
      visible={applicationDetailVisible}
      onCancel={() => setApplicationDetailVisible(false)}
      footer={[
        <Button
          key="view-profile"
          type="primary"
          onClick={() => handleViewEmployee(selectedApplication.employeeId._id)}
        >
          View Full Profile
        </Button>,
        <Button key="close" onClick={() => setApplicationDetailVisible(false)}>
          Close
        </Button>,
      ]}
      width={800}
    >
      {selectedApplication && (
        <Descriptions title="Applicant Information" bordered column={2}>
          <Descriptions.Item label="First Name">
            {selectedApplication.employeeId.firstName}
          </Descriptions.Item>
          <Descriptions.Item label="Last Name">
            {selectedApplication.employeeId.lastName}
          </Descriptions.Item>
          <Descriptions.Item label="Email" span={2}>
            {selectedApplication.employeeId.email}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag
              color={
                selectedApplication.status === "pending"
                  ? "orange"
                  : selectedApplication.status === "approved"
                  ? "green"
                  : "red"
              }
            >
              {selectedApplication.status.toUpperCase()}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );

  // Render registration result modal
  const renderRegistrationResultModal = () => (
    <Modal
      title="Registration Token Result"
      visible={!!registrationResult}
      onCancel={() => clearRegistrationResult()}
      footer={[
        <Button key="close" onClick={() => clearRegistrationResult()}>
          Close
        </Button>,
      ]}
    >
      {registrationResult?.success ? (
        <>
          <Alert
            message="Token Generated Successfully"
            description={`Registration link: ${registrationResult.link}`}
            type="success"
            showIcon
          />
          <Text copyable>{registrationResult.link}</Text>
        </>
      ) : (
        <Alert
          message="Token Generation Failed"
          description={registrationResult?.message}
          type="error"
          showIcon
        />
      )}
    </Modal>
  );

  // Render content based on loading and error states
  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" tip="Loading Hiring Management..." />
        </div>
      );
    }

    if (error) {
      return (
        <Alert
          message="Error Loading Data"
          description={error}
          type="error"
          showIcon
        />
      );
    }

    return (
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <MailOutlined /> Registration Tokens
            </span>
          }
          key="tokens"
        >
          <HiringManager
            tokens={registrationTokens}
            applications={applications}
            loading={loading}
            onGenerateToken={handleGenerateToken}
            onReviewApplication={handleReviewApplication}
            onViewApplication={handleViewApplication}
          />
        </TabPane>
        <TabPane
          tab={
            <span>
              <ClockCircleOutlined /> Pending Applications
            </span>
          }
          key="pending"
        >
          <Card title="Pending Applications">
            {processedApplications.pending.length === 0 ? (
              <Alert
                message="No Pending Applications"
                description="There are currently no pending applications."
                type="info"
              />
            ) : (
              <Row gutter={[16, 16]}>
                {processedApplications.pending.map((app) => (
                  <Col key={app._id} xs={24} sm={12} md={8}>
                    <Card
                      hoverable
                      onClick={() => handleViewApplication(app._id)}
                      actions={[
                        <UserOutlined
                          key="view"
                          onClick={() => handleViewApplication(app._id)}
                        />,
                        <CheckCircleOutlined
                          key="approve"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReviewApplication(app._id, "approved");
                          }}
                        />,
                        <CloseCircleOutlined
                          key="reject"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReviewApplication(app._id, "rejected");
                          }}
                        />,
                      ]}
                    >
                      <Card.Meta
                        title={`${app.employeeId.firstName} ${app.employeeId.lastName}`}
                        description={app.employeeId.email}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </TabPane>
      </Tabs>
    );
  };

  return (
    <MainLayout>
      <Content style={{ padding: "24px" }}>
        <Breadcrumb style={{ marginBottom: "16px" }}>
          <Breadcrumb.Item>
            <Link to="/hr">
              <HomeOutlined /> Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <UserAddOutlined /> Hiring Management
          </Breadcrumb.Item>
        </Breadcrumb>

        <Title level={2}>Hiring Management</Title>

        {renderContent()}
        {renderApplicationDetailsModal()}
        {renderRegistrationResultModal()}
      </Content>
    </MainLayout>
  );
};

export default HiringManagement;
