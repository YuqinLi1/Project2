import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Layout,
  Form,
  Input,
  Button,
  Card,
  Typography,
  Steps,
  Alert,
  Spin,
  Result,
  Space,
  Divider,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  GlobalOutlined,
  MailOutlined,
  CheckCircleOutlined,
  SolutionOutlined,
} from "@ant-design/icons";

// Import actions
import { register, clearErrors } from "../redux/actions/authActions";

// Import custom hooks
import useWindowSize from "../hooks/useWindowSize";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Password } = Input;

// Create a custom form hook to use instead of useForm
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

const Registration = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useParams();
  const windowSize = useWindowSize();

  // Redux state
  const { loading, error, registrationSuccess } = useSelector(
    (state) => state.auth
  );

  // Local state
  const [currentStep, setCurrentStep] = useState(0);
  const [tokenVerified, setTokenVerified] = useState(false);
  const [tokenError, setTokenError] = useState(null);
  const [tokenEmail, setTokenEmail] = useState("");

  // Use our custom form hook
  const { values, handleChange, handleSubmit, errors, setValues } =
    useCustomForm({
      initialValues: {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      validate: (values) => {
        const errors = {};

        if (!values.username) {
          errors.username = "Username is required";
        } else if (values.username.length < 3) {
          errors.username = "Username must be at least 3 characters";
        }

        if (!values.email) {
          errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(values.email)) {
          errors.email = "Email is invalid";
        }

        if (!values.password) {
          errors.password = "Password is required";
        } else if (values.password.length < 8) {
          errors.password = "Password must be at least 8 characters";
        }

        if (!values.confirmPassword) {
          errors.confirmPassword = "Please confirm your password";
        } else if (values.password !== values.confirmPassword) {
          errors.confirmPassword = "Passwords do not match";
        }

        return errors;
      },
      onSubmit: (values) => {
        handleRegister(values);
      },
    });

  // Verify token on component mount
  useEffect(() => {
    if (token) {
      // Instead of using verifyToken action, we'll simulate token verification
      // This is a placeholder implementation - you should replace it with your actual token verification logic
      const verifyTokenLocally = async () => {
        try {
          // In a real implementation, you might make an API call here
          const randomDelay = Math.random() * 1000 + 500; // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, randomDelay));

          // Simulate successful token verification
          // In practice, you would check the response from your API
          const isValid = token && token.length > 10; // Simple validation example

          if (isValid) {
            setTokenVerified(true);

            // Extract email from token or use a dummy one for example purposes
            const extractedEmail = `employee${Math.floor(
              Math.random() * 1000
            )}@company.com`;
            setTokenEmail(extractedEmail);

            setValues((prevValues) => ({
              ...prevValues,
              email: extractedEmail,
            }));
          } else {
            setTokenError("Registration token is invalid or has expired");
            setTokenVerified(false);
          }
        } catch (err) {
          setTokenError("Error verifying token. Please try again later");
          setTokenVerified(false);
        }
      };

      verifyTokenLocally();
    } else {
      setTokenError("No registration token provided");
      setTokenVerified(false);
    }

    return () => {
      dispatch(clearErrors());
    };
  }, [token, dispatch, setValues]);

  // Handle registration
  const handleRegister = (userData) => {
    dispatch(
      register({
        ...userData,
        token,
      })
    );
  };

  // Render token verification error
  if (tokenError && !tokenVerified) {
    return (
      <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
        <Content
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
        >
          <Card
            style={{
              width: "100%",
              maxWidth: 500,
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            <Result
              status="error"
              title="Registration Error"
              subTitle={tokenError}
              extra={
                <Button type="primary" onClick={() => navigate("/login")}>
                  Back to Login
                </Button>
              }
            />
          </Card>
        </Content>
      </Layout>
    );
  }

  // Render loading state while verifying token
  if (loading && !tokenVerified) {
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
              maxWidth: 500,
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <Spin size="large" />
              <Paragraph style={{ marginTop: 16 }}>
                Verifying registration token...
              </Paragraph>
            </div>
          </Card>
        </Content>
      </Layout>
    );
  }

  // Render registration success
  if (registrationSuccess) {
    return (
      <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
        <Content
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
        >
          <Card
            style={{
              width: "100%",
              maxWidth: 500,
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            <Result
              status="success"
              title="Registration Successful!"
              subTitle="Your account has been created successfully. You can now login to your account."
              extra={
                <Button type="primary" onClick={() => navigate("/login")}>
                  Proceed to Login
                </Button>
              }
            />
          </Card>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 550,
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <GlobalOutlined style={{ fontSize: 48, color: "#1890ff" }} />
            <Title level={2} style={{ marginTop: 16, marginBottom: 0 }}>
              Create Your Account
            </Title>
            <Text type="secondary">
              Complete your registration to access the Employee Portal
            </Text>
          </div>

          <Steps
            current={currentStep}
            style={{ marginBottom: 32 }}
            size={windowSize.width < 576 ? "small" : "default"}
            responsive
          >
            <Step title="Verification" icon={<SolutionOutlined />} />
            <Step title="Registration" icon={<UserOutlined />} />
            <Step title="Complete" icon={<CheckCircleOutlined />} />
          </Steps>

          {error && (
            <Alert
              message="Registration Error"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <div style={{ display: currentStep === 0 ? "block" : "none" }}>
            <Alert
              message="Token Verified Successfully"
              description="Your registration token has been verified. Please proceed to create your account."
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Button
                type="primary"
                size="large"
                onClick={() => setCurrentStep(1)}
              >
                Continue
              </Button>
            </div>
          </div>

          <div style={{ display: currentStep === 1 ? "block" : "none" }}>
            <Form
              name="registration"
              layout="vertical"
              initialValues={values}
              onFinish={handleSubmit}
            >
              <Form.Item
                name="email"
                label="Email"
                validateStatus={errors.email ? "error" : ""}
                help={errors.email}
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                  placeholder="Email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  size="large"
                  disabled={!!tokenEmail} // Disable if email is provided
                />
              </Form.Item>

              <Form.Item
                name="username"
                label="Username"
                validateStatus={errors.username ? "error" : ""}
                help={errors.username}
                rules={[
                  { required: true, message: "Please input your username!" },
                  {
                    min: 3,
                    message: "Username must be at least 3 characters!",
                  },
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
                  {
                    min: 8,
                    message: "Password must be at least 8 characters!",
                  },
                ]}
              >
                <Password
                  prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                  placeholder="Password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                validateStatus={errors.confirmPassword ? "error" : ""}
                help={errors.confirmPassword}
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Please confirm your password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Passwords do not match!")
                      );
                    },
                  }),
                ]}
              >
                <Password
                  prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  size="large"
                />
              </Form.Item>

              <Divider />

              <Form.Item style={{ marginBottom: 0 }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Button onClick={() => setCurrentStep(0)}>Back</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                  >
                    Register
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default Registration;
