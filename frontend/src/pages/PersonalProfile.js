import React, { useEffect, useState } from 'react';
import {
  Container, Menu, Button, Form, Grid, Header,
  Segment, Divider, Modal, Image
} from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  setInfo,
  setEditInfo,
  updateEditField,
  setMode,
  discardEdit,
} from '../slices/personalProfileSlice.js';
import { jwtDecode } from 'jwt-decode';

const getValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => {
    if (acc === undefined || acc === null) return '';
    if (Array.isArray(acc) && !isNaN(part)) return acc[parseInt(part)];
    return acc[part];
  }, obj);
};

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

const PersonalProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const informationState = useSelector((state) => state.personalProfile);
  const info = informationState?.info;
  const editInfo = informationState?.editInfo;
  const mode = informationState?.mode ?? 'init';
  const isEdit = mode === 'edit';

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [driverLicenseFile, setDriverLicenseFile] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [workAuthFile, setWorkAuthFile] = useState(null);
  const [documentMap, setDocumentMap] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUnauthorized(true);
      return;
    }

    const decoded = jwtDecode(token);
    const userId = decoded.id;
    axios.get(`http://localhost:5000/api/employee/status/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      const status = res.data.status;
      if (status === 'never submit') {
        setUnauthorized(true);
        return;
      }

      const fetchInfo = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/employee/me', {
            headers: { Authorization: `Bearer ${token}` },
          });

          const employee = res.data.data;
          dispatch(setInfo(JSON.parse(JSON.stringify(employee))));

          const docs = await axios.get(`http://localhost:5000/api/documents/employee/${employee._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const map = {};
          docs.data.data.forEach(doc => map[doc.type] = doc);
          setDocumentMap(map);

        } catch (err) {
          console.error('Error fetching info:', err);
          setUnauthorized(true);
        }
      };

      fetchInfo();
    })
    .catch((err) => {
      console.error('Status check failed:', err);
      setUnauthorized(true);
    });
  }, [dispatch]);

  const handleEdit = () => {
    if (info) {
      const cloned = JSON.parse(JSON.stringify(info));
      dispatch(setEditInfo(cloned));
      dispatch(setMode('edit'));
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.put(
        `http://localhost:5000/api/employee/${info._id}`,
        editInfo,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch(setInfo(res.data.data));
      dispatch(setMode('init'));
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

  const renderField = (label, fieldPath, type = 'text') => {
    let value = isEdit ? getValue(editInfo, fieldPath) : getValue(info, fieldPath);
    if (type === 'date') value = formatDate(value);
    return (
      <Form.Input
        label={label}
        type={type}
        value={value || ''}
        onChange={handleChange(fieldPath)}
        readOnly={!isEdit}
      />
    );
  };

  const renderProfilePicture = () => {
    const doc = documentMap['Profile Picture'];
    if (doc && doc.fileUrl) {
      return (
        <Form.Field>
          <label>Profile Picture</label>
          <Image src={`http://localhost:5000/${doc.fileUrl}`} size="small" bordered />
        </Form.Field>
      );
    }
    return null;
  };

  const renderDocumentField = (type, label, setter) => {
    const doc = documentMap[type];
    if (!isEdit && type !== 'Profile Picture' && doc) {
      return (
        <Form.Field>
          <label>{label}</label>
          <Header as="h5">Uploaded: {doc.fileName}</Header>
          <Button size="small" onClick={() => window.open(`http://localhost:5000/api/documents/${doc._id}/preview`, '_blank')}>Preview</Button>
          <Button size="small" onClick={() => window.open(`http://localhost:5000/api/documents/${doc._id}/download`, '_blank')}>Download</Button>
        </Form.Field>
      );
    }
    return (
      <Form.Input
        label={label}
        type="file"
        onChange={(e) => setter(e.target.files[0])}
        disabled={!isEdit}
      />
    );
  };

  if (unauthorized) {
    return (
      <Container style={{ marginTop: '5em', textAlign: 'center' }}>
        <Header as="h1" color="red">401 Unauthorized</Header>
        <p>Access denied. Please ensure you have completed your onboarding and have the necessary permissions.</p>
      </Container>
    );
  }

  return (
    <Container style={{ marginTop: '2em' }}>
      <Menu inverted>
        <Menu.Item header>Personal Information</Menu.Item>
      </Menu>

      <Segment>
        <div style={{ display: 'flex', gap: '1em', justifyContent: 'flex-end' }}>
          {mode === 'init' && <Button onClick={handleEdit}>Edit</Button>}
          {isEdit && (
            <>
              <Button onClick={() => setShowCancelModal(true)}>Cancel</Button>
              <Button primary onClick={handleSave}>Save</Button>
            </>
          )}
        </div>

        <Divider />

        <Grid columns={4} stackable>
          <Grid.Row>
            <Grid.Column>{renderField('First Name', 'firstName')}</Grid.Column>
            <Grid.Column>{renderField('Middle Name', 'middleName')}</Grid.Column>
            <Grid.Column>{renderField('Last Name', 'lastName')}</Grid.Column>
            <Grid.Column>{renderField('Preferred Name', 'preferredName')}</Grid.Column>
          </Grid.Row>
        </Grid>

        {renderProfilePicture()}

        <Grid columns={4} stackable>
          <Grid.Row>
            <Grid.Column>{renderField('SSN', 'ssn')}</Grid.Column>
            <Grid.Column>{renderField('Date of Birth', 'dateOfBirth', 'date')}</Grid.Column>
            <Grid.Column>{renderField('Gender', 'gender')}</Grid.Column>
            <Grid.Column>{renderField('Email', 'email', 'email')}</Grid.Column>
          </Grid.Row>
        </Grid>

        {renderField('Address', 'currentAddress.street')}
        <Grid columns={3} stackable>
          <Grid.Row>
            <Grid.Column>{renderField('City', 'currentAddress.city')}</Grid.Column>
            <Grid.Column>{renderField('State', 'currentAddress.state')}</Grid.Column>
            <Grid.Column>{renderField('Zip', 'currentAddress.zip')}</Grid.Column>
          </Grid.Row>
        </Grid>

        <Grid columns={2} stackable>
          <Grid.Row>
            <Grid.Column>{renderField('Cell Phone', 'contactInfo.cellPhone')}</Grid.Column>
            <Grid.Column>{renderField('Work Phone', 'contactInfo.workPhone')}</Grid.Column>
          </Grid.Row>
        </Grid>

        <Grid columns={3} stackable>
          <Grid.Row>
            <Grid.Column>{renderField('Visa Type', 'visaType')}</Grid.Column>
            <Grid.Column>{renderField('Start Date', 'startDate', 'date')}</Grid.Column>
            <Grid.Column>{renderField('End Date', 'endDate', 'date')}</Grid.Column>
          </Grid.Row>
        </Grid>

        <Header as="h4">Emergency Contact</Header>
        <Grid columns={4} stackable>
          <Grid.Row>
            <Grid.Column>{renderField('EC First Name', 'emergencyContacts.0.firstName')}</Grid.Column>
            <Grid.Column>{renderField('EC Middle Name', 'emergencyContacts.0.middleName')}</Grid.Column>
            <Grid.Column>{renderField('EC Last Name', 'emergencyContacts.0.lastName')}</Grid.Column>
            <Grid.Column>{renderField('EC Phone', 'emergencyContacts.0.phone')}</Grid.Column>
          </Grid.Row>
        </Grid>
        <Grid columns={2} stackable>
          <Grid.Row>
            <Grid.Column>{renderField('EC Email', 'emergencyContacts.0.email')}</Grid.Column>
            <Grid.Column>{renderField('EC Relationship', 'emergencyContacts.0.relationship')}</Grid.Column>
          </Grid.Row>
        </Grid>

        <Header as="h4">Upload Documents</Header>
        {renderDocumentField("Driver's License", "Driver's License", setDriverLicenseFile)}
        {renderDocumentField("Work Authorization", "Work Authorization", setWorkAuthFile)}

        <Divider />
      </Segment>

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

export default PersonalProfile;