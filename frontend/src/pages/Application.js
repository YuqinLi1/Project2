import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  Container, Form, Grid, Segment, Radio,
  Button, Header, Divider, Message, Dropdown
} from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  setStatus,
  setRejectReason,
  setFormData,
  updateFormField,
} from '../slices/applicationSlice.js';
import Navigator from './Navigator'; 

const genderOptions = [
  { key: 'm', text: 'Male', value: 'male' },
  { key: 'f', text: 'Female', value: 'female' },
];

const stateOptions = [
  { key: 'AL', value: 'AL', text: 'AL' },
  { key: 'AK', value: 'AK', text: 'AK' },
  { key: 'AZ', value: 'AZ', text: 'AZ' },
  { key: 'AR', value: 'AR', text: 'AR' },
  { key: 'CA', value: 'CA', text: 'CA' },
  { key: 'CO', value: 'CO', text: 'CO' },
  { key: 'CT', value: 'CT', text: 'CT' },
  { key: 'DE', value: 'DE', text: 'DE' },
  { key: 'DC', value: 'DC', text: 'DC' },
  { key: 'FL', value: 'FL', text: 'FL' },
  { key: 'GA', value: 'GA', text: 'GA' },
  { key: 'GU', value: 'GU', text: 'GU' },
  { key: 'HI', value: 'HI', text: 'HI' },
  { key: 'ID', value: 'ID', text: 'ID' },
  { key: 'IL', value: 'IL', text: 'IL' },
  { key: 'IN', value: 'IN', text: 'IN' },
  { key: 'IA', value: 'IA', text: 'IA' },
  { key: 'KS', value: 'KS', text: 'KS' },
  { key: 'KY', value: 'KY', text: 'KY' },
  { key: 'LA', value: 'LA', text: 'LA' },
  { key: 'ME', value: 'ME', text: 'ME' },
  { key: 'MD', value: 'MD', text: 'MD' },
  { key: 'MA', value: 'MA', text: 'MA' },
  { key: 'MI', value: 'MI', text: 'MI' },
  { key: 'MN', value: 'MN', text: 'MN' },
  { key: 'MS', value: 'MS', text: 'MS' },
  { key: 'MO', value: 'MO', text: 'MO' },
  { key: 'MT', value: 'MT', text: 'MT' },
  { key: 'NE', value: 'NE', text: 'NE' },
  { key: 'NV', value: 'NV', text: 'NV' },
  { key: 'NH', value: 'NH', text: 'NH' },
  { key: 'NJ', value: 'NJ', text: 'NJ' },
  { key: 'NM', value: 'NM', text: 'NM' },
  { key: 'NY', value: 'NY', text: 'NY' },
  { key: 'NC', value: 'NC', text: 'NC' },
  { key: 'ND', value: 'ND', text: 'ND' },
  { key: 'MP', value: 'MP', text: 'MP' },
  { key: 'OH', value: 'OH', text: 'OH' },
  { key: 'OK', value: 'OK', text: 'OK' },
  { key: 'OR', value: 'OR', text: 'OR' },
  { key: 'PA', value: 'PA', text: 'PA' },
  { key: 'PR', value: 'PR', text: 'PR' },
  { key: 'RI', value: 'RI', text: 'RI' },
  { key: 'SC', value: 'SC', text: 'SC' },
  { key: 'SD', value: 'SD', text: 'SD' },
  { key: 'TN', value: 'TN', text: 'TN' },
  { key: 'TX', value: 'TX', text: 'TX' },
  { key: 'UT', value: 'UT', text: 'UT' },
  { key: 'VT', value: 'VT', text: 'VT' },
  { key: 'VA', value: 'VA', text: 'VA' },
  { key: 'WA', value: 'WA', text: 'WA' },
  { key: 'WV', value: 'WV', text: 'WV' },
  { key: 'WI', value: 'WI', text: 'WI' },
  { key: 'WY', value: 'WY', text: 'WY' },
];

const visaOptions = [
  { key: 'h1b', text: 'H1-B', value: 'H1-B' },
  { key: 'l2', text: 'L2', value: 'L2' },
  { key: 'f1', text: 'F1(CPT/OPT)', value: 'F1(CPT/OPT)' },
  { key: 'h4', text: 'H4', value: 'H4' },
  { key: 'other', text: 'Other', value: 'Other' },
];

const Application = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, rejectReason, formData } = useSelector(state => state.application);

  const [unauthorized, setUnauthorized] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [driverLicenseFile, setDriverLicenseFile] = useState(null);
  const [workAuthorizationFile, setWorkAuthorizationFile] = useState(null);
  const [optReceiptFile, setOptReceiptFile] = useState(null); // only if visaType === 'F1(CPT/OPT)'
  const [documentMap, setDocumentMap] = useState({}); // holds uploaded docs by type

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUnauthorized(true);
      return;
    }
  
    const fetchEmployeeStatus = async () => {
      try {
        const decoded = jwtDecode(token);
        const userEmail = decoded.email;
  
        const res = await axios.post('http://localhost:5000/api/employee/check-status',
          { email: userEmail },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        const { status, data, documents } = res.data;
        dispatch(setStatus(status));
  
        // ✅ Alert + Redirect logic
        if (status === 'Approved') {
          alert('The application has been approved.');
          setTimeout(() => navigate('/information'), 5000);
        } else if (status === 'pending') {
          alert('The application is being reviewed.');
        } else if (status === 'rejected') {
          alert('The application is rejected, please update and resubmit.');
        }
  
        if (status === 'pending' || status === 'rejected') {
          dispatch(setFormData(data));
          const map = {};
          documents.forEach(doc => map[doc.type] = doc);
          setDocumentMap(map);
        } else {
          dispatch(setFormData({}));
        }
  
      } catch (err) {
        console.error('Error checking employee status', err);
        setUnauthorized(true);
      }
    };
  
    fetchEmployeeStatus();
  }, [dispatch, navigate]);
  
  const isReadOnly = status === 'Pending';

  const handleFileChange = (setter) => (e) => {
    setter(e.target.files[0]);
  };

  const handleChange = (field) => (e, data) => {
    const value = data?.value ?? e.target.value;
    dispatch(updateFormField({ field, value }));
  };

  const copyReferenceToEmergency = () => {
    dispatch(updateFormField({ field: 'ecFirstName', value: formData.refFirstName || '' }));
    dispatch(updateFormField({ field: 'ecMiddleName', value: formData.refMiddleName || '' }));
    dispatch(updateFormField({ field: 'ecLastName', value: formData.refLastName || '' }));
    dispatch(updateFormField({ field: 'ecPhone', value: formData.refPhone || '' }));
    dispatch(updateFormField({ field: 'ecEmail', value: formData.refEmail || '' }));
    dispatch(updateFormField({ field: 'ecRelationship', value: formData.refRelationship || '' }));
  };

  const renderDocumentField = (type, label, setter) => {
    const doc = documentMap[type];
    if ((status === 'pending' || status === 'rejected') && doc) {
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
        disabled={isReadOnly}
      />
    );
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
  
    if (!token) {
      alert('Unauthorized. Please login first.');
      return;
    }
  
    try {
      // Step 1: Create employee profile (without files)
      const employeeProfileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        preferredName: formData.preferredName,
        ssn: formData.ssn,
        dateOfBirth: formData.dob,
        gender: formData.gender,
        email: formData.email,
        currentAddress: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
        },
        contactInfo: {
          cellPhone: formData.phone,
        },
        reference: {
          firstName: formData.refFirstName,
          middleName: formData.refMiddleName,
          lastName: formData.refLastName,
          phone: formData.refPhone,
          email: formData.refEmail,
          relationship: formData.refRelationship,
        },
        emergencyContacts: [
          {
            firstName: formData.ecFirstName,
            middleName: formData.ecMiddleName,
            lastName: formData.ecLastName,
            phone: formData.ecPhone,
            email: formData.ecEmail,
            relationship: formData.ecRelationship,
          },
        ],
        isPermanentResident: formData.citizenship === 'yes',
        residencyType: formData.residencyType || null,
        onboardingStatus: "never submitted",
        visaType: formData.visaType || null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        visaTitle: formData.visaTitle || null,
      };
  
      const employeeResponse = await axios.post(
        'http://localhost:5000/api/employee',
        employeeProfileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const employeeId = employeeResponse.data.employeeId;
      console.log("Created Employee ID:", employeeId);
  
      // Step 2: Upload Documents
      const formDataUpload = new FormData();
  
      if (profilePictureFile) {
        formDataUpload.append('documents', profilePictureFile);
        formDataUpload.append('types', "Profile Picture");
      }
  
      if (driverLicenseFile) {
        formDataUpload.append('documents', driverLicenseFile);
        formDataUpload.append('types', "Driver's License");
      }
  
      if (workAuthorizationFile) {
        formDataUpload.append('documents', workAuthorizationFile);
        formDataUpload.append('types', "Work Authorization");
      }
  
      if (formData.visaType === 'F1(CPT/OPT)' && optReceiptFile) {
        formDataUpload.append('documents', optReceiptFile);
        formDataUpload.append('types', "OPT Receipt");
      }
  
      formDataUpload.append('employeeId', employeeId);
  
      await axios.post(
        'http://localhost:5000/api/documents/uploadMultiple',
        formDataUpload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      alert('Application submitted successfully!');
      navigate('/information');
  
    } catch (err) {
      console.error('Error submitting application:', err);
  
      if (err.response && err.response.data && err.response.data.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert('Something went wrong. Please try again.');
      }
    }
  };

  if (unauthorized) {
    return (
      <Container style={{ marginTop: '5em', textAlign: 'center' }}>
        <Header as="h1" color="red">401 Unauthorized</Header>
        <p>Please login first.</p>
      </Container>
    );
  }

  return (
    <Container style={{ marginTop: '2em' }}>
      <Navigator />
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
                <Form.Select
                  label="Gender"
                  options={genderOptions}
                  value={formData.gender || ''}
                  onChange={handleChange('gender')}
                  disabled={isReadOnly}
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
                type={isReadOnly ? 'text' : 'date'}
                value={formData.dob || ''}
                onChange={handleChange('dob')}
                readOnly={isReadOnly}
              />
              </Grid.Column>
              <Grid.Column>
              <Form.Field>
              <label>Profile Picture</label>
              <Segment textAlign="center">
                {/* Show image preview if available */}
                {formData.profilePictureUrl ? (
                  <img
                    src={formData.profilePictureUrl}
                    alt="Profile"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                ) : (
                  <p>Preview Not Available</p> // ✅ When no picture uploaded yet
                )}
              </Segment>
            </Form.Field>
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
                <Form.Select
                  label="State"
                  options={stateOptions}
                  value={formData.state || ''}
                  onChange={handleChange('state')}
                  disabled={isReadOnly}
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

          {/* Reference */}
          <Header as="h4">Reference (Who referred you?)</Header>
          <Grid columns={4} stackable>
            <Grid.Row>
              <Grid.Column>
                <Form.Input label="First Name" placeholder="First Name" onChange={handleChange('refFirstName')} readOnly={isReadOnly} />
              </Grid.Column>
              <Grid.Column>
                <Form.Input label="Middle Name" placeholder="Middle Name" onChange={handleChange('refMiddleName')} readOnly={isReadOnly} />
              </Grid.Column>
              <Grid.Column>
                <Form.Input label="Last Name" placeholder="Last Name" onChange={handleChange('refLastName')} readOnly={isReadOnly} />
              </Grid.Column>
              <Grid.Column>
                <Form.Input label="Phone" placeholder="Phone" onChange={handleChange('refPhone')} readOnly={isReadOnly} />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={8}>
                <Form.Input label="Email" placeholder="Email" onChange={handleChange('refEmail')} readOnly={isReadOnly} />
              </Grid.Column>
              <Grid.Column width={8}>
                <Form.Input label="Relationship" placeholder="Relationship" onChange={handleChange('refRelationship')} readOnly={isReadOnly} />
              </Grid.Column>
            </Grid.Row>
          </Grid>

          {/* Emergency Contact Section */}
          <Header as="h4">Emergency Contact</Header>

          <Form.Checkbox
            label="Same as reference"
            onChange={copyReferenceToEmergency}
            disabled={isReadOnly}
          />

          <Grid columns={4} stackable>
            <Grid.Row>
              <Grid.Column>
                <Form.Input
                  label="First Name"
                  placeholder="Emergency First Name"
                  value={formData.ecFirstName || ''}
                  onChange={handleChange('ecFirstName')}
                  readOnly={isReadOnly}
                />
              </Grid.Column>
              <Grid.Column>
                <Form.Input
                  label="Middle Name"
                  placeholder="Emergency Middle Name"
                  value={formData.ecMiddleName || ''}
                  onChange={handleChange('ecMiddleName')}
                  readOnly={isReadOnly}
                />
              </Grid.Column>
              <Grid.Column>
                <Form.Input
                  label="Last Name"
                  placeholder="Emergency Last Name"
                  value={formData.ecLastName || ''}
                  onChange={handleChange('ecLastName')}
                  readOnly={isReadOnly}
                />
              </Grid.Column>
              <Grid.Column>
                <Form.Input
                  label="Phone"
                  placeholder="Emergency Phone"
                  value={formData.ecPhone || ''}
                  onChange={handleChange('ecPhone')}
                  readOnly={isReadOnly}
                />
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column width={8}>
                <Form.Input
                  label="Email"
                  placeholder="Emergency Email"
                  value={formData.ecEmail || ''}
                  onChange={handleChange('ecEmail')}
                  readOnly={isReadOnly}
                />
              </Grid.Column>
              <Grid.Column width={8}>
                <Form.Input
                  label="Relationship"
                  placeholder="Emergency Relationship"
                  value={formData.ecRelationship || ''}
                  onChange={handleChange('ecRelationship')}
                  readOnly={isReadOnly}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>

         {/* Upload files */}
         {renderDocumentField("Profile Picture", "Profile Picture", setProfilePictureFile)}
         {renderDocumentField("Driver's License", "Driver’s License", setDriverLicenseFile)}
         {renderDocumentField("Work Authorization", "Work Authorization", setWorkAuthorizationFile)}
         {formData.visaType === 'F1(CPT/OPT)' && renderDocumentField("OPT Receipt", "OPT Receipt", setOptReceiptFile)}

          {/* Citizenship */}
          {/* Citizenship question */}
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
          {formData.citizenship === 'yes' && (
            <p style={{ marginLeft: '1em', color: 'gray' }}>
              Select your residency type (e.g., Green Card or Citizen)
            </p>
          )}
        </Form.Field>

          {/* Residency type if yes */}
          {formData.citizenship === 'yes' && (
            <Form.Select
              label="Residency Type"
              options={[
                { key: 'green_card', text: 'Green Card', value: 'Green Card' },
                { key: 'citizen', text: 'Citizen', value: 'Citizen' },
              ]}
              value={formData.residencyType || ''}
              onChange={handleChange('residencyType')}
              disabled={isReadOnly}
              required
            />
          )}

          {/* Visa Section */}
          {formData.citizenship === 'no' && (
            <>
              <Form.Select
                label="Visa Type"
                options={visaOptions}
                value={formData.visaType || ''}
                onChange={handleChange('visaType')}
                disabled={isReadOnly}
                required
              />
              <Form.Group widths="equal">
                <Form.Input
                  label="Start Date"
                  type="date"
                  value={formData.startDate || ''}
                  onChange={handleChange('startDate')}
                  disabled={isReadOnly}
                  required
                />
                <Form.Input
                  label="End Date"
                  type="date"
                  value={formData.endDate || ''}
                  onChange={handleChange('endDate')}
                  disabled={isReadOnly}
                  required
                />
              </Form.Group>
              {formData.visaType === 'Other' && (
                <Form.Input
                  label="Visa Title"
                  placeholder="Enter Visa Title"
                  value={formData.visaTitle || ''}
                  onChange={handleChange('visaTitle')}
                  disabled={isReadOnly}
                  required
                />
              )}
            </>
          )}

          <Divider />
          <Button primary onClick={handleSubmit}>Submit</Button>
        </Form>
      </Segment>
    </Container>
  );
};

export default Application;