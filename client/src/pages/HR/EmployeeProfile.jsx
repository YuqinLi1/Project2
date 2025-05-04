import React, { useEffect, useState } from "react";
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Descriptions,
  Spin,
  Alert,
  Tabs,
  Button,
  Tag,
  Divider,
  Modal,
  Table,
} from "antd";
import {
  UserOutlined,
  ContactsOutlined,
  HomeOutlined,
  GlobalOutlined,
  FileOutlined,
  EyeOutlined,
  EditOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useHr } from "../../contexts/HrContext";
import MainLayout from "../../components/common/MainLayout";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getEmployeeById,
    downloadDocument,
    selectedEmployee,
    loading,
    error,
  } = useHr();

  // State for document preview modal
  const [documentPreviewVisible, setDocumentPreviewVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Fetch employee details on component mount
  useEffect(() => {
    getEmployeeById(id);
  }, [id, getEmployeeById]);

  // Handle document download
  const handleDownloadDocument = async (documentId) => {
    await downloadDocument(documentId);
  };

  // Handle document preview
  const handlePreviewDocument = (document) => {
    setSelectedDocument(document);
    setDocumentPreviewVisible(true);
  };

  // Render document preview modal
  const renderDocumentPreviewModal = () => (
    <Modal
      title="Document Preview"
      visible={documentPreviewVisible}
      onCancel={() => setDocumentPreviewVisible(false)}
      footer={[
        <Button
          key="download"
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => handleDownloadDocument(selectedDocument._id)}
        >
          Download
        </Button>,
        <Button key="close" onClick={() => setDocumentPreviewVisible(false)}>
          Close
        </Button>,
      ]}
      width={800}
    >
      {selectedDocument && (
        <Descriptions title="Document Details" bordered column={2}>
          <Descriptions.Item label="Type">
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
          <Descriptions.Item label="Uploaded At" span={2}>
            {new Date(selectedDocument.createdAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );

  // Loading state
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
          <Spin size="large" tip="Loading Employee Profile..." />
        </Content>
      </MainLayout>
    );
  }

  // Error state
  if (error || !selectedEmployee) {
    return (
      <MainLayout>
        <Content style={{ padding: "24px" }}>
          <Alert
            message="Error Loading Employee Profile"
            description={error || "Employee not found"}
            type="error"
            showIcon
          />
        </Content>
      </MainLayout>
    );
  }

  // Destructure employee information
  const {
    personalInfo = {},
    contactInfo = {},
    address = {},
    employment = {},
    emergencyContacts = [],
    documents = [],
  } = selectedEmployee;

  // Columns for documents table
  const documentsColumns = [
    {
      title: "Document Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "approved"
              ? "green"
              : status === "pending"
              ? "orange"
              : "red"
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Uploaded At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadDocument(record._id)}
          >
            Download
          </Button>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handlePreviewDocument(record)}
          >
            Preview
          </Button>
        </>
      ),
    },
  ];

  return (
    <MainLayout>
      <Content style={{ padding: "24px" }}>
        {/* Profile Header */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col span={24}>
            <Card>
              <Row align="middle" gutter={16}>
                <Col>
                  <UserOutlined
                    style={{ fontSize: "48px", color: "#1890ff" }}
                  />
                </Col>
                <Col>
                  <Title level={3} style={{ margin: 0 }}>
                    {personalInfo.firstName} {personalInfo.lastName}
                  </Title>
                  <Text type="secondary">
                    {employment.visaType || "No Visa Type"}
                  </Text>
                </Col>
                <Col flex="auto" style={{ textAlign: "right" }}>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/hr/employees/${id}/edit`)}
                  >
                    Edit Profile
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Profile Tabs */}
        <Tabs defaultActiveKey="1">
          {/* Personal Information Tab */}
          <TabPane
            tab={
              <span>
                <UserOutlined /> Personal Information
              </span>
            }
            key="1"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Basic Details">
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="Full Name">
                      {personalInfo.firstName} {personalInfo.middleName || ""}{" "}
                      {personalInfo.lastName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Preferred Name">
                      {personalInfo.preferredName || "Not specified"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {personalInfo.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="SSN">
                      {personalInfo.ssn
                        ? "XXX-XX-" + personalInfo.ssn.slice(-4)
                        : "Not provided"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Date of Birth">
                      {personalInfo.dateOfBirth
                        ? new Date(
                            personalInfo.dateOfBirth
                          ).toLocaleDateString()
                        : "Not provided"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Gender">
                      {personalInfo.gender || "Not specified"}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="Contact Information">
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="Cell Phone">
                      {contactInfo.cellPhone || "Not provided"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Work Phone">
                      {contactInfo.workPhone || "Not provided"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Address">
                      {address.building} {address.street}, {address.city},{" "}
                      {address.state} {address.zipcode}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Employment Information Tab */}
          <TabPane
            tab={
              <span>
                <GlobalOutlined /> Employment Details
              </span>
            }
            key="2"
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Visa and Employment Information">
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="Visa Type">
                      {employment.visaType || "Not specified"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Start Date">
                      {employment.startDate
                        ? new Date(employment.startDate).toLocaleDateString()
                        : "Not provided"}
                    </Descriptions.Item>
                    <Descriptions.Item label="End Date">
                      {employment.endDate
                        ? new Date(employment.endDate).toLocaleDateString()
                        : "Not provided"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Onboarding Status">
                      <Tag
                        color={
                          selectedEmployee.onboardingStatus === "approved"
                            ? "green"
                            : selectedEmployee.onboardingStatus === "pending"
                            ? "orange"
                            : "red"
                        }
                      >
                        {selectedEmployee.onboardingStatus?.toUpperCase() ||
                          "NOT STARTED"}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Emergency Contacts Tab */}
          <TabPane
            tab={
              <span>
                <ContactsOutlined /> Emergency Contacts
              </span>
            }
            key="3"
          >
            <Card title="Emergency Contacts">
              {emergencyContacts.length > 0 ? (
                emergencyContacts.map((contact, index) => (
                  <div key={index}>
                    <Descriptions
                      title={`Contact ${index + 1}`}
                      column={2}
                      bordered
                    >
                      <Descriptions.Item label="Name">
                        {contact.firstName} {contact.lastName}
                      </Descriptions.Item>
                      <Descriptions.Item label="Relationship">
                        {contact.relationship}
                      </Descriptions.Item>
                      <Descriptions.Item label="Phone" span={2}>
                        {contact.phone}
                      </Descriptions.Item>
                      <Descriptions.Item label="Email" span={2}>
                        {contact.email}
                      </Descriptions.Item>
                    </Descriptions>
                    {index < emergencyContacts.length - 1 && <Divider />}
                  </div>
                ))
              ) : (
                <Alert
                  message="No Emergency Contacts"
                  description="No emergency contacts have been added."
                  type="info"
                />
              )}
            </Card>
          </TabPane>

          {/* Documents Tab */}
          <TabPane
            tab={
              <span>
                <FileOutlined /> Documents
              </span>
            }
            key="4"
          >
            <Card title="Uploaded Documents">
              <Table
                columns={documentsColumns}
                dataSource={documents}
                locale={{
                  emptyText: "No documents uploaded",
                }}
              />
            </Card>
          </TabPane>
        </Tabs>

        {/* Document Preview Modal */}
        {renderDocumentPreviewModal()}
      </Content>
    </MainLayout>
  );
};

export default EmployeeProfile;
