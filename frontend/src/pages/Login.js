import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUsername, setPassword } from './store';
import { Container, Form, Button, Input, Menu } from 'semantic-ui-react';

const Login = () => {
    const dispatch = useDispatch();
    const { username, password } = useSelector(state => state.auth);
  
    const handleLogin = () => {
      console.log('Logging in with', username, password);
      // Add API login logic here
    };

    return (
        <Container style={{ marginTop: '2em' }}>
          {/* Navigation Bar */}
          <Menu inverted>
            <Menu.Item header>My App</Menu.Item>
          </Menu>
    
          {/* Login Form */}
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
                <label>Password</label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => dispatch(setPassword(e.target.value))}
                />
              </Form.Field>
    
              <Button primary onClick={handleLogin}>
                Login
              </Button>
            </Form>
          </div>
        </Container>
      );
    };
    
    export default Login;