import React, { useEffect, useState } from 'react';
import {
  Container, Header, Segment, Grid, Message, Button, Form
} from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setVisaState, setVisaMessage } from '../slices/visaSlice';
import Navigator from '../component/Navigator';
import { jwtDecode } from 'jwt-decode';
import DocumentUpload from '../component/DocumentUpload';

const documentTypes = ['OPT Receipt', 'OPT EAD', 'I-983', 'I-20'];

const Management = () => {
  const dispatch = useDispatch();
  const { currentState, message } = useSelector(state => state.visa);
  const [employeeId, setEmployeeId] = useState(null);
  const [documentMap, setDocumentMap] = useState({});
  const [uploadFiles, setUploadFiles] = useState({});

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
    if (receipt && receipt.status === 'rejected') return dispatch(setVisaState('RecepitRejected'));

    if (ead && ead.status === 'pending') return dispatch(setVisaState('EADPending'));
    if (ead && ead.status === 'approved' && !i983) return dispatch(setVisaState('EADApprove'));
    if (ead && ead.status === 'rejected') return dispatch(setVisaState('EADRejected'));

    if (i983 && i983.status === 'pending') return dispatch(setVisaState('I983Pending'));
    if (i983 && i983.status === 'approved' && !i20) return dispatch(setVisaState('I983Approve'));
    if (i983 && i983.status === 'rejected') return dispatch(setVisaState('I983Rejected'));

    if (i20 && i20.status === 'pending') return dispatch(setVisaState('I20Pending'));
    if (i20 && i20.status === 'approved') return dispatch(setVisaState('I20Approve'));
    if (i20 && i20.status === 'rejected') return dispatch(setVisaState('I20Rejected'));
  };

  const renderMessage = (docType) => {
    const feedback = documentMap[docType]?.feedback;
    const messages = {
      'RecepitPending': ['OPT Receipt', "Waiting for HR to approve your OPT Receipt"],
      'RecepitApprove': ['OPT EAD', "Please upload a copy of your OPT EAD"],
      'RecepitRejected': ['OPT Receipt', feedback],
      'EADPending': ['OPT EAD', "Waiting for HR to approve your OPT EAD"],
      'EADApprove': ['I-983', "Please download and fill out the I-983 form"],
      'EADRejected': ['OPT EAD', feedback],
      'I983Pending': ['I-983', "Waiting for HR to approve and sign your I-983"],
      'I983Approve': ['I-20', "Please send the I-983 along with all necessary documents to your school and upload the new I-20"],
      'I983Rejected': ['I-983', feedback],
      'I20Pending': ['I-20', "Waiting for HR to approve your I-20"],
      'I20Approve': ['I-20', "All documents have been approved"],
      'I20Rejected': ['I-20', feedback],
    };

    const [targetType, message] = messages[currentState] || [];
    if (targetType === docType) {
      return (
        <Message
          info={currentState.endsWith("Pending") || currentState.endsWith("Approve")}
          negative={currentState.endsWith("Rejected")}
          positive={currentState === 'I20Approve'}
          content={message}
        />
      );
    }
    return null;
  };

  const canPreview = (type) => {
    return documentMap[type]?.fileUrl;
  };

  const canUpload = (type) => {
    const stateMap = {
      'OPT Receipt': ['RecepitRejected'],
      'OPT EAD': ['RecepitApprove', 'EADRejected'],
      'I-983': ['EADApprove', 'I983Rejected'],
      'I-20': ['I983Approve', 'I20Rejected'],
    };
    return stateMap[type]?.includes(currentState);
  };

  const showSampleDownloads = () =>
    ['EADApprove', 'I983Rejected', 'I983Pending'].includes(currentState);

  const handleFileChange = (doc, file) => {
    setUploadFiles(prev => ({ ...prev, [doc]: file }));
  };

  const handleSampleDownload = async (fileName) => {
    const token = localStorage.getItem("token");
    const url = `http://localhost:5000/api/visa-status/download?employeeId=680d7a7b73e47dbd1d2cd53b&type=Sample&file=${fileName}`;
    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });
  
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const handleSubmit = async (docType) => {
    const token = localStorage.getItem("token");
    const file = uploadFiles[docType];
    if (!file || !employeeId) return;

    const formData = new FormData();
    formData.append("document", file);
    formData.append("documentType", docType);

    try {
      await axios.post("http://localhost:5000/api/visa-status/document", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      await fetchDocuments(employeeId);
      setUploadFiles(prev => ({ ...prev, [docType]: null }));
    } catch (err) {
      console.error("Upload failed", err);
    }
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
          <Grid divided="vertically">
            {documentTypes.map(doc => (
              <Grid.Row key={doc} columns={2}>
                <Grid.Column width={10}>
                  <Header as="h4">{doc}</Header>
                  {renderMessage(doc)}
                  <Form>
                    {canPreview(doc) && (
                      <>
                      <Button
                        type="button"
                        onClick={async () => {
                          const token = localStorage.getItem("token");
                          try {
                            const response = await axios.get(
                              `http://localhost:5000/api/visa-status/preview?employeeId=${employeeId}&type=${encodeURIComponent(doc)}`,
                              {
                                headers: { Authorization: `Bearer ${token}` },
                                responseType: "blob",
                              }
                            );
                            const blob = new Blob([response.data], { type: "application/pdf" }); // Fix here
                            const blobUrl = window.URL.createObjectURL(blob);
                            window.open(blobUrl, "_blank");
                          } catch (error) {
                            console.error("Preview failed", error);
                          }
                        }}
                      >
                        Preview
                      </Button>
                      <Button
                        type="button"
                        onClick={async () => {
                          const token = localStorage.getItem("token");
                          try {
                            const response = await axios.get(
                              `http://localhost:5000/api/visa-status/download?employeeId=${employeeId}&type=${encodeURIComponent(doc)}`,
                              {
                                headers: { Authorization: `Bearer ${token}` },
                                responseType: "blob",
                              }
                            );
                            const blob = new Blob([response.data]);
                            const link = document.createElement("a");
                            link.href = window.URL.createObjectURL(blob);
                            link.download = doc + ".pdf";
                            link.click();
                          } catch (error) {
                            console.error("Download failed", error);
                          }
                        }}
                      >
                        Download
                      </Button>
                      </>
                    )}
                    {canUpload(doc) && (
                      <>
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(doc, e.target.files[0])}
                          style={{ marginTop: '1em' }}
                        />
                        {uploadFiles[doc] && (
                          <Button primary style={{ marginTop: '0.5em' }} onClick={() => handleSubmit(doc)}>
                            Upload
                          </Button>
                        )}
                      </>
                    )}
                  </Form>
                </Grid.Column>

                {doc === 'I-983' && showSampleDownloads() && (
                  <Grid.Column width={6}>
                    <Header as="h5">Sample I-983 Downloads</Header>
                    <Button
                      content="sampleI-983"
                      onClick={() => handleSampleDownload("sample983.pdf")}
                    />
                    <Button
                      content="emptyI-983"
                      onClick={() => handleSampleDownload("empty983.pdf")}
                    />
                  </Grid.Column>
                )}
              </Grid.Row>
            ))}
          </Grid>
        </Segment>
      )}
    </Container>
  );
};

export default Management;