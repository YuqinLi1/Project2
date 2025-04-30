import React, { useState } from 'react';
import { Container, Menu } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjust the path if needed
import LoginBox from './LoginBox';

const Login = () => {
  const navigate = useNavigate();
  const { login, error, clearError } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setLocalError('Error, please check username and password');
      return;
    }

    // Clear previous errors
    setLocalError('');
    clearError();

    const success = await login({ username, password });

    if (success) {
      navigate('/employee'); // Change this if your dashboard is /employee/dashboard
    } else {
      setLocalError('Login failed. Please check your credentials.');
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
          errorMessage={localError || error}
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