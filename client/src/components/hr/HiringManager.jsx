import React, { useState } from "react";
import {
  Card,
  Tabs,
  Descriptions,
  Button,
  Tag,
  Avatar,
  Row,
  Col,
  Typography,
  Space,
  Modal,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  FileOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const EmployeeDetail = ({
  employee,
  onDownloadDocument,
  onPreviewDocument,
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);

  if (!employee) return null;

  const handlePreview = (document) => {
    setPreviewDocument(document);
    setPreviewVisible(true);
    onPreviewDocument(document._id);
  };

  const handleDownload = (document) => {
    onDownloadDocument(document._id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "green";
      case "pending":
        return "gold";
      case "rejected":
        return "red";
      default:
        return "default";
    }
  };

  return (
    <div>
      <Card>
        <Row gutter={24}>
          <Col span={6}>
            <Avatar
              size={100}
              icon={<UserOutlined />}
              src={employee.profilePicture}
            />
          </Col>
          <Col span={18}>
            <Title level={3}>{`${employee.firstName} ${
              employee.middleName || ""
            } ${employee.lastName}`}</Title>
            <Space direction="vertical">
              <Text>
                <MailOutlined /> {employee.email}
              </Text>
              <Text>
                <PhoneOutlined /> {employee.contactInfo?.cellPhone}
              </Text>
              <Text>
                Onboarding Status:
                <Tag
                  color={getStatusColor(employee.onboardingStatus)}
                  style={{ marginLeft: 8 }}
                >
                  {employee.onboardingStatus?.toUpperCase() || "N/A"}
                </Tag>
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      <Tabs defaultActiveKey="personal" style={{ marginTop: 16 }}>
        <TabPane tab="Personal Information" key="personal">
          <Card>
            <Descriptions title="Basic Information" bordered>
              <Descriptions.Item label="Full Name">{`${employee.firstName} ${
                employee.middleName || ""
              } ${employee.lastName}`}</Descriptions.Item>
              <Descriptions.Item label="Preferred Name">
                {employee.preferredName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="SSN">
                {employee.ssn?.replace(/\d{5}$/, "*****") || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                {employee.dateOfBirth
                  ? dayjs(employee.dateOfBirth).format("MM/DD/YYYY")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {employee.gender || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {employee.email}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="Address" bordered style={{ marginTop: 16 }}>
              <Descriptions.Item label="Building/Apt #">
                {employee.currentAddress?.building || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Street">
                {employee.currentAddress?.street || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="City">
                {employee.currentAddress?.city || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="State">
                {employee.currentAddress?.state || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="ZIP Code">
                {employee.currentAddress?.zip || "N/A"}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions
              title="Contact Information"
              bordered
              style={{ marginTop: 16 }}
            >
              <Descriptions.Item label="Cell Phone">
                {employee.contactInfo?.cellPhone || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Work Phone">
                {employee.contactInfo?.workPhone || "N/A"}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="Employment" bordered style={{ marginTop: 16 }}>
              <Descriptions.Item label="Permanent Resident">
                {employee.isPermanentResident ? "Yes" : "No"}
              </Descriptions.Item>
              {employee.isPermanentResident ? (
                <Descriptions.Item label="Residency Type">
                  {employee.residencyType || "N/A"}
                </Descriptions.Item>
              ) : (
                <>
                  <Descriptions.Item label="Visa Type">
                    {employee.visaType || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Start Date">
                    {employee.startDate
                      ? dayjs(employee.startDate).format("MM/DD/YYYY")
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="End Date">
                    {employee.endDate
                      ? dayjs(employee.endDate).format("MM/DD/YYYY")
                      : "N/A"}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </Card>
        </TabPane>

        <TabPane tab="Documents" key="documents">
          <Card>
            {employee.documents && employee.documents.length > 0 ? (
              <div>
                <Title level={4}>Uploaded Documents</Title>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                  {employee.documents.map((doc) => (
                    <Card
                      key={doc._id}
                      style={{ width: 300 }}
                      actions={[
                        <Button type="link" onClick={() => handlePreview(doc)}>
                          Preview
                        </Button>,
                        <Button type="link" onClick={() => handleDownload(doc)}>
                          Download
                        </Button>,
                      ]}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <FileOutlined
                          style={{ fontSize: 36, marginBottom: 8 }}
                        />
                        <Text strong>{doc.type}</Text>
                        <Text>{doc.fileName}</Text>
                        <Tag
                          color={getStatusColor(doc.status)}
                          style={{ marginTop: 8 }}
                        >
                          {doc.status?.toUpperCase()}
                        </Tag>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Text>No documents uploaded yet.</Text>
            )}
          </Card>
        </TabPane>

        <TabPane tab="Emergency Contacts" key="emergency">
          <Card>
            {employee.emergencyContacts &&
            employee.emergencyContacts.length > 0 ? (
              employee.emergencyContacts.map((contact, index) => (
                <Card key={index} style={{ marginBottom: 16 }}>
                  <Descriptions
                    title={`Emergency Contact ${index + 1}`}
                    bordered
                  >
                    <Descriptions.Item label="Name">{`${contact.firstName} ${contact.lastName}`}</Descriptions.Item>
                    <Descriptions.Item label="Relationship">
                      {contact.relationship}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      {contact.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {contact.email}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              ))
            ) : (
              <Text>No emergency contacts added.</Text>
            )}
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="Document Preview"
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        {previewDocument && (
          <div style={{ height: "70vh", overflow: "auto" }}>
            <iframe
              src={`/api/documents/${previewDocument._id}/preview`}
              style={{ width: "100%", height: "100%", border: "none" }}
              title="Document Preview"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeDetail;
