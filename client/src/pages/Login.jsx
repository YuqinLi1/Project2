import React, { useState } from "react";
import { Container, Menu } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoginBox from "./LoginBox";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });

      const token = res.data.token;
      localStorage.setItem("token", token);

      const decoded = JSON.parse(atob(token.split('.')[1]));
      const role = decoded.role;

      if (role === "hr") {
        navigate("/hr/dashboard");
      } else {
        navigate("/employee/dashboard");
      }
    } catch (err) {
      setErrorMessage("Login failed. Please check your credentials.");
    }
  };

  const inputs = [
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
  ];

  return (
    <Container>
      <Menu secondary>
        <Menu.Item name="Login" />
      </Menu>
      <LoginBox
        inputs={inputs}
        buttonLabel="Login"
        onSubmit={handleLogin}
        errorMessage={errorMessage}
      />
    </Container>
  );
};

export default Login;