import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Divider,
  Alert,
} from "antd";
import { jwtDecode } from "jwt-decode";

// Import components
import PersonalInfoForm from "../../components/forms/PersonalInfoForm";
import AddressForm from "../../components/forms/AddressForm";
import EmergencyContactForm from "../../components/forms/EmergencyContactForm";
import VisaForm from "../../components/forms/VisaForm";
import DocumentUpload from "../../components/common/FileUpload";

const { Content, Footer } = Layout;
const { Title } = Typography;

const Onboarding = () => {
  const navigate = useNavigate();
  const [unauthorized, setUnauthorized] = useState(false);
  const [userEmail, setUserEmail] = useState("");

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

  if (unauthorized) {
    return <Alert message="401 Unauthorized" type="error" showIcon />;
  }

  return (
    <Content style={{ padding: "24px" }}>
      <Title level={3}>Onboarding</Title>

      <PersonalInfoForm email={userEmail} />
      <Divider />

      <AddressForm />
      <Divider />

      <EmergencyContactForm />
      <Divider />

      <VisaForm />
      <Divider />

      <DocumentUpload />
    </Content>
  );
};

export default Onboarding;
