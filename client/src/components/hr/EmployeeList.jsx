import React, { useState, useEffect } from "react";
import { Table, Input, Space, Button, Tag, Tooltip } from "antd";
import { SearchOutlined, UserOutlined, EyeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const EmployeeList = ({ employees, loading, onSearch }) => {
  const [searchText, setSearchText] = useState("");

  const handleSearch = () => {
    onSearch(searchText);
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

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <Link to={`/hr/employees/${record._id}`}>
          {`${record.firstName} ${record.lastName}`}
        </Link>
      ),
      sorter: (a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "SSN",
      dataIndex: "ssn",
      key: "ssn",
      render: (ssn) => (ssn ? ssn.replace(/\d{5}$/, "*****") : ""),
    },
    {
      title: "Work Authorization",
      dataIndex: "workAuthorization",
      key: "workAuthorization",
      render: (_, record) =>
        record.isPermanentResident ? record.residencyType : record.visaType,
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (_, record) => record.contactInfo?.cellPhone || "",
    },
    {
      title: "Onboarding Status",
      key: "onboardingStatus",
      dataIndex: "onboardingStatus",
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase() || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Profile">
            <Link to={`/hr/employees/${record._id}`}>
              <Button type="primary" icon={<EyeOutlined />} size="small" />
            </Link>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by name or email"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 300, marginRight: 8 }}
          prefix={<SearchOutlined />}
        />
        <Button type="primary" onClick={handleSearch}>
          Search
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={employees}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default EmployeeList;
