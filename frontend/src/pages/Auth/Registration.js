import React, { useState, useEffect } from "react";
import { Container, Menu } from "semantic-ui-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import LoginBox from "../../component/LoginBox";

const Registration = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();
  const [token, setToken] = useState("");

  useEffect(() => {
    // Extract token from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get("token");

    if (tokenFromUrl) {
      setToken(tokenFromUrl);

      // If you want to verify the token with the backend:
      verifyToken(tokenFromUrl);
    }
  }, [location]);

  // Add function to verify token
  const verifyToken = async (tokenValue) => {
    try {
      // Make API call to verify token
      const response = await axios.post(
        "http://localhost:5000/api/token/verify",
        { token: tokenValue }
      );

      if (response.data.success) {
        // If token is valid, pre-fill the email field
        setEmail(response.data.email);
      } else {
        setError("Invalid or expired registration token");
        // Optionally navigate to login
        // navigate("/login");
      }
    } catch (err) {
      setError("Error verifying token");
    }
  };

  const handleSignup = async () => {
    if (!username || !email || !password || !email.includes("@")) {
      setError("Error, please try again later");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          username,
          email,
          password,
        }
      );
      if (response.status === 201) {
        navigate("/login");
      } else {
        setError("Error, please try again later");
      }
    } catch {
      setError("Error, please try again later");
    }
  };

  return (
    <Container style={{ marginTop: "2em" }}>
      <Menu inverted>
        <Menu.Item header>User Registration</Menu.Item>
      </Menu>

      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "5em" }}
      >
        <LoginBox
          buttonLabel="Sign Up"
          onSubmit={handleSignup}
          errorMessage={error}
          inputs={[
            {
              label: "Username",
              value: username,
              onChange: (e) => setUsername(e.target.value),
              placeholder: "Enter username",
            },
            {
              label: "Email",
              type: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              placeholder: "Enter email",

              disabled: token && email,
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
    </Container>
  );
};

export default Registration;
