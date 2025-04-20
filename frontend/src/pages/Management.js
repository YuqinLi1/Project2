import React from 'react';
import {
  Container,
  Menu,
  Header,
  Segment,
  List,
  Form,
  Input
} from 'semantic-ui-react';

const Management = () => {
  return (
    <Container style={{ marginTop: '2em' }}>
      {/* Navigation Bar */}
      <Menu inverted>
        <Menu.Item header>Visa Status Management</Menu.Item>
      </Menu>

      <Segment>
        {/* Upload Document List */}
        <Header as="h3">Upload document list:</Header>
        <List ordered>
          <List.Item>OPT Receipt (waiting for approval)</List.Item>
          <List.Item>EAD</List.Item>
          <List.Item>I983</List.Item>
          <List.Item>I20</List.Item>
        </List>

        {/* Upload Section */}
        <Header as="h4" style={{ marginTop: '2em' }}>Upload Documents</Header>
        <Form>
          <Form.Field>
            <Input type="file" />
            <p style={{ marginTop: '0.5em', color: '#888' }}>
              Drag your file to upload
            </p>
          </Form.Field>
        </Form>
      </Segment>
    </Container>
  );
};

export default Management;