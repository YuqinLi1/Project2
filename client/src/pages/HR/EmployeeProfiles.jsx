import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Card,
  Row,
  Col,
  Descriptions,
  Button,
  Spin,
  Alert,
  Divider,
  Tag,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  FileOutlined,
  GlobalOutlined,
  ContactsOutlined,
  HomeOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

import MainLayout from "../../components/common/MainLayout";
import { useHr } from "../../contexts/HrContext";

const { Content } = Layout;
const { Title, Text } = Typography;

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEmployeeById, selectedEmployee, loading, error } = useHr();

  useEffect(() => {
    // Fetch employee details when component mounts
    getEmployeeById(id);
  }, [id, getEmployeeById]);

  // If loading or no employee found
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

  // Handle error case
  if (error || !selectedEmployee) {
    return (
      <MainLayout>
        <Content style={{ padding: "24px" }}>
          <Alert
            message="Employee Not Found"
            description="Unable to retrieve employee details."
            type="error"
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
    onboardingStatus,
  } = selectedEmployee;

  return (
    <MainLayout>
      <Content style={{ padding: "24px" }}>
        <Row gutter={[16, 16]}>
          {/* Profile Header */}
          <Col xs={24}>
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

          {/* Personal Information */}
          <Col xs={24} md={12}>
            <Card
              title={
                <>
                  <UserOutlined /> Personal Information
                </>
              }
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Full Name">
                  {personalInfo.firstName} {personalInfo.middleName || ""}{" "}
                  {personalInfo.lastName}
                </Descriptions.Item>
                <Descriptions.Item label="Preferred Name">
                  {personalInfo.preferredName || "Not specified"}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {personalInfo.email || "Not provided"}
                </Descriptions.Item>
                <Descriptions.Item label="SSN">
                  {personalInfo.ssn
                    ? "XXX-XX-" + personalInfo.ssn.slice(-4)
                    : "Not provided"}
                </Descriptions.Item>
                <Descriptions.Item label="Date of Birth">
                  {personalInfo.dateOfBirth || "Not provided"}
                </Descriptions.Item>
                <Descriptions.Item label="Gender">
                  {personalInfo.gender || "Not specified"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Contact Information */}
          <Col xs={24} md={12}>
            <Card
              title={
                <>
                  <ContactsOutlined /> Contact Information
                </>
              }
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Cell Phone">
                  {contactInfo.cellPhone || "Not provided"}
                </Descriptions.Item>
                <Descriptions.Item label="Work Phone">
                  {contactInfo.workPhone || "Not provided"}
                </Descriptions.Item>
                <Descriptions.Item label="Address">
                  {address.building} {address.street},{address.city},{" "}
                  {address.state} {address.zipcode}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Employment Information */}
          <Col xs={24} md={12}>
            <Card
              title={
                <>
                  <GlobalOutlined /> Employment Details
                </>
              }
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Visa Type">
                  {employment.visaType || "Not specified"}
                </Descriptions.Item>
                <Descriptions.Item label="Start Date">
                  {employment.startDate || "Not provided"}
                </Descriptions.Item>
                <Descriptions.Item label="End Date">
                  {employment.endDate || "Not provided"}
                </Descriptions.Item>
                <Descriptions.Item label="Onboarding Status">
                  <Tag
                    color={
                      onboardingStatus === "approved"
                        ? "green"
                        : onboardingStatus === "pending"
                        ? "orange"
                        : "red"
                    }
                  >
                    {onboardingStatus || "Not Started"}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Emergency Contacts */}
          <Col xs={24} md={12}>
            <Card
              title={
                <>
                  <ContactsOutlined /> Emergency Contacts
                </>
              }
            >
              {emergencyContacts.length > 0 ? (
                emergencyContacts.map((contact, index) => (
                  <Descriptions
                    key={index}
                    column={1}
                    size="small"
                    title={`Contact ${index + 1}`}
                  >
                    <Descriptions.Item label="Name">
                      {contact.firstName} {contact.lastName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Relationship">
                      {contact.relationship}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      {contact.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {contact.email}
                    </Descriptions.Item>
                    {index < emergencyContacts.length - 1 && <Divider />}
                  </Descriptions>
                ))
              ) : (
                <Text type="secondary">No emergency contacts added</Text>
              )}
            </Card>
          </Col>
        </Row>
      </Content>
    </MainLayout>
  );
};

export default EmployeeProfile;
