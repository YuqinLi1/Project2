import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Layout,
  Typography,
  Divider,
  Alert,
  Button
} from "antd";
import { jwtDecode } from "jwt-decode";

// Import components
import PersonalInfoForm from "../../components/forms/PersonalInfoForm";
import AddressForm from "../../components/forms/AddressForm";
import EmergencyContactForm from "../../components/forms/EmergencyContactForm";
import VisaForm from "../../components/forms/VisaForm";
import DocumentUpload from "../../components/common/FileUpload";


const Onboarding = () => {
  const navigate = useNavigate();
  const [unauthorized, setUnauthorized] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const { Content, Footer } = Layout;
  const { Title } = Typography;
  const [personalInfo, setPersonalInfo] = useState({});
  const [addressInfo, setAddressInfo] = useState({});
  const [emergencyContact, setEmergencyContact] = useState({});
  const [visaInfo, setVisaInfo] = useState({});

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

  const handleSubmitAll = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const employeeData = {
        ...personalInfo,
        ...addressInfo,
        ...emergencyContact,
        ...visaInfo
      };
      const res = await axios.post("http://localhost:5000/api/employee", employeeData, config);
      const employeeId = res.data._id;

      // TODO: Add actual document upload logic here
      // await axios.post("http://localhost:5000/api/employee/documents", documentData, config);

      navigate("/employee/dashboard");
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  if (unauthorized) {
    return <Alert message="401 Unauthorized" type="error" showIcon />;
  }

  return (
    <Content style={{ padding: "24px" }}>
      <Title level={3}>Onboarding</Title>

      <PersonalInfoForm email={userEmail} onChange={setPersonalInfo} />
      <Divider />

      <AddressForm onChange={setAddressInfo} />
      <Divider />

      <EmergencyContactForm onChange={setEmergencyContact} />
      <Divider />

      <VisaForm onChange={setVisaInfo} />
      <Divider />

      <DocumentUpload />
      <Button type="primary" onClick={handleSubmitAll} style={{ marginTop: 24 }}>
        Submit All
      </Button>
    </Content>
    
  );
};

export default Onboarding;
