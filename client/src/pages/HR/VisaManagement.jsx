import React, { useEffect, useState } from "react";
import { Layout, Typography, Breadcrumb, Modal, Spin } from "antd";
import { HomeOutlined, GlobalOutlined, FileOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useHr } from "../../contexts/HrContext";
import VisaManagementComponent from "../../components/hr/VisaManagement";
import DocumentReview from "../../components/hr/DocumentReview";
import MainLayout from "../../components/common/MainLayout";

const { Title } = Typography;
const { Content } = Layout;

const VisaManagementPage = () => {
  const {
    getVisaManagement,
    reviewDocument,
    sendNotification,
    visaManagement,
    loading,
  } = useHr();
  const navigate = useNavigate();
  const [documentReviewVisible, setDocumentReviewVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    getVisaManagement();
  }, []);

  const handleReviewDocument = async (documentId, status, feedback) => {
    await reviewDocument(documentId, status, feedback);
    setDocumentReviewVisible(false);
  };

  const handleViewDocument = (documentId) => {
    // Fetch document details
    // This would typically be an API call to get document details
    // For now, we'll create a simple placeholder
    setSelectedDocument({
      _id: documentId,
      type: "Visa Document",
      status: "pending",
      fileName: "document.pdf",
      createdAt: new Date(),
    });
    setDocumentReviewVisible(true);
  };

  const handleSendNotification = async (employeeId) => {
    await sendNotification(employeeId);
  };

  const handleViewEmployee = (employeeId) => {
    navigate(`/hr/employees/${employeeId}`);
  };

  const handleDownloadDocument = async (documentId) => {
    try {
      setDownloadLoading(true);
      window.open(`/api/documents/${documentId}/download`, "_blank");
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setDownloadLoading(false);
    }
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
            <GlobalOutlined /> Visa Management
          </Breadcrumb.Item>
        </Breadcrumb>

        <Title level={2}>Visa Management</Title>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <VisaManagementComponent
            visaInProgress={visaManagement.filter(
              (v) => v.currentStep !== "Completed"
            )}
            visaAll={visaManagement}
            loading={loading}
            onViewDocument={handleViewDocument}
            onReviewDocument={handleReviewDocument}
            onSendNotification={handleSendNotification}
            onViewEmployee={handleViewEmployee}
          />
        )}

        <Modal
          title="Document Review"
          visible={documentReviewVisible}
          onCancel={() => setDocumentReviewVisible(false)}
          footer={null}
          width={800}
        >
          {selectedDocument && (
            <DocumentReview
              document={selectedDocument}
              loading={loading}
              onApprove={(id, feedback) =>
                handleReviewDocument(id, "approved", feedback)
              }
              onReject={(id, feedback) =>
                handleReviewDocument(id, "rejected", feedback)
              }
              onDownload={handleDownloadDocument}
            />
          )}
        </Modal>
      </Content>
    </MainLayout>
  );
};

export default VisaManagementPage;
