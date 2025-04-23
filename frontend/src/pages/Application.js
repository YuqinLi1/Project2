import React, { useEffect } from 'react';
import {
  Container, Form, Grid, Segment, Input, Radio,
  Button, Menu, Header, Divider, Message
} from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  setStatus,
  setRejectReason,
  setFormData,
  updateFormField,
} from './applicationSlice';

const Application = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, rejectReason, formData } = useSelector(state => state.application);

  // Fetch application status + data on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/pending');
        const { status, rejectReason, formData } = res.data;

        dispatch(setStatus(status));
        if (rejectReason) dispatch(setRejectReason(rejectReason));
        if (formData) dispatch(setFormData(formData));

        if (status === 'Approved') {
          alert('Your application has been approved.');
          setTimeout(() => navigate('/information'), 1000);
        }
      } catch (err) {
        console.error('Error fetching application status', err);
      }
    };

    fetchStatus();
  }, [dispatch, navigate]);

  const isReadOnly = status === 'Pending';

  const handleChange = (field) => (e, data) => {
    const value = data?.value ?? e.target.value;
    dispatch(updateFormField({ field, value }));
  };

  return (
    <Container style={{ marginTop: '2em' }}>
      <Menu inverted>
        <Menu.Item header>Application Portal</Menu.Item>
      </Menu>

      <Segment>
        <Header as="h2" textAlign="center">Application Form</Header>

        {status === 'Rejected' && (
          <Message negative>
            <Message.Header>Application Rejected</Message.Header>
            <p>{rejectReason}</p>
          </Message>
        )}

        <Form>
          {/* Name and Gender */}
          <Grid columns={3} stackable>
            <Grid.Row>
              <Grid.Column>
                <Form.Input
                  label="First Name"
                  placeholder="First Name"
                  value={formData.firstName || ''}
                  onChange={handleChange('firstName')}
                  readOnly={isReadOnly}
                />
              </Grid.Column>
              <Grid.Column>
                <Form.Input
                  label="Last Name"
                  placeholder="Last Name"
                  value={formData.lastName || ''}
                  onChange={handleChange('lastName')}
                  readOnly={isReadOnly}
                />
              </Grid.Column>
              <Grid.Column>
                <Form.Input
                  label="Gender"
                  placeholder="Gender"
                  value={formData.gender || ''}
                  onChange={handleChange('gender')}
                  readOnly={isReadOnly}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>

          {/* SSN, DOB, Profile Picture */}
          <Grid columns={3} stackable>
            <Grid.Row>
              <Grid.Column>
                <Form.Input
                  label="SSN"
                  placeholder="SSN"
                  value={formData.ssn || ''}
                  onChange={handleChange('ssn')}
                  readOnly={isReadOnly}
                />
              </Grid.Column>
              <Grid.Column>
                <Form.Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dob || ''}
                  onChange={handleChange('dob')}
                  readOnly={isReadOnly}
                />
              </Grid.Column>
              <Grid.Column>
                <Form.Input
                  label="Profile Picture"
                  type="file"
                  disabled={isReadOnly}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>

          {/* Address */}
          <Form.Input
            label="Address"
            placeholder="Street Address"
            value={formData.address || ''}
            onChange={handleChange('address')}
            readOnly={isReadOnly}
          />

          {/* City, State, Zip */}
          <Grid columns={3} stackable>
            <Grid.Row>
              <Grid.Column>
                <Form.Input
                  label="City"
                  placeholder="City"
                  value={formData.city || ''}
                  onChange={handleChange('city')}
                  readOnly={isReadOnly}
                />
              </Grid.Column>
              <Grid.Column>
                <Form.Input
                  label="State"
                  placeholder="State"
                  value={formData.state || ''}
                  onChange={handleChange('state')}
                  readOnly={isReadOnly}
                />
              </Grid.Column>
              <Grid.Column>
                <Form.Input
                  label="Zip"
                  placeholder="Zip"
                  value={formData.zip || ''}
                  onChange={handleChange('zip')}
                  readOnly={isReadOnly}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>

          {/* Email and Phone */}
          <Grid columns={2} stackable>
            <Grid.Row>
              <Grid.Column>
                <Form.Input
                  label="Email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleChange('email')}
                  readOnly={isReadOnly}
                />
              </Grid.Column>
              <Grid.Column>
                <Form.Input
                  label="Phone"
                  value={formData.phone || ''}
                  onChange={handleChange('phone')}
                  readOnly={isReadOnly}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>

          {/* Citizenship */}
          <Form.Field>
            <label>Are you a permanent resident or citizen of the U.S.?</label>
            <Form.Group inline>
              <Form.Field
                control={Radio}
                label="Yes"
                name="citizenship"
                value="yes"
                checked={formData.citizenship === 'yes'}
                onChange={handleChange('citizenship')}
                disabled={isReadOnly}
              />
              <Form.Field
                control={Radio}
                label="No"
                name="citizenship"
                value="no"
                checked={formData.citizenship === 'no'}
                onChange={handleChange('citizenship')}
                disabled={isReadOnly}
              />
            </Form.Group>
          </Form.Field>

          {/* Reference */}
          <Header as="h4">Reference (Who referred you?)</Header>
          <Grid columns={4} stackable>
            <Grid.Row>
              <Grid.Column><Form.Input label="First Name" readOnly={isReadOnly} /></Grid.Column>
              <Grid.Column><Form.Input label="Middle Name" readOnly={isReadOnly} /></Grid.Column>
              <Grid.Column><Form.Input label="Last Name" readOnly={isReadOnly} /></Grid.Column>
              <Grid.Column><Form.Input label="Phone" readOnly={isReadOnly} /></Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={8}><Form.Input label="Email" readOnly={isReadOnly} /></Grid.Column>
              <Grid.Column width={8}><Form.Input label="Relationship" readOnly={isReadOnly} /></Grid.Column>
            </Grid.Row>
          </Grid>

          {/* Emergency Contact */}
          <Header as="h4">Emergency Contact</Header>
          <Form.Field>
            <Form.Checkbox label="Same as reference" disabled={isReadOnly} />
          </Form.Field>
          <Grid columns={4} stackable>
            <Grid.Row>
              <Grid.Column><Form.Input label="First Name" readOnly={isReadOnly} /></Grid.Column>
              <Grid.Column><Form.Input label="Middle Name" readOnly={isReadOnly} /></Grid.Column>
              <Grid.Column><Form.Input label="Last Name" readOnly={isReadOnly} /></Grid.Column>
              <Grid.Column><Form.Input label="Phone" readOnly={isReadOnly} /></Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={8}><Form.Input label="Email" readOnly={isReadOnly} /></Grid.Column>
              <Grid.Column width={8}><Form.Input label="Relationship" readOnly={isReadOnly} /></Grid.Column>
            </Grid.Row>
          </Grid>

          {/* File Upload Section */}
          <Header as="h4">Summary of Uploaded Files</Header>
          <ul>
            <li>1. Profile picture</li>
            <li>2. Driver’s license</li>
            <li>3. Work authorization</li>
          </ul>
          <Form.Input label="Upload Files" type="file" disabled={isReadOnly} />

          <Divider />

          <Button primary disabled={isReadOnly}>Submit</Button>
        </Form>
      </Segment>
    </Container>
  );
};

export default Application;