import React, { useEffect, useState } from 'react';
import {
  Container, Menu, Button, Form, Grid, Header,
  Segment, Divider, Input, Modal
} from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  setInfo,
  setEditInfo,
  updateEditField,
  setMode,
  discardEdit,
} from './informationSlice';

const Information = () => {
  const dispatch = useDispatch();
  const { info, editInfo, mode } = useSelector(state => state.information);
  const isEdit = mode === 'edit';
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/information');
        if (res.data) {
          dispatch(setInfo(res.data));
        }
      } catch (err) {
        console.error('Error fetching info:', err);
      }
    };
    fetchInfo();
  }, [dispatch]);

  const handleEdit = () => {
    dispatch(setEditInfo(info));
    dispatch(setMode('edit'));
  };

  const handleSave = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/information', editInfo);
      dispatch(setInfo(res.data));
      dispatch(setMode('initial'));
    } catch (err) {
      console.error('Error saving info:', err);
    }
  };

  const confirmCancel = () => {
    dispatch(discardEdit());
    setShowCancelModal(false);
  };

  const handleChange = (field) => (e) => {
    dispatch(updateEditField({ field, value: e.target.value }));
  };

  const renderField = (label, field, type = 'text') => (
    <Form.Input
      label={label}
      type={type}
      value={isEdit ? (editInfo[field] || '') : (info[field] || '')}
      onChange={handleChange(field)}
      readOnly={!isEdit}
    />
  );

  return (
    <Container style={{ marginTop: '2em' }}>
      <Menu inverted>
        <Menu.Item header>Personal Information</Menu.Item>
      </Menu>

      <Segment>
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1em', justifyContent: 'flex-end' }}>
          {mode === 'initial' && <Button onClick={handleEdit}>Edit</Button>}
          {isEdit && (
            <>
              <Button onClick={() => setShowCancelModal(true)}>Cancel</Button>
              <Button primary onClick={handleSave}>Save</Button>
            </>
          )}
        </div>

        <Divider />

        {/* Name Section */}
        <Grid columns={4} stackable>
          <Grid.Row>
            <Grid.Column>{renderField('First Name', 'firstName')}</Grid.Column>
            <Grid.Column>{renderField('Middle Name', 'middleName')}</Grid.Column>
            <Grid.Column>{renderField('Last Name', 'lastName')}</Grid.Column>
            <Grid.Column>{renderField('Preferred Name', 'preferredName')}</Grid.Column>
          </Grid.Row>
        </Grid>

        {/* Profile Picture */}
        <Form.Field>
          <label>Upload Profile Picture</label>
          <Input type="file" disabled={!isEdit} />
        </Form.Field>

        {/* Identity Section */}
        <Grid columns={4} stackable>
          <Grid.Row>
            <Grid.Column>{renderField('SSN', 'ssn')}</Grid.Column>
            <Grid.Column>{renderField('Date of Birth', 'dob', 'date')}</Grid.Column>
            <Grid.Column>{renderField('Gender', 'gender')}</Grid.Column>
            <Grid.Column>{renderField('Email', 'email', 'email')}</Grid.Column>
          </Grid.Row>
        </Grid>

        {/* Address and Contact */}
        {renderField('Address', 'address')}
        <Grid columns={2} stackable>
          <Grid.Row>
            <Grid.Column>{renderField('Cell Phone', 'cellPhone')}</Grid.Column>
            <Grid.Column>{renderField('Work Phone', 'workPhone')}</Grid.Column>
          </Grid.Row>
        </Grid>

        <Grid columns={3} stackable>
          <Grid.Row>
            <Grid.Column>{renderField('City', 'city')}</Grid.Column>
            <Grid.Column>{renderField('State', 'state')}</Grid.Column>
            <Grid.Column>{renderField('Zip', 'zip')}</Grid.Column>
          </Grid.Row>
        </Grid>

        {/* Visa Info */}
        <Grid columns={3} stackable>
          <Grid.Row>
            <Grid.Column>{renderField('Visa Title', 'visaTitle')}</Grid.Column>
            <Grid.Column>{renderField('Start Date', 'startDate', 'date')}</Grid.Column>
            <Grid.Column>{renderField('End Date', 'endDate', 'date')}</Grid.Column>
          </Grid.Row>
        </Grid>

        {/* Emergency Contact */}
        <Header as="h4">Emergency Contact</Header>
        <Grid columns={4} stackable>
          <Grid.Row>
            <Grid.Column>{renderField('EC First Name', 'ecFirstName')}</Grid.Column>
            <Grid.Column>{renderField('EC Middle Name', 'ecMiddleName')}</Grid.Column>
            <Grid.Column>{renderField('EC Last Name', 'ecLastName')}</Grid.Column>
            <Grid.Column>{renderField('EC Phone', 'ecPhone')}</Grid.Column>
          </Grid.Row>
        </Grid>
        <Grid columns={2} stackable>
          <Grid.Row>
            <Grid.Column>{renderField('EC Email', 'ecEmail')}</Grid.Column>
            <Grid.Column>{renderField('EC Relationship', 'ecRelationship')}</Grid.Column>
          </Grid.Row>
        </Grid>

        {/* Document Upload */}
        <Header as="h4">Upload Documents</Header>
        <Form.Field>
          <Input type="file" disabled={!isEdit} />
          <p style={{ marginTop: '0.5em', color: '#888' }}>
            Drag your file to upload
          </p>
        </Form.Field>

        <Divider />
      </Segment>

      {/* Cancel Confirmation Modal */}
      <Modal open={showCancelModal} size="tiny" onClose={() => setShowCancelModal(false)}>
        <Modal.Header>Discard Changes?</Modal.Header>
        <Modal.Content>
          <p>Are you sure you want to discard all changes?</p>
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={confirmCancel}>Yes</Button>
          <Button onClick={() => setShowCancelModal(false)}>No</Button>
        </Modal.Actions>
      </Modal>
    </Container>
  );
};

export default Information;