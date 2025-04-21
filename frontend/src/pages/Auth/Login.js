import React, { useState } from 'react';
import { Container, Menu } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginBox from './LoginBox';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username || !password || !username.includes('@')) {
      setError('Error, please check username and password');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });
      if (response.status === 200) {
        navigate('/application');
      } else {
        setError('Error, please check username and password');
      }
    } catch {
      setError('Error, please check username and password');
    }
  };

  return (
    <Container style={{ marginTop: '2em' }}>
      <Menu inverted>
        <Menu.Item header>User Login</Menu.Item>
      </Menu>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5em' }}>
        <LoginBox
          buttonLabel="Login"
          onSubmit={handleLogin}
          errorMessage={error}
          inputs={[
            {
              label: 'Username',
              value: username,
              onChange: (e) => setUsername(e.target.value),
              placeholder: 'Enter username'
            },
            {
              label: 'Password',
              type: 'password',
              value: password,
              onChange: (e) => setPassword(e.target.value),
              placeholder: 'Enter password'
            }
          ]}
        />
      </div>
    </Container>
  );
};

export default Login;