import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Layout,
  Typography,
  Card,
  Tabs,
  Alert,
  Button,
  Modal,
  Spin,
  Row,
  Col,
  Tag,
  Descriptions,
} from "antd";
import {
  GlobalOutlined,
  FileOutlined,
  EditOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

// Import forms
import PersonalInfoForm from "../../components/forms/PersonalInfoForm";
import VisaForm from "../../components/forms/VisaForm";

// Import context
import { useEmployee } from "../../contexts/EmployeeContext";
import MainLayout from "../../components/common/MainLayout";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Memoized calculation of days remaining
const calculateDaysRemaining = (endDate) => {
  if (!endDate) return null;
  const diffTime = new Date(endDate) - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Memoized Document Card Component
const DocumentCard = React.memo(({ doc, onViewDetails }) => {
  const statusColorMap = {
    approved: "green",
    pending: "orange",
    rejected: "red",
  };

  return (
    <Card
      hoverable
      actions={[
        <Button type="link" onClick={() => onViewDetails(doc)}>
          View Details
        </Button>,
      ]}
    >
      <Card.Meta
        title={doc.type}
        description={
          <>
            <Tag color={statusColorMap[doc.status] || "default"}>
              {doc.status.toUpperCase()}
            </Tag>
            <div>
              Uploaded:{" "}
              {doc.uploadDate
                ? new Date(doc.uploadDate).toLocaleDateString()
                : "N/A"}
            </div>
          </>
        }
      />
    </Card>
  );
});

// Main Visa Management Component
const VisaManagement = () => {
  const navigate = useNavigate();
  const {
    getVisaStatus,
    uploadVisaDocument,
    visaStatus,
    loading,
    error,
    clearError,
  } = useEmployee();

  // Local state management with useCallback to prevent unnecessary re-renders
  const [editMode, setEditMode] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Memoized data calculations
  const daysRemaining = useMemo(
    () => calculateDaysRemaining(visaStatus?.endDate),
    [visaStatus?.endDate]
  );

  // Stable callback for document upload
  const handleDocumentUpload = useCallback(
    async (file, type) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        await uploadVisaDocument(formData);
        setEditMode(null);
      } catch (err) {
        console.error("Document upload error:", err);
      }
    },
    [uploadVisaDocument]
  );

  // Fetch visa status on component mount
  useEffect(() => {
    const fetchVisaStatus = async () => {
      await getVisaStatus();
    };

    fetchVisaStatus();

    // Cleanup function to clear any existing errors
    return () => {
      clearError();
    };
  }, [getVisaStatus, clearError]);

  // Memoized view details handler
  const handleViewDetails = useCallback((doc) => {
    setSelectedDocument(doc);
  }, []);

  // Render loading state
  if (loading) {
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
          <Spin size="large" tip="Loading Visa Status..." />
        </Content>
      </MainLayout>
    );
  }

  // Render error state
  if (error) {
    return (
      <MainLayout>
        <Content style={{ padding: "24px" }}>
          <Alert
            message="Error Loading Visa Status"
            description={error}
            type="error"
            showIcon
            closable
            onClose={clearError}
          />
        </Content>
      </MainLayout>
    );
  }

  // Render no visa status
  if (!visaStatus) {
    return (
      <MainLayout>
        <Content style={{ padding: "24px" }}>
          <Alert
            message="Visa Information Not Available"
            description="Please complete your onboarding process to set up your visa information."
            type="warning"
            showIcon
            action={
              <Button
                type="primary"
                onClick={() => navigate("/employee/onboarding")}
              >
                Go to Onboarding
              </Button>
            }
          />
        </Content>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Content style={{ padding: "24px" }}>
        <Card
          title={
            <>
              <GlobalOutlined /> Visa Status Management
            </>
          }
        >
          <Tabs defaultActiveKey="overview">
            {/* Visa Overview Tab */}
            <TabPane
              tab={
                <span>
                  <GlobalOutlined /> Visa Overview
                </span>
              }
              key="overview"
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card
                    title="Visa Details"
                    extra={
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => setEditMode("visaDetails")}
                      >
                        Edit Visa Details
                      </Button>
                    }
                  >
                    {editMode === "visaDetails" ? (
                      <VisaForm
                        initialValues={visaStatus}
                        onSave={(data) => {
                          console.log("Updating Visa:", data);
                          setEditMode(null);
                        }}
                        onCancel={() => setEditMode(null)}
                      />
                    ) : (
                      <Descriptions column={2} bordered>
                        <Descriptions.Item label="Visa Type">
                          {visaStatus.visaType || "Not Specified"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Start Date">
                          {visaStatus.startDate
                            ? new Date(
                                visaStatus.startDate
                              ).toLocaleDateString()
                            : "Not Specified"}
                        </Descriptions.Item>
                        <Descriptions.Item label="End Date">
                          {visaStatus.endDate
                            ? new Date(visaStatus.endDate).toLocaleDateString()
                            : "Not Specified"}
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
                            {daysRemaining !== null
                              ? `${daysRemaining} days`
                              : "N/A"}
                          </Tag>
                        </Descriptions.Item>
                      </Descriptions>
                    )}
                  </Card>
                </Col>
              </Row>

              {daysRemaining !== null && daysRemaining < 90 && (
                <Alert
                  message="Visa Expiration Warning"
                  description={`Your visa will expire in ${daysRemaining} days. Please prepare the necessary documents.`}
                  type="warning"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </TabPane>

            {/* Document Management Tab */}
            <TabPane
              tab={
                <span>
                  <FileOutlined /> Document Management
                </span>
              }
              key="documents"
            >
              <Card title="Uploaded Documents">
                {visaStatus.documents && visaStatus.documents.length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {visaStatus.documents.map((doc, index) => (
                      <Col
                        key={doc._id || `doc-${index}`}
                        xs={24}
                        md={12}
                        lg={8}
                      >
                        <DocumentCard
                          doc={doc}
                          onViewDetails={handleViewDetails}
                        />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert
                    message="No Documents Uploaded"
                    description="You haven't uploaded any visa-related documents yet."
                    type="info"
                    showIcon
                  />
                )}

                <div style={{ marginTop: 16 }}>
                  <Button
                    type="primary"
                    icon={<FileOutlined />}
                    onClick={() => setEditMode("uploadDocument")}
                  >
                    Upload New Document
                  </Button>
                </div>
              </Card>
            </TabPane>
          </Tabs>
        </Card>

        {/* Document Upload Modal */}
        <Modal
          title="Upload Visa Document"
          open={editMode === "uploadDocument"}
          onCancel={() => setEditMode(null)}
          footer={null}
        >
          <PersonalInfoForm
            initialValues={{}}
            onSave={(data) => {
              // Implement document upload logic
              console.log("Uploading Document:", data);
              setEditMode(null);
            }}
            onCancel={() => setEditMode(null)}
            uploadMode={true}
          />
        </Modal>

        {/* Document Details Modal */}
        <Modal
          title="Document Details"
          open={!!selectedDocument}
          onCancel={() => setSelectedDocument(null)}
          footer={[
            <Button key="close" onClick={() => setSelectedDocument(null)}>
              Close
            </Button>,
          ]}
        >
          {selectedDocument && (
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Document Type">
                {selectedDocument.type}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    selectedDocument.status === "approved"
                      ? "green"
                      : selectedDocument.status === "pending"
                      ? "orange"
                      : "red"
                  }
                >
                  {selectedDocument.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Upload Date">
                {selectedDocument.uploadDate
                  ? new Date(selectedDocument.uploadDate).toLocaleDateString()
                  : "N/A"}
              </Descriptions.Item>
              {selectedDocument.feedback && (
                <Descriptions.Item label="Feedback">
                  {selectedDocument.feedback}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Modal>
      </Content>
    </MainLayout>
  );
};

export default React.memo(VisaManagement);
