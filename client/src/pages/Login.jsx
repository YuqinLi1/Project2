import React, { useState, useEffect } from "react";
import { Container, Menu } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import LoginBox from "./LoginBox";
import { login } from "../redux/actions/authActions";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user, error, loading } = useSelector(
    (state) => state.auth
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on role
      if (user?.role === "hr") {
        navigate("/hr/dashboard");
      } else {
        navigate("/employee/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Update error message when Redux error changes
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setErrorMessage("Please enter both username and password");
      return;
    }

    try {
      // Use the Redux action to login
      const result = await dispatch(login(username, password));

      // The login action should handle redirection after success
      // This is just an additional check
      if (result && result.success) {
        const role = result.role || "employee";
        navigate(role === "hr" ? "/hr/dashboard" : "/employee/dashboard");
      }
    } catch (err) {
      setErrorMessage("Error, please check username and password");
    }
  };

  return (
    <Container style={{ marginTop: "2em" }}>
      <Menu style={{ backgroundColor: "white", justifyContent: "center" }}>
        <Menu.Item header style={{ color: "black", fontSize: "1.5em" }}>
          Employee Portal Login
        </Menu.Item>
      </Menu>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
        }}
      >
        <LoginBox
          buttonLabel={loading ? "Logging in..." : "Login"}
          onSubmit={handleLogin}
          errorMessage={errorMessage}
          inputs={[
            {
              label: "Username",
              value: username,
              onChange: (e) => setUsername(e.target.value),
              placeholder: "Enter username",
            },
            {
              label: "Password",
              type: "password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              placeholder: "Enter password",
            },
          ]}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "1em",
        }}
      >
        <a href="/hr/login">HR Portal Login</a>
      </div>
    </Container>
  );
};

export default Login;
