import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Divider,
  Alert,
  Form,
  Button,
  message,
} from "antd";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// Import components
import PersonalInfoForm from "../../components/forms/PersonalInfoForm";
import AddressForm from "../../components/forms/AddressForm";
import EmergencyContactForm from "../../components/forms/EmergencyContactForm";
import VisaForm from "../../components/forms/VisaForm";
import DocumentUpload from "../../components/common/FileUpload";

const { Content } = Layout;
const { Title } = Typography;

const Onboarding = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [unauthorized, setUnauthorized] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    personalInfo: {},
    address: {},
    contactInfo: {},
    visaInfo: {},
    emergencyContacts: [],
    documents: {},
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUnauthorized(true);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUserEmail(decoded.email);
    } catch (err) {
      setUnauthorized(true);
    }
  }, []);

  // Handle form data updates
  const handleFormUpdate = (section, data) => {
    setFormData((prevData) => ({
      ...prevData,
      [section]: data,
    }));
  };

  // Handle document upload
  const handleDocumentUpload = (documentType, file) => {
    setFormData((prevData) => ({
      ...prevData,
      documents: {
        ...prevData.documents,
        [documentType]: file,
      },
    }));
  };

  // Submit entire onboarding application
  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      // Prepare form data for submission
      const submissionData = new FormData();

      // Add text data as JSON
      submissionData.append(
        "applicationData",
        JSON.stringify({
          personalInfo: formData.personalInfo,
          address: formData.address,
          contactInfo: formData.contactInfo,
          visaInfo: formData.visaInfo,
          emergencyContacts: formData.emergencyContacts,
        })
      );

      // Add document files
      Object.entries(formData.documents).forEach(([type, file]) => {
        submissionData.append(type, file);
      });

      // Submit onboarding application
      const response = await axios.post(
        "/api/employee/onboarding",
        submissionData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Handle successful submission
      message.success("Onboarding application submitted successfully");
      navigate("/employee/dashboard");
    } catch (error) {
      // Handle submission error
      message.error(
        error.response?.data?.message ||
          "Failed to submit onboarding application"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (unauthorized) {
    return <Alert message="401 Unauthorized" type="error" showIcon />;
  }

  return (
    <Content style={{ padding: "24px" }}>
      <Title level={3}>Onboarding Application</Title>

      <Form form={form} onFinish={handleSubmit}>
        <PersonalInfoForm
          email={userEmail}
          onChange={(data) => handleFormUpdate("personalInfo", data)}
        />
        <Divider />

        <AddressForm onChange={(data) => handleFormUpdate("address", data)} />
        <Divider />

        <EmergencyContactForm
          onChange={(data) => handleFormUpdate("emergencyContacts", data)}
        />
        <Divider />

        <VisaForm
          onChange={(data) => handleFormUpdate("visaInfo", data)}
          onDocumentUpload={handleDocumentUpload}
        />
        <Divider />

        <DocumentUpload
          onUpload={(file) => handleDocumentUpload("driverLicense", file)}
        />

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} block>
            Submit Onboarding Application
          </Button>
        </Form.Item>
      </Form>
    </Content>
  );
};

export default Onboarding;
