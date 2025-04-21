import React, { useState, useEffect } from "react";
import { Layout, Typography, Breadcrumb, Spin } from "antd";
import { HomeOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useHr } from "../../contexts/HrContext";
import EmployeeList from "../../components/hr/EmployeeList";
import EmployeeDetail from "../../components/hr/EmployeeDetail";
import MainLayout from "../../components/common/MainLayout";

const { Title } = Typography;
const { Content } = Layout;

const EmployeeProfiles = () => {
  const {
    getAllEmployees,
    searchEmployees,
    getEmployeeDetails,
    employees,
    selectedEmployee,
    loading,
  } = useHr();
  const { id } = useParams();
  const navigate = useNavigate();
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    getAllEmployees();
  }, []);

  useEffect(() => {
    if (id) {
      getEmployeeDetails(id);
    }
  }, [id]);

  const handleSearch = (searchTerm) => {
    if (searchTerm.trim() === "") {
      getAllEmployees();
    } else {
      searchEmployees(searchTerm);
    }
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

  const handlePreviewDocument = (documentId) => {
    // This is handled by the iframe in the modal
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
            <UserOutlined /> Employees
          </Breadcrumb.Item>
          {id && (
            <Breadcrumb.Item>
              {selectedEmployee
                ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
                : "Loading..."}
            </Breadcrumb.Item>
          )}
        </Breadcrumb>

        {id ? (
          <>
            <Title level={2}>Employee Profile</Title>
            {loading ? (
              <div style={{ textAlign: "center", padding: "50px" }}>
                <Spin size="large" />
              </div>
            ) : (
              <EmployeeDetail
                employee={selectedEmployee}
                onDownloadDocument={handleDownloadDocument}
                onPreviewDocument={handlePreviewDocument}
              />
            )}
          </>
        ) : (
          <>
            <Title level={2}>Employee Profiles</Title>
            <EmployeeList
              employees={employees}
              loading={loading}
              onSearch={handleSearch}
            />
          </>
        )}
      </Content>
    </MainLayout>
  );
};

export default EmployeeProfiles;
