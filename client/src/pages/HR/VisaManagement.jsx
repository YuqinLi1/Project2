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
  Tooltip,
} from "antd";
import {
  HomeOutlined,
  GlobalOutlined,
  FileOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useHr } from "../../contexts/HrContext";
import VisaManagementComponent from "../../components/hr/VisaManagement";
import DocumentReview from "../../components/hr/DocumentReview";
import MainLayout from "../../components/common/MainLayout";

const { Title, Text } = Typography;
const { Content } = Layout;
const { TabPane } = Tabs;

const VisaManagementPage = () => {
  const {
    getVisaManagement,
    reviewVisaDocument,
    downloadDocument,
    visaManagement,
    loading,
    error,
  } = useHr();
  const navigate = useNavigate();

  // State management
  const [documentReviewVisible, setDocumentReviewVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [activeTab, setActiveTab] = useState("inProgress");

  // Fetch initial data
  useEffect(() => {
    getVisaManagement();
  }, [getVisaManagement]);

  // Memoized data processing
  const processedVisaData = useMemo(() => {
    return {
      inProgress: visaManagement.filter((visa) =>
        visa.documents.some((doc) => doc.status === "pending")
      ),
      completed: visaManagement.filter((visa) =>
        visa.documents.every((doc) => doc.status === "approved")
      ),
    };
  }, [visaManagement]);

  // Document review handlers
  const handleReviewDocument = async (
    employeeId,
    documentId,
    status,
    feedback = ""
  ) => {
    await reviewVisaDocument(employeeId, documentId, status, feedback);
    setDocumentReviewVisible(false);
  };

  // View document details
  const handleViewDocument = (visa, document) => {
    setSelectedDocument({
      employeeId: visa.employeeId,
      ...document,
      employeeName: `${visa.personalInfo?.firstName || ""} ${
        visa.personalInfo?.lastName || ""
      }`,
    });
    setDocumentReviewVisible(true);
  };

  // Download document
  const handleDownloadDocument = async (documentId) => {
    await downloadDocument(documentId);
  };

  // View employee profile
  const handleViewEmployee = (employeeId) => {
    setDocumentReviewVisible(false);
    navigate(`/hr/employees/${employeeId}`);
  };

  // Render document review modal
  const renderDocumentReviewModal = () => (
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
          onApprove={(documentId, feedback) =>
            handleReviewDocument(
              selectedDocument.employeeId,
              documentId,
              "approved",
              feedback
            )
          }
          onReject={(documentId, feedback) =>
            handleReviewDocument(
              selectedDocument.employeeId,
              documentId,
              "rejected",
              feedback
            )
          }
          onDownload={handleDownloadDocument}
          onViewEmployee={() => handleViewEmployee(selectedDocument.employeeId)}
        />
      )}
    </Modal>
  );

  // Render content based on loading and error states
  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" tip="Loading Visa Management..." />
        </div>
      );
    }

    if (error) {
      return (
        <Alert
          message="Error Loading Visa Data"
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
              <ClockCircleOutlined /> In Progress
            </span>
          }
          key="inProgress"
        >
          <Card title="Visa Documents in Progress">
            {processedVisaData.inProgress.length === 0 ? (
              <Alert
                message="No Pending Visa Documents"
                description="There are currently no visa documents awaiting review."
                type="info"
              />
            ) : (
              <Row gutter={[16, 16]}>
                {processedVisaData.inProgress.map((visa) => (
                  <Col key={visa._id} xs={24} sm={12} md={8}>
                    <Card
                      title={`${visa.personalInfo?.firstName || ""} ${
                        visa.personalInfo?.lastName || ""
                      }`}
                      extra={
                        <Button
                          type="link"
                          onClick={() => handleViewEmployee(visa.employeeId)}
                        >
                          View Profile
                        </Button>
                      }
                    >
                      {visa.documents
                        .filter((doc) => doc.status === "pending")
                        .map((doc) => (
                          <Card.Grid
                            key={doc._id}
                            hoverable
                            style={{ width: "100%", textAlign: "center" }}
                          >
                            <Row justify="space-between" align="middle">
                              <Col>
                                <Text strong>{doc.type}</Text>
                                <div>
                                  <Tag color="orange">Pending</Tag>
                                </div>
                              </Col>
                              <Col>
                                <Tooltip title="View Document">
                                  <Button
                                    type="text"
                                    icon={<EyeOutlined />}
                                    onClick={() =>
                                      handleViewDocument(visa, doc)
                                    }
                                  />
                                </Tooltip>
                                <Tooltip title="Download Document">
                                  <Button
                                    type="text"
                                    icon={<DownloadOutlined />}
                                    onClick={() =>
                                      handleDownloadDocument(doc._id)
                                    }
                                  />
                                </Tooltip>
                              </Col>
                            </Row>
                          </Card.Grid>
                        ))}
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </TabPane>
        <TabPane
          tab={
            <span>
              <CheckCircleOutlined /> Completed
            </span>
          }
          key="completed"
        >
          <Card title="Completed Visa Processes">
            {processedVisaData.completed.length === 0 ? (
              <Alert
                message="No Completed Visa Processes"
                description="No visa processes have been fully completed yet."
                type="info"
              />
            ) : (
              <Row gutter={[16, 16]}>
                {processedVisaData.completed.map((visa) => (
                  <Col key={visa._id} xs={24} sm={12} md={8}>
                    <Card
                      title={`${visa.personalInfo?.firstName || ""} ${
                        visa.personalInfo?.lastName || ""
                      }`}
                      extra={
                        <Button
                          type="link"
                          onClick={() => handleViewEmployee(visa.employeeId)}
                        >
                          View Profile
                        </Button>
                      }
                    >
                      {visa.documents.map((doc) => (
                        <Card.Grid
                          key={doc._id}
                          style={{ width: "100%", textAlign: "center" }}
                        >
                          <Row justify="space-between" align="middle">
                            <Col>
                              <Text strong>{doc.type}</Text>
                              <div>
                                <Tag color="green">Approved</Tag>
                              </div>
                            </Col>
                            <Col>
                              <Tooltip title="Download Document">
                                <Button
                                  type="text"
                                  icon={<DownloadOutlined />}
                                  onClick={() =>
                                    handleDownloadDocument(doc._id)
                                  }
                                />
                              </Tooltip>
                            </Col>
                          </Row>
                        </Card.Grid>
                      ))}
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
            <GlobalOutlined /> Visa Management
          </Breadcrumb.Item>
        </Breadcrumb>

        <Title level={2}>Visa Management</Title>

        {renderContent()}
        {renderDocumentReviewModal()}
      </Content>
    </MainLayout>
  );
};

export default VisaManagementPage;
