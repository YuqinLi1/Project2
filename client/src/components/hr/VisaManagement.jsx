import React, { useState } from "react";
import {
  Card,
  Tabs,
  Table,
  Tag,
  Space,
  Button,
  Tooltip,
  Modal,
  Form,
  Input,
  Typography,
} from "antd";
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  MailOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Text } = Typography;

const VisaManagement = ({
  visaInProgress,
  visaAll,
  loading,
  onViewDocument,
  onReviewDocument,
  onSendNotification,
  onViewEmployee,
}) => {
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [documentPreviewVisible, setDocumentPreviewVisible] = useState(false);

  const showFeedbackModal = (document, initialAction) => {
    setSelectedDocument({ ...document, initialAction });
    setFeedbackModalVisible(true);
  };

  const handleFeedbackSubmit = () => {
    onReviewDocument(
      selectedDocument._id,
      selectedDocument.initialAction,
      feedbackText
    );
    setFeedbackModalVisible(false);
    setFeedbackText("");
    setSelectedDocument(null);
  };

  const showDocumentPreview = (documentId) => {
    setSelectedDocument({ _id: documentId });
    setDocumentPreviewVisible(true);
    onViewDocument(documentId);
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

  const getNextStep = (visaStatus) => {
    const stepOrder = ["OPT Receipt", "OPT EAD", "I-983", "I-20", "Completed"];
    const currentIndex = stepOrder.indexOf(visaStatus.currentStep);
    return currentIndex < stepOrder.length - 1
      ? stepOrder[currentIndex]
      : "All steps completed";
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const end = dayjs(endDate);
    const now = dayjs();
    const days = end.diff(now, "day");
    return days;
  };

  const calculateExpiryWarning = (daysRemaining) => {
    if (daysRemaining === null) return null;
    if (daysRemaining <= 30) return "red";
    if (daysRemaining <= 90) return "orange";
    return "green";
  };

  const inProgressColumns = [
    {
      title: "Name",
      key: "name",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => onViewEmployee(record.employeeId._id)}
        >
          {`${record.employeeId.firstName} ${record.employeeId.lastName}`}
        </Button>
      ),
    },
    {
      title: "Visa Type",
      dataIndex: "visaType",
      key: "visaType",
    },
    {
      title: "Current Step",
      dataIndex: "currentStep",
      key: "currentStep",
    },
    {
      title: "Next Step",
      key: "nextStep",
      render: (_, record) => getNextStep(record),
    },
    {
      title: "Days Remaining",
      key: "daysRemaining",
      render: (_, record) => {
        const days = getDaysRemaining(record.endDate);
        const color = calculateExpiryWarning(days);
        return days !== null ? <Tag color={color}>{days} days</Tag> : "N/A";
      },
      sorter: (a, b) => {
        const daysA = getDaysRemaining(a.endDate) || 0;
        const daysB = getDaysRemaining(b.endDate) || 0;
        return daysA - daysB;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        // Find the pending document that matches the current step
        const pendingDoc = record.documents.find(
          (doc) => doc.type === record.currentStep && doc.status === "pending"
        );

        return (
          <Space size="small">
            {pendingDoc ? (
              <>
                <Tooltip title="View Document">
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => showDocumentPreview(pendingDoc.documentId)}
                  />
                </Tooltip>
                <Tooltip title="Approve">
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    size="small"
                    style={{
                      backgroundColor: "#52c41a",
                      borderColor: "#52c41a",
                    }}
                    onClick={() =>
                      showFeedbackModal(pendingDoc.documentId, "approved")
                    }
                  />
                </Tooltip>
                <Tooltip title="Reject">
                  <Button
                    type="primary"
                    danger
                    icon={<CloseOutlined />}
                    size="small"
                    onClick={() =>
                      showFeedbackModal(pendingDoc.documentId, "rejected")
                    }
                  />
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Send Email Notification">
                <Button
                  type="primary"
                  icon={<MailOutlined />}
                  size="small"
                  onClick={() => onSendNotification(record.employeeId._id)}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  const allVisaColumns = [
    {
      title: "Name",
      key: "name",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => onViewEmployee(record.employeeId._id)}
        >
          {`${record.employeeId.firstName} ${record.employeeId.lastName}`}
        </Button>
      ),
    },
    {
      title: "Visa Type",
      dataIndex: "visaType",
      key: "visaType",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => (date ? dayjs(date).format("MM/DD/YYYY") : "N/A"),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => (date ? dayjs(date).format("MM/DD/YYYY") : "N/A"),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const isCompleted = record.currentStep === "Completed";
        const days = getDaysRemaining(record.endDate);
        const color = isCompleted ? "green" : calculateExpiryWarning(days);

        return (
          <Tag color={color}>
            {isCompleted ? "COMPLETED" : `IN PROGRESS (${days} days left)`}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => onViewEmployee(record.employeeId._id)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab="In Progress" key="1">
          <Card title="Visa Status Management - In Progress">
            <Table
              columns={inProgressColumns}
              dataSource={visaInProgress}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        <TabPane tab="All Employees" key="2">
          <Card title="All Visa Status">
            <Table
              columns={allVisaColumns}
              dataSource={visaAll}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={`${
          selectedDocument?.initialAction === "approved" ? "Approve" : "Reject"
        } Document`}
        visible={feedbackModalVisible}
        onOk={handleFeedbackSubmit}
        onCancel={() => setFeedbackModalVisible(false)}
        okText={
          selectedDocument?.initialAction === "approved" ? "Approve" : "Reject"
        }
        okButtonProps={{
          style:
            selectedDocument?.initialAction === "approved"
              ? { backgroundColor: "#52c41a", borderColor: "#52c41a" }
              : {},
        }}
      >
        <Form layout="vertical">
          <Form.Item
            label="Feedback"
            help={
              selectedDocument?.initialAction === "rejected"
                ? "Please provide feedback on why the document is being rejected."
                : "Optional feedback for the approved document."
            }
          >
            <TextArea
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Enter feedback here..."
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Document Preview"
        visible={documentPreviewVisible}
        onCancel={() => setDocumentPreviewVisible(false)}
        footer={null}
        width={800}
      >
        {selectedDocument && (
          <div style={{ height: "70vh", overflow: "auto" }}>
            <iframe
              src={`/api/documents/${selectedDocument._id}/preview`}
              style={{ width: "100%", height: "100%", border: "none" }}
              title="Document Preview"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VisaManagement;
