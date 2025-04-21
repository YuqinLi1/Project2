import React, { useState } from 'react';
import { Container, Menu } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginBox from './LoginBox';

const Registration = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!username || !email || !password || !email.includes('@')) {
      setError('Error, please try again later');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password
      });
      if (response.status === 200) {
        navigate('/login');
      } else {
        setError('Error, please try again later');
      }
    } catch {
      setError('Error, please try again later');
    }
  };

  return (
    <Container style={{ marginTop: '2em' }}>
      <Menu inverted>
        <Menu.Item header>User Registration</Menu.Item>
      </Menu>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5em' }}>
        <LoginBox
          buttonLabel="Sign Up"
          onSubmit={handleSignup}
          errorMessage={error}
          inputs={[
            {
              label: 'Username',
              value: username,
              onChange: (e) => setUsername(e.target.value),
              placeholder: 'Enter username'
            },
            {
              label: 'Email',
              type: 'email',
              value: email,
              onChange: (e) => setEmail(e.target.value),
              placeholder: 'Enter email'
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

export default Registration;