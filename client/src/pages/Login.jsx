import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Layout,
  Form,
  Input,
  Button,
  Checkbox,
  Card,
  Typography,
  Divider,
  Alert,
  Row,
  Col,
  Spin,
} from "antd";
import { UserOutlined, LockOutlined, GlobalOutlined } from "@ant-design/icons";

// Import actions
import { login, clearErrors } from "../redux/actions/authActions";

// Import custom hooks - using default exports
import useAuth from "../hooks/useAuth";

const { Content } = Layout;
const { Title, Text } = Typography;

// Create a custom form hook to use if useForm is not available
const useCustomForm = (options) => {
  const [values, setValues] = useState(options.initialValues || {});
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    const validationErrors = options.validate ? options.validate(values) : {};
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0 && options.onSubmit) {
      options.onSubmit(values);
    }
  };

  return {
    values,
    setValues,
    errors,
    handleChange,
    handleSubmit,
  };
};

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get auth state from Redux
  const { isAuthenticated, user, loading, error } = useSelector(
    (state) => state.auth
  );

  // Local state for localStorage functionality
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      const item = localStorage.getItem("rememberMe");
      return item ? JSON.parse(item) : false;
    } catch (error) {
      console.log("Error reading from localStorage:", error);
      return false;
    }
  });

  const [savedUsername, setSavedUsername] = useState(() => {
    try {
      const item = localStorage.getItem("username");
      return item ? JSON.parse(item) : "";
    } catch (error) {
      console.log("Error reading from localStorage:", error);
      return "";
    }
  });

  // Use our custom form hook directly
  const { values, handleChange, handleSubmit, errors, setValues } =
    useCustomForm({
      initialValues: {
        username: savedUsername || "",
        password: "",
      },
      validate: (values) => {
        const errors = {};
        if (!values.username) errors.username = "Username is required";
        if (!values.password) errors.password = "Password is required";
        return errors;
      },
      onSubmit: (values) => {
        handleLogin(values);
      },
    });

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "hr") {
        navigate("/hr/dashboard");
      } else {
        navigate("/employee/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Clear any auth errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);

  // Save to localStorage when rememberMe or savedUsername changes
  useEffect(() => {
    localStorage.setItem("rememberMe", JSON.stringify(rememberMe));
  }, [rememberMe]);

  useEffect(() => {
    localStorage.setItem("username", JSON.stringify(savedUsername));
  }, [savedUsername]);

  // Handle login
  const handleLogin = ({ username, password }) => {
    dispatch(login(username, password));

    // Save username if remember me is checked
    if (rememberMe) {
      setSavedUsername(username);
    } else {
      setSavedUsername("");
    }
  };

  // Handle remember me checkbox
  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <GlobalOutlined style={{ fontSize: 48, color: "#1890ff" }} />
            <Title level={2} style={{ marginTop: 16, marginBottom: 0 }}>
              Employee Portal
            </Title>
            <Text type="secondary">Login to access your account</Text>
          </div>

          {error && (
            <Alert
              message="Login Failed"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Form
            name="login"
            layout="vertical"
            initialValues={{
              username: values.username,
              password: values.password,
              remember: rememberMe,
            }}
            onFinish={handleSubmit}
          >
            <Form.Item
              name="username"
              label="Username"
              validateStatus={errors.username ? "error" : ""}
              help={errors.username}
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="Username"
                name="username"
                value={values.username}
                onChange={handleChange}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              validateStatus={errors.password ? "error" : ""}
              help={errors.password}
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="Password"
                name="password"
                value={values.password}
                onChange={handleChange}
                size="large"
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox checked={rememberMe} onChange={handleRememberMeChange}>
                Remember me
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: "100%", height: 40 }}
                loading={loading}
                size="large"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Divider>Or</Divider>

          <Row gutter={16}>
            <Col span={24}>
              <Button
                style={{ width: "100%" }}
                onClick={() => navigate("/hr/login")}
              >
                HR Portal
              </Button>
            </Col>
          </Row>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <Text type="secondary">
              New employee? Contact HR for registration information.
            </Text>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default Login;
