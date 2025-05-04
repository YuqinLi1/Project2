import React, { useEffect, useState } from 'react';
import {
  Container, Menu, Header, Segment, List, Form, Input, Message
} from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setVisaState, setVisaMessage } from '../slices/visaSlice';
import Navigator from '../component/Navigator';

const Management = () => {
  const dispatch = useDispatch();
  const { currentState, message } = useSelector(state => state.visa);
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchVisaStatus = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/visa-progress');
        const { status, message } = res.data;
        dispatch(setVisaState(status));
        if (message) dispatch(setVisaMessage(message));
      } catch (err) {
        console.error('Error fetching visa progress:', err);
      }
    };

    fetchVisaStatus();
  }, [dispatch]);

  const isUploadingOPT = ['initial', 'reject1'].includes(currentState);
  const showPendingMessage = currentState === 'pending1';
  const showRejectMessage = currentState === 'reject1';
  const showNextInstruction = currentState === 'pass1';

  const handleUpload = async () => {
    // simulate upload
    console.log('Uploading:', file?.name);
    dispatch(setVisaState('pending1'));
    dispatch(setVisaMessage('Waiting for HR to approve your OPT Receipt'));
  };

  return (
    <Container style={{ marginTop: '2em' }}>
      <Navigator />

      <Segment>
        <Header as="h3">Upload document list:</Header>
        <List ordered>
          <List.Item>
            OPT Receipt
            {showPendingMessage && (
              <Message info size="tiny" content="Waiting for HR to approve your OPT Receipt" />
            )}
            {showRejectMessage && (
              <Message negative size="tiny" content={message} />
            )}
          </List.Item>
          <List.Item>
            EAD
            {showNextInstruction && (
              <Message info size="tiny" content="Please upload a copy of your OPT EAD" />
            )}
          </List.Item>
          <List.Item>I983</List.Item>
          <List.Item>I20</List.Item>
        </List>

        {isUploadingOPT && (
          <>
            <Header as="h4" style={{ marginTop: '2em' }}>Upload OPT Receipt</Header>
            <Form onSubmit={handleUpload}>
              <Form.Field>
                <Input type="file" onChange={(e) => setFile(e.target.files[0])} />
                <p style={{ marginTop: '0.5em', color: '#888' }}>Drag your file to upload</p>
              </Form.Field>
              <Form.Button primary content="Upload" />
            </Form>
          </>
        )}
      </Segment>
    </Container>
  );
};

export default Management;