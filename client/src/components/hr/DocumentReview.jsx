import React, { useState } from "react";
import { Card, Button, Typography, Space, Tag, Modal, Form, Input } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;

const DocumentReview = ({
  document,
  loading,
  onApprove,
  onReject,
  onDownload,
}) => {
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [action, setAction] = useState(null);
  const [feedback, setFeedback] = useState("");

  if (!document) return null;

  const showFeedbackModal = (actionType) => {
    setAction(actionType);
    setFeedbackModalVisible(true);
  };

  const handleFeedbackSubmit = () => {
    if (action === "approve") {
      onApprove(document._id, feedback);
    } else {
      onReject(document._id, feedback);
    }
    setFeedbackModalVisible(false);
    setFeedback("");
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
    <Card>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Title level={3}>{document.type}</Title>
        <Tag color={getStatusColor(document.status)}>
          {document.status.toUpperCase()}
        </Tag>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Text strong>File Name:</Text> {document.fileName}
        <br />
        <Text strong>Upload Date:</Text>{" "}
        {dayjs(document.createdAt).format("MM/DD/YYYY hh:mm A")}
        <br />
        {document.reviewedAt && (
          <>
            <Text strong>Review Date:</Text>{" "}
            {dayjs(document.reviewedAt).format("MM/DD/YYYY hh:mm A")}
            <br />
          </>
        )}
        {document.feedback && (
          <>
            <Text strong>Feedback:</Text>
            <br />
            <div
              style={{
                background: "#f5f5f5",
                padding: 10,
                borderRadius: 4,
                marginTop: 8,
              }}
            >
              {document.feedback}
            </div>
          </>
        )}
      </div>

      <div
        style={{
          height: "60vh",
          border: "1px solid #d9d9d9",
          marginBottom: 20,
        }}
      >
        <iframe
          src={`/api/documents/${document._id}/preview`}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Document Preview"
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          icon={<DownloadOutlined />}
          onClick={() => onDownload(document._id)}
        >
          Download
        </Button>

        <Space>
          {document.status === "pending" && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                loading={loading}
                onClick={() => showFeedbackModal("approve")}
              >
                Approve
              </Button>
              <Button
                type="primary"
                danger
                icon={<CloseOutlined />}
                loading={loading}
                onClick={() => showFeedbackModal("reject")}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      </div>

      <Modal
        title={`${action === "approve" ? "Approve" : "Reject"} Document`}
        visible={feedbackModalVisible}
        onOk={handleFeedbackSubmit}
        onCancel={() => setFeedbackModalVisible(false)}
        okText={action === "approve" ? "Approve" : "Reject"}
        okButtonProps={{
          style:
            action === "approve"
              ? { backgroundColor: "#52c41a", borderColor: "#52c41a" }
              : {},
        }}
      >
        <Form layout="vertical">
          <Form.Item
            label="Feedback"
            help={
              action === "reject"
                ? "Please provide feedback on why the document is being rejected."
                : "Optional feedback for the approved document."
            }
          >
            <TextArea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter feedback here..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default DocumentReview;
