import React, { useState } from 'react';
import { Container, Menu } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginBox from '../../component/LoginBox';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username || !password ) {
      setError('Error, please check username and password');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });
      if (response.status === 200) {
        const decoded = JSON.parse(atob(response.data.token.split('.')[1]));
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', decoded.role); // ✅ Store role
        navigate("/dashboard");
      } else {
        setError('Error, please check username and password');
      }
    } catch {
      setError('Error, please check username and password');
    }
  };

  return (
    <Container style={{ marginTop: '2em' }}>
      <Menu style={{ backgroundColor: 'white', justifyContent: 'center' }}>
        <Menu.Item header style={{ color: 'black', fontSize: '1.5em' }}>
          User Login
        </Menu.Item>
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