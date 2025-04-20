import React from 'react';
import { Container, Form, Grid, Segment, Input, Radio, Button, Menu, Header, Divider } from 'semantic-ui-react';

const Application = () => {
  return (
    <Container style={{ marginTop: '2em' }}>
      {/* Navigation Bar */}
      <Menu inverted>
        <Menu.Item header>Application Portal</Menu.Item>
      </Menu>

      <Segment>
        <Header as="h2" textAlign="center">Application Form</Header>

        <Form>
          {/* Name and Gender */}
          <Grid columns={3} stackable>
            <Grid.Row>
              <Grid.Column>
                <Form.Input label="First Name" placeholder="First Name" />
              </Grid.Column>
              <Grid.Column>
                <Form.Input label="Last Name" placeholder="Last Name" />
              </Grid.Column>
              <Grid.Column>
                <Form.Input label="Gender" placeholder="Gender" />
              </Grid.Column>
            </Grid.Row>
          </Grid>

          {/* SSN, DOB, Profile Picture */}
          <Grid columns={3} stackable>
            <Grid.Row>
              <Grid.Column>
                <Form.Input label="SSN" placeholder="SSN" />
              </Grid.Column>
              <Grid.Column>
                <Form.Input label="Date of Birth" type="date" />
              </Grid.Column>
              <Grid.Column>
                <Form.Input label="Profile Picture" type="file" />
              </Grid.Column>
            </Grid.Row>
          </Grid>

          {/* Address */}
          <Form.Input label="Address" placeholder="Street Address" />

          {/* City, State, Zip */}
          <Grid columns={3} stackable>
            <Grid.Row>
              <Grid.Column>
                <Form.Input label="City" placeholder="City" />
              </Grid.Column>
              <Grid.Column>
                <Form.Input label="State" placeholder="State" />
              </Grid.Column>
              <Grid.Column>
                <Form.Input label="Zip" placeholder="Zip" />
              </Grid.Column>
            </Grid.Row>
          </Grid>

          {/* Email and Phone */}
          <Grid columns={2} stackable>
            <Grid.Row>
              <Grid.Column>
                <Form.Input label="Email" type="email" placeholder="Email" />
              </Grid.Column>
              <Grid.Column>
                <Form.Input label="Phone" placeholder="Phone Number" />
              </Grid.Column>
            </Grid.Row>
          </Grid>

          {/* Citizenship */}
          <Form.Field>
            <label>Are you a permanent resident or citizen of the U.S.?</label>
            <Form.Group inline>
              <Form.Field control={Radio} label="Yes" name="citizenship" value="yes" />
              <Form.Field control={Radio} label="No" name="citizenship" value="no" />
            </Form.Group>
          </Form.Field>

          {/* reference */} 
          <Header as="h4">Reference (Who referred you?)</Header>
            <Grid columns={4} stackable>
            <Grid.Row>
                <Grid.Column><Form.Input label="First Name" /></Grid.Column>
                <Grid.Column><Form.Input label="Middle Name" /></Grid.Column>
                <Grid.Column><Form.Input label="Last Name" /></Grid.Column>
                <Grid.Column><Form.Input label="Phone" /></Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column width={8}><Form.Input label="Email" /></Grid.Column>
                <Grid.Column width={8}><Form.Input label="Relationship" /></Grid.Column>
            </Grid.Row>
            </Grid>

            {/* Emergency Contact */}
            <Header as="h4">Emergency Contact</Header>
            <Form.Field>
            <Form.Checkbox label="Same as reference" />
            </Form.Field>
            <Grid columns={4} stackable>
            <Grid.Row>
                <Grid.Column><Form.Input label="First Name" /></Grid.Column>
                <Grid.Column><Form.Input label="Middle Name" /></Grid.Column>
                <Grid.Column><Form.Input label="Last Name" /></Grid.Column>
                <Grid.Column><Form.Input label="Phone" /></Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column width={8}><Form.Input label="Email" /></Grid.Column>
                <Grid.Column width={8}><Form.Input label="Relationship" /></Grid.Column>
            </Grid.Row>
            </Grid>

          {/* File Upload Section */}
          <Header as="h4">Summary of Uploaded Files</Header>
          <ul>
            <li>1. Profile picture</li>
            <li>2. Driver’s license</li>
            <li>3. Work authorization</li>
          </ul>
          <Form.Input label="Upload Files" type="file" />

          <Divider />

          <Button primary>Submit</Button>
        </Form>
      </Segment>
    </Container>
  );
};

export default Application;