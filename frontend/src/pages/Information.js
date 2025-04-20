import React from 'react';
import {
  Container, Menu, Button, Form, Grid, Header, Segment, Divider, Input
} from 'semantic-ui-react';

const Information = () => {
  return (
    <Container style={{ marginTop: '2em' }}>
      {/* Navigation Bar */}
      <Menu inverted>
        <Menu.Item header>Personal Information</Menu.Item>
      </Menu>

      <Segment>
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1em', justifyContent: 'flex-end' }}>
          <Button> Edit </Button>
          <Button> Cancel </Button>
          <Button primary> Save </Button>
        </div>

        <Divider />

        {/* Name Section */}
        <Grid columns={4} stackable>
          <Grid.Row>
            <Grid.Column><Form.Input label="First Name" /></Grid.Column>
            <Grid.Column><Form.Input label="Middle Name" /></Grid.Column>
            <Grid.Column><Form.Input label="Last Name" /></Grid.Column>
            <Grid.Column><Form.Input label="Preferred Name" /></Grid.Column>
          </Grid.Row>
        </Grid>

        {/* Profile Picture */}
        <Form.Field>
          <label>Upload Profile Picture</label>
          <Input type="file" />
        </Form.Field>

        {/* Identity Section */}
        <Grid columns={4} stackable>
          <Grid.Row>
            <Grid.Column><Form.Input label="SSN" /></Grid.Column>
            <Grid.Column><Form.Input label="Date of Birth" type="date" /></Grid.Column>
            <Grid.Column><Form.Input label="Gender" /></Grid.Column>
            <Grid.Column><Form.Input label="Email" type="email" /></Grid.Column>
          </Grid.Row>
        </Grid>

        {/* Address and Contact */}
        <Form.Input label="Address" />
        <Grid columns={2} stackable>
          <Grid.Row>
            <Grid.Column><Form.Input label="Cell Phone" /></Grid.Column>
            <Grid.Column><Form.Input label="Work Phone" /></Grid.Column>
          </Grid.Row>
        </Grid>

        <Grid columns={3} stackable>
          <Grid.Row>
            <Grid.Column><Form.Input label="City" /></Grid.Column>
            <Grid.Column><Form.Input label="State" /></Grid.Column>
            <Grid.Column><Form.Input label="Zip" /></Grid.Column>
          </Grid.Row>
        </Grid>

        {/* Visa Info */}
        <Grid columns={3} stackable>
          <Grid.Row>
            <Grid.Column><Form.Input label="Visa Title" /></Grid.Column>
            <Grid.Column><Form.Input label="Start Date" type="date" /></Grid.Column>
            <Grid.Column><Form.Input label="End Date" type="date" /></Grid.Column>
          </Grid.Row>
        </Grid>

        {/* Emergency Contact */}
        <Header as="h4">Emergency Contact</Header>
        <Grid columns={4} stackable>
          <Grid.Row>
            <Grid.Column><Form.Input label="First Name" /></Grid.Column>
            <Grid.Column><Form.Input label="Middle Name" /></Grid.Column>
            <Grid.Column><Form.Input label="Last Name" /></Grid.Column>
            <Grid.Column><Form.Input label="Phone" /></Grid.Column>
          </Grid.Row>
        </Grid>
        <Grid columns={2} stackable>
          <Grid.Row>
            <Grid.Column><Form.Input label="Email" /></Grid.Column>
            <Grid.Column><Form.Input label="Relationship" /></Grid.Column>
          </Grid.Row>
        </Grid>

        {/* Document Upload */}
        <Header as="h4">Upload Documents</Header>
        <Form.Field>
          <Input type="file" />
          <p style={{ marginTop: '0.5em', color: '#888' }}>
            Drag your file to upload
          </p>
        </Form.Field>

        <Divider />
      </Segment>
    </Container>
  );
};

export default Information;