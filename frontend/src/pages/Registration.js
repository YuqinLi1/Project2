import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUsername, setEmail, setPassword } from './store';
import { Container, Form, Input, Button, Menu } from 'semantic-ui-react';

const Registration = () => {
  const dispatch = useDispatch();
  const { username, email, password } = useSelector(state => state.auth);

  const handleSignup = () => {
    console.log('Registering:', { username, email, password });
    // Add registration logic here
  };

  return (
    <Container style={{ marginTop: '2em' }}>
      {/* Navigation Bar */}
      <Menu inverted>
        <Menu.Item header>My App</Menu.Item>
      </Menu>

      {/* Registration Form */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '5em'
      }}>
        <Form>
          <Form.Field>
            <label>Username</label>
            <Input
              placeholder="Enter username"
              value={username}
              onChange={(e) => dispatch(setUsername(e.target.value))}
            />
          </Form.Field>

          <Form.Field>
            <label>Email</label>
            <Input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => dispatch(setEmail(e.target.value))}
            />
          </Form.Field>

          <Form.Field>
            <label>Password</label>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => dispatch(setPassword(e.target.value))}
            />
          </Form.Field>

          <Button primary onClick={handleSignup}>
            Sign Up
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default Registration;