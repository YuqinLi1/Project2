import React, { useState } from "react";
import {
  Card,
  Button,
  Typography,
  Form,
  Input,
  Row,
  Col,
  Avatar,
  Upload,
  Divider,
  DatePicker,
  Radio,
  Modal,
  Alert,
  Spin,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;

const Profile = ({ profileData, loading, onUpdateProfile, onCancelEdit }) => {
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);

  if (!profileData) return <Spin size="large" />;

  const handleEdit = () => {
    form.setFieldsValue({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      middleName: profileData.middleName,
      preferredName: profileData.preferredName,
      ssn: profileData.ssn,
      dateOfBirth: profileData.dateOfBirth
        ? dayjs(profileData.dateOfBirth)
        : null,
      gender: profileData.gender,
    });
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Create form data for file upload
      const formData = new FormData();

      // Add profile picture if uploaded
      if (fileList.length > 0) {
        formData.append("profilePicture", fileList[0].originFileObj);
      }

      // Add form values as JSON
      formData.append("profileData", JSON.stringify(values));

      onUpdateProfile(formData);
      setEditMode(false);
      setFileList([]);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    setConfirmModalVisible(true);
  };

  const handleDiscard = () => {
    setEditMode(false);
    setConfirmModalVisible(false);
    setFileList([]);
  };

  const handleContinueEditing = () => {
    setConfirmModalVisible(false);
  };

  const handleFileChange = (info) => {
    let fileListUpdate = [...info.fileList];

    // Limit to latest file
    fileListUpdate = fileListUpdate.slice(-1);

    setFileList(fileListUpdate);
  };

  const formatDate = (date) => {
    return date ? dayjs(date).format("MM/DD/YYYY") : "N/A";
  };

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <UserOutlined style={{ marginRight: 8, fontSize: 20 }} />
          <Title level={4} style={{ margin: 0 }}>
            Personal Information
          </Title>
        </div>
      }
      extra={
        !editMode ? (
          <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
            Edit
          </Button>
        ) : (
          <div>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              style={{ marginRight: 8 }}
              loading={loading}
            >
              Save
            </Button>
            <Button icon={<CloseOutlined />} onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        )
      }
    >
      {!editMode ? (
        <div>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <Avatar
              size={100}
              src={profileData.profilePicture}
              icon={<UserOutlined />}
            />
            <Title level={3} style={{ marginTop: 16, marginBottom: 4 }}>
              {profileData.firstName} {profileData.lastName}
            </Title>
            <Text type="secondary">
              {profileData.preferredName
                ? `(${profileData.preferredName})`
                : ""}
            </Text>
          </div>

          <Divider />

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>First Name:</Text> {profileData.firstName}
            </Col>
            <Col span={12}>
              <Text strong>Last Name:</Text> {profileData.lastName}
            </Col>
            <Col span={12}>
              <Text strong>Middle Name:</Text> {profileData.middleName || "N/A"}
            </Col>
            <Col span={12}>
              <Text strong>Preferred Name:</Text>{" "}
              {profileData.preferredName || "N/A"}
            </Col>
            <Col span={12}>
              <Text strong>Email:</Text> {profileData.email}
            </Col>
            <Col span={12}>
              <Text strong>SSN:</Text>{" "}
              {profileData.ssn
                ? profileData.ssn.replace(/^\d{3}-\d{2}/, "XXX-XX")
                : "N/A"}
            </Col>
            <Col span={12}>
              <Text strong>Date of Birth:</Text>{" "}
              {formatDate(profileData.dateOfBirth)}
            </Col>
            <Col span={12}>
              <Text strong>Gender:</Text>{" "}
              {profileData.gender === "male"
                ? "Male"
                : profileData.gender === "female"
                ? "Female"
                : "Prefer not to say"}
            </Col>
          </Row>
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            middleName: profileData.middleName,
            preferredName: profileData.preferredName,
            ssn: profileData.ssn,
            dateOfBirth: profileData.dateOfBirth
              ? dayjs(profileData.dateOfBirth)
              : null,
            gender: profileData.gender,
          }}
        >
          <Row gutter={[16, 16]} align="middle" justify="center">
            <Col span={24} style={{ textAlign: "center" }}>
              <Avatar
                size={100}
                src={profileData.profilePicture}
                icon={<UserOutlined />}
              />
              <div style={{ marginTop: 16 }}>
                <Upload
                  listType="picture"
                  maxCount={1}
                  fileList={fileList}
                  onChange={handleFileChange}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>
                    Upload Profile Picture
                  </Button>
                </Upload>
              </div>
            </Col>
          </Row>

          <Divider />

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[
                  { required: true, message: "Please enter your first name" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[
                  { required: true, message: "Please enter your last name" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="middleName" label="Middle Name">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="preferredName" label="Preferred Name">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Email">
                <Input disabled value={profileData.email} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="ssn"
                label="Social Security Number"
                rules={[{ required: true, message: "Please enter your SSN" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="dateOfBirth"
                label="Date of Birth"
                rules={[
                  {
                    required: true,
                    message: "Please select your date of birth",
                  },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[
                  { required: true, message: "Please select your gender" },
                ]}
              >
                <Radio.Group>
                  <Radio value="male">Male</Radio>
                  <Radio value="female">Female</Radio>
                  <Radio value="do_not_wish_to_answer">
                    I do not wish to answer
                  </Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}

      {/* Discard Changes Modal */}
      <Modal
        title="Discard Changes"
        visible={confirmModalVisible}
        onOk={handleDiscard}
        onCancel={handleContinueEditing}
        okText="Yes, Discard"
        cancelText="No, Continue Editing"
      >
        <p>Are you sure you want to discard all changes?</p>
      </Modal>
    </Card>
  );
};

export default Profile;
