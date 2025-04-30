import React, { useEffect, useState } from 'react';
import {
  Container, Menu, Button, Form, Grid, Header,
  Segment, Divider, Input, Modal
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
} from '../slices/informationSlice.js';
import * as infoActions from '../slices/informationSlice';
console.log("setInfo ref:", infoActions.setInfo);

const getValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const Information = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const informationState = useSelector((state) => state.information);
  const info = informationState?.info;
  const editInfo = informationState?.editInfo;
  const mode = informationState?.mode ?? 'initial';
  const isEdit = mode === 'edit';

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [driverLicenseFile, setDriverLicenseFile] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [workAuthFile, setWorkAuthFile] = useState(null);
  const [documentMap, setDocumentMap] = useState({});

  useEffect(() => {
    console.log("check redux 0");
    dispatch(setInfo({ firstName: 'Debug', lastName: 'Tester' }));
  }, []);

  useEffect(() => {
    console.log("🔎 Redux selector: info =", info);
  }, [info]);

  useEffect(() => {
    console.log("🧠 Redux info updated:", info);
  }, [info]);

  useEffect(() => {
    const fetchInfo = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUnauthorized(true);
        return;
      }
  
      try {
        const res = await axios.get('http://localhost:5000/api/employee/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const employee = res.data.data;
  
        if (!employee || !['approved', 'pending', 'never submitted'].includes(employee.onboardingStatus)) {
          setUnauthorized(true);
          return;
        }
  
        // ✅ Wrap this in a setTimeout to ensure Redux update happens outside React's strict mode batch
        setTimeout(() => {
          console.log('[✓] Dispatching employee info now...');
          const safeEmployee = JSON.parse(JSON.stringify(employee));
          console.log('safeEmployee'+safeEmployee);
          dispatch(setInfo(safeEmployee));
        }, 0);
  
        // Fetch documents
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
  }, [dispatch]);

  const handleEdit = () => {
    console.info("check 1 ", info);
    if (info) {
      const cloned = JSON.parse(JSON.stringify(info));
      dispatch(setEditInfo(cloned));
      dispatch(setMode('edit'));
    } else {
      console.warn("⚠️ Cannot enter edit mode, info is missing");
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

  const renderField = (label, fieldPath, type = 'text') => (
    <Form.Input
      label={label}
      type={type}
      value={isEdit ? (getValue(editInfo, fieldPath) || '') : (getValue(info, fieldPath) || '')}
      onChange={handleChange(fieldPath)}
      readOnly={!isEdit}
    />
  );

  const renderDocumentField = (type, label, setter) => {
    const doc = documentMap[type];
    if (!isEdit && doc) {
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

  if (info === null) {
    return <div>Loading...</div>;
  }

  return (
    <Container style={{ marginTop: '2em' }}>
      <Menu inverted>
        <Menu.Item header>Personal Information</Menu.Item>
      </Menu>

      <Segment>
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

        <Grid columns={4} stackable>
          <Grid.Row>
            <Grid.Column>{renderField('First Name', 'firstName')}</Grid.Column>
            <Grid.Column>{renderField('Middle Name', 'middleName')}</Grid.Column>
            <Grid.Column>{renderField('Last Name', 'lastName')}</Grid.Column>
            <Grid.Column>{renderField('Preferred Name', 'preferredName')}</Grid.Column>
          </Grid.Row>
        </Grid>

        <Form.Field>
          {renderDocumentField('Profile Picture', 'Profile Picture', setProfilePictureFile)}
        </Form.Field>

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
            <Grid.Column>{renderField('Visa Title', 'visaTitle')}</Grid.Column>
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

export default Information;