import React, { useEffect, useState } from 'react';
import {
  Container, Header, Segment, List, Message, Button, Form
} from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setVisaState, setVisaMessage } from '../slices/visaSlice';
import Navigator from '../component/Navigator';
import { jwtDecode } from 'jwt-decode';
import DocumentUpload from '../component/DocumentUpload';

const documentTypes = [
  'OPT Receipt',
  'OPT EAD',
  'I-983',
  'I-20'
];

const Management = () => {
  const dispatch = useDispatch();
  const { currentState, message } = useSelector(state => state.visa);
  const [employeeId, setEmployeeId] = useState(null);
  const [documentMap, setDocumentMap] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const decoded = jwtDecode(token);

    axios.get(`http://localhost:5000/api/employee/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const employee = res.data.data;
      if (employee.visaType !== 'F1(CPT/OPT)') {
        dispatch(setVisaState('unauthorized'));
        return;
      }
      setEmployeeId(employee._id);
      fetchDocuments(employee._id);
    }).catch(err => {
      console.error('Error fetching employee', err);
    });
  }, [dispatch]);

  const fetchDocuments = async (employeeId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `http://localhost:5000/api/visa-status/employee/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const docs = res.data.data;
      const map = {};
      docs.forEach(doc => {
        map[doc.type] = doc;
      });
      setDocumentMap(map);
      resolveStatus(map);
    } catch (err) {
      console.error("Error loading visa documents", err);
    }
  };

  const resolveStatus = (map) => {
    const receipt = map['OPT Receipt'];
    const ead = map['OPT EAD'];
    const i983 = map['I-983'];
    const i20 = map['I-20'];

    if (receipt && receipt.status === 'pending') return dispatch(setVisaState('RecepitPending'));
    if (receipt && receipt.status === 'approved' && !ead) return dispatch(setVisaState('RecepitApprove'));
    if (receipt && receipt.status === 'rejected') return dispatch(setVisaState('RecepitRejected', receipt.message || ''));

    if (ead && ead.status === 'pending') return dispatch(setVisaState('EADPending'));
    if (ead && ead.status === 'approved' && !i983) return dispatch(setVisaState('EADApprove'));
    if (ead && ead.status === 'rejected') return dispatch(setVisaState('EADRejected', ead.message || ''));

    if (i983 && i983.status === 'pending') return dispatch(setVisaState('I983Pending'));
    if (i983 && i983.status === 'approved' && !i20) return dispatch(setVisaState('I983Approve'));
    if (i983 && i983.status === 'rejected') return dispatch(setVisaState('I983Rejected', i983.message || ''));

    if (i20 && i20.status === 'pending') return dispatch(setVisaState('I20Pending'));
    if (i20 && i20.status === 'approved') return dispatch(setVisaState('I20Approve'));
    if (i20 && i20.status === 'rejected') return dispatch(setVisaState('I20Rejected', i20.message || ''));
  };

  const renderMessage = (docType) => {
    switch (currentState) {
      case 'RecepitPending':
        return docType === 'OPT Receipt' ? <Message info content="Waiting for HR to approve your OPT Receipt" /> : null;
      case 'RecepitApprove':
        return docType === 'OPT EAD' ? <Message info content="Please upload a copy of your OPT EAD" /> : null;
      case 'RecepitRejected':
        return docType === 'OPT Receipt' ? <Message negative content={message} /> : null;
      case 'EADPending':
        return docType === 'OPT EAD' ? <Message info content="Waiting for HR to approve your OPT EAD" /> : null;
      case 'EADApprove':
        return docType === 'I-983' ? <Message info content="Please download and fill out the I-983 form" /> : null;
      case 'EADRejected':
        return docType === 'OPT EAD' ? <Message negative content={message} /> : null;
      case 'I983Pending':
        return docType === 'I-983' ? <Message info content="Waiting for HR to approve and sign your I-983" /> : null;
      case 'I983Approve':
        return docType === 'I-20' ? <Message info content="Please send the I-983 to your school and upload the new I-20" /> : null;
      case 'I983Rejected':
        return docType === 'I-983' ? <Message negative content={message} /> : null;
      case 'I20Pending':
        return docType === 'I-20' ? <Message info content="Waiting for HR to approve your I-20" /> : null;
      case 'I20Approve':
        return docType === 'I-20' ? <Message positive content="All documents have been approved" /> : null;
      case 'I20Rejected':
        return docType === 'I-20' ? <Message negative content={message} /> : null;
      default:
        return null;
    }
  };

  const isUploadEnabled = (type) => {
    const map = {
      'OPT Receipt': ['RecepitApprove', 'RecepitRejected', 'RecepitPending'],
      'OPT EAD': ['RecepitApprove', 'EADRejected'],
      'I-983': ['EADApprove', 'I983Rejected'],
      'I-20': ['I983Approve', 'I20Rejected'],
    };
    return map[type]?.includes(currentState);
  };

  return (
    <Container style={{ marginTop: '2em' }}>
      <Navigator />
      {currentState === 'unauthorized' ? (
        <Segment>
          <Message negative content="401 Unauthorized: Only F1-OPT employees can access this page." />
          <Button onClick={() => window.location.href = '/dashboard'}>Back to Dashboard</Button>
        </Segment>
      ) : (
        <Segment>
          <Header as="h3">Upload visa documents</Header>
          <List ordered>
            {documentTypes.map(doc => (
              <List.Item key={doc}>
                <strong>{doc}</strong>
                {renderMessage(doc)}
                <Form>
                  <DocumentUpload
                    employeeId={employeeId}
                    documentTitle={doc}
                    documentType={doc}
                    mode={currentState}
                    isVisa={true}
                    fileName={documentMap[doc]?.fileName}
                  />
                </Form>
              </List.Item>
            ))}
          </List>
        </Segment>
      )}
    </Container>
  );
};

export default Management;