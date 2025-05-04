import React from 'react';
import { Form, Input, Button, Message } from 'semantic-ui-react';

const LoginBox = ({
  inputs,
  buttonLabel,
  onSubmit,
  errorMessage
}) => {
  return (
    <div style={{ backgroundColor: '#f2f2f2', padding: '2em', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
      <Form onSubmit={onSubmit}>
        {inputs.map(({ label, type = "text", value, onChange, placeholder }, index) => (
          <Form.Field key={index}>
            <label>{label}</label>
            <Input
              type={type}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
            />
          </Form.Field>
        ))}
        <Button primary type="submit">{buttonLabel}</Button>
        {errorMessage && (
          <Message negative>
            <Message.Header>{errorMessage}</Message.Header>
          </Message>
        )}
      </Form>
    </div>
  );
};

export default LoginBox;