import React, { useEffect, useState } from "react";
import { Layout, Typography, Breadcrumb, Modal, Spin } from "antd";
import { HomeOutlined, UserAddOutlined, FileOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useHr } from "../../contexts/HrContext";
import HiringManager from "../../components/hr/HiringManager";
import MainLayout from "../../components/common/MainLayout";

const { Title } = Typography;
const { Content } = Layout;

const HiringManagement = () => {
  const {
    getTokens,
    getPendingApplications,
    generateToken,
    reviewApplication,
    tokens,
    applications,
    loading,
  } = useHr();
  const navigate = useNavigate();
  const [applicationDetailVisible, setApplicationDetailVisible] =
    useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    getTokens();
    getPendingApplications();
  }, []);

  const handleGenerateToken = async (email, name) => {
    await generateToken(email, name);
  };

  const handleReviewApplication = async (applicationId, status, feedback) => {
    await reviewApplication(applicationId, status, feedback);
  };

  const handleViewApplication = (applicationId) => {
    const application = applications.find((app) => app._id === applicationId);
    if (application) {
      setSelectedApplication(application);
      setApplicationDetailVisible(true);
    }
  };

  const handleViewEmployee = (employeeId) => {
    navigate(`/hr/employees/${employeeId}`);
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

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <HiringManager
            tokens={tokens}
            applications={applications}
            loading={loading}
            onGenerateToken={handleGenerateToken}
            onReviewApplication={handleReviewApplication}
            onViewApplication={handleViewApplication}
          />
        )}

        <Modal
          title="Application Details"
          visible={applicationDetailVisible}
          onCancel={() => setApplicationDetailVisible(false)}
          footer={null}
          width={800}
        >
          {selectedApplication && (
            <div>
              <h3>Applicant Information</h3>
              <p>
                <strong>Name:</strong>{" "}
                {selectedApplication.employeeId.firstName}{" "}
                {selectedApplication.employeeId.lastName}
              </p>
              <p>
                <strong>Email:</strong> {selectedApplication.employeeId.email}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {selectedApplication.status.toUpperCase()}
              </p>

              {/* You can add more application details here */}

              <div style={{ marginTop: 20 }}>
                <button
                  onClick={() => {
                    setApplicationDetailVisible(false);
                    handleViewEmployee(selectedApplication.employeeId._id);
                  }}
                >
                  View Full Employee Profile
                </button>
              </div>
            </div>
          )}
        </Modal>
      </Content>
    </MainLayout>
  );
};

export default HiringManagement;
