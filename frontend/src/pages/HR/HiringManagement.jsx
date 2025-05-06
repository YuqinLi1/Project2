import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Container,
  Header,
  Tab,
  Form,
  Button,
  Input,
  Table,
  Modal,
  Message,
  Loader,
  Icon,
} from "semantic-ui-react";
import axios from "axios";
import { setFeedbackText } from "../../slices/hiringSlice";
import RegistrationTokenTab from "../../component/RegistrationToken";

const DocumentManagement = () => {
  const dispatch = useDispatch();
  const { feedbackText } = useSelector((state) => state.hiring);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [approvedDocuments, setApprovedDocuments] = useState([]);
  const [rejectedDocuments, setRejectedDocuments] = useState([]);

  useEffect(() => {
    fetchPendingDocuments();
    fetchApprovedDocuments();
    fetchRejectedDocuments();
  }, []);

  const fetchPendingDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/documents/status/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPendingDocuments(response.data.data);
      }
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error fetching pending documents"
      );
      setLoading(false);
    }
  };

  const fetchApprovedDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/documents/status/approved",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setApprovedDocuments(response.data.data);
      }
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error fetching approved documents"
      );
      setLoading(false);
    }
  };

  const fetchRejectedDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/documents/status/rejected",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setRejectedDocuments(response.data.data);
      }
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error fetching rejected documents"
      );
      setLoading(false);
    }
  };

  // Handle document approval
  const handleApproveDocument = async (documentId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:5000/api/documents/${documentId}/status`,
        { status: "approved" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Refresh documents
        await fetchPendingDocuments();
        await fetchApprovedDocuments();
        setSuccess("Document approved successfully");
      }

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error approving document");
      setLoading(false);
    }
  };

  // Handle document rejection
  const handleRejectDocument = async (documentId) => {
    if (!feedbackText) {
      setError("Feedback is required for rejection");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:5000/api/documents/${documentId}/status`,
        {
          status: "rejected",
          feedback: feedbackText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Refresh documents
        await fetchPendingDocuments();
        await fetchRejectedDocuments();
        setSuccess("Document rejected successfully");
        dispatch(setFeedbackText(""));
      }

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error rejecting document");
      setLoading(false);
    }
  };

  // Render document management tabs
  const panes = [
    {
      menuItem: "Registration Tokens",
      render: () => (
        <Tab.Pane>
          <RegistrationTokenTab />
        </Tab.Pane>
      ),
    },
    {
      menuItem: "Pending Documents",
      render: () => (
        <Tab.Pane loading={loading}>
          {error && (
            <Message negative onDismiss={() => setError(null)}>
              <Message.Header>Error</Message.Header>
              <p>{error}</p>
            </Message>
          )}

          {success && (
            <Message positive onDismiss={() => setSuccess(null)}>
              <Message.Header>Success</Message.Header>
              <p>{success}</p>
            </Message>
          )}

          {pendingDocuments.length === 0 ? (
            <Message info>
              <Message.Header>No pending documents</Message.Header>
              <p>There are no pending documents at this time.</p>
            </Message>
          ) : (
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Employee</Table.HeaderCell>
                  <Table.HeaderCell>Document Type</Table.HeaderCell>
                  <Table.HeaderCell>File Name</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {pendingDocuments.map((doc) => (
                  <Table.Row key={doc._id}>
                    <Table.Cell>
                      {doc.employeeId?.firstName && doc.employeeId?.lastName
                        ? `${doc.employeeId.firstName} ${doc.employeeId.lastName}`
                        : "N/A"}
                    </Table.Cell>
                    <Table.Cell>{doc.type}</Table.Cell>
                    <Table.Cell>{doc.fileName}</Table.Cell>
                    <Table.Cell>
                      <Button.Group size="small">
                        <Button
                          icon
                          labelPosition="left"
                          onClick={() =>
                            window.open(
                              `http://localhost:5000/api/documents/preview?employeeId=${
                                doc.employeeId._id || doc.employeeId
                              }&type=${encodeURIComponent(doc.type)}`,
                              "_blank"
                            )
                          }
                        >
                          <Icon name="eye" />
                          Preview
                        </Button>
                        <Button
                          color="green"
                          onClick={() => handleApproveDocument(doc._id)}
                        >
                          Approve
                        </Button>
                        <Button
                          color="red"
                          onClick={() => {
                            setSelectedDocument(doc);
                          }}
                        >
                          Reject
                        </Button>
                      </Button.Group>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Tab.Pane>
      ),
    },
    {
      menuItem: "Approved Documents",
      render: () => (
        <Tab.Pane loading={loading}>
          {approvedDocuments.length === 0 ? (
            <Message info>
              <Message.Header>No approved documents</Message.Header>
              <p>There are no approved documents at this time.</p>
            </Message>
          ) : (
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Employee</Table.HeaderCell>
                  <Table.HeaderCell>Document Type</Table.HeaderCell>
                  <Table.HeaderCell>File Name</Table.HeaderCell>
                  <Table.HeaderCell>Approval Date</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {approvedDocuments.map((doc) => (
                  <Table.Row key={doc._id}>
                    <Table.Cell>
                      {doc.employeeId?.firstName && doc.employeeId?.lastName
                        ? `${doc.employeeId.firstName} ${doc.employeeId.lastName}`
                        : "N/A"}
                    </Table.Cell>
                    <Table.Cell>{doc.type}</Table.Cell>
                    <Table.Cell>{doc.fileName}</Table.Cell>
                    <Table.Cell>
                      {doc.reviewedAt
                        ? new Date(doc.reviewedAt).toLocaleString()
                        : "N/A"}
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        icon
                        labelPosition="left"
                        onClick={() =>
                          window.open(
                            `http://localhost:5000/api/documents/preview?employeeId=${
                              doc.employeeId._id || doc.employeeId
                            }&type=${encodeURIComponent(doc.type)}`,
                            "_blank"
                          )
                        }
                      >
                        <Icon name="eye" />
                        Preview
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Tab.Pane>
      ),
    },
    {
      menuItem: "Rejected Documents",
      render: () => (
        <Tab.Pane loading={loading}>
          {rejectedDocuments.length === 0 ? (
            <Message info>
              <Message.Header>No rejected documents</Message.Header>
              <p>There are no rejected documents at this time.</p>
            </Message>
          ) : (
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Employee</Table.HeaderCell>
                  <Table.HeaderCell>Document Type</Table.HeaderCell>
                  <Table.HeaderCell>File Name</Table.HeaderCell>
                  <Table.HeaderCell>Rejection Date</Table.HeaderCell>
                  <Table.HeaderCell>Feedback</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {rejectedDocuments.map((doc) => (
                  <Table.Row key={doc._id}>
                    <Table.Cell>
                      {doc.employeeId?.firstName && doc.employeeId?.lastName
                        ? `${doc.employeeId.firstName} ${doc.employeeId.lastName}`
                        : "N/A"}
                    </Table.Cell>
                    <Table.Cell>{doc.type}</Table.Cell>
                    <Table.Cell>{doc.fileName}</Table.Cell>
                    <Table.Cell>
                      {doc.reviewedAt
                        ? new Date(doc.reviewedAt).toLocaleString()
                        : "N/A"}
                    </Table.Cell>
                    <Table.Cell>
                      {doc.feedback || "No feedback provided"}
                    </Table.Cell>
                    <Table.Cell>
                      <Button.Group size="small">
                        <Button
                          icon
                          labelPosition="left"
                          onClick={() =>
                            window.open(
                              `http://localhost:5000/api/documents/preview?employeeId=${
                                doc.employeeId._id || doc.employeeId
                              }&type=${encodeURIComponent(doc.type)}`,
                              "_blank"
                            )
                          }
                        >
                          <Icon name="eye" />
                          Preview
                        </Button>
                        <Button
                          color="green"
                          onClick={() => handleApproveDocument(doc._id)}
                        >
                          Approve
                        </Button>
                      </Button.Group>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Tab.Pane>
      ),
    },
  ];

  return (
    <Container>
      <Header as="h1">Hiring Management</Header>
      <Tab panes={panes} />

      {/* Rejection Feedback Modal */}
      <Modal
        open={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
        size="small"
      >
        <Modal.Header>Reject Document</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.TextArea
              label="Rejection Feedback"
              placeholder="Provide a reason for rejecting this document"
              value={feedbackText}
              onChange={(e, { value }) => dispatch(setFeedbackText(value))}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setSelectedDocument(null)}>Cancel</Button>
          <Button
            negative
            onClick={() => {
              handleRejectDocument(selectedDocument._id);
              setSelectedDocument(null);
            }}
            disabled={!feedbackText}
          >
            Confirm Rejection
          </Button>
        </Modal.Actions>
      </Modal>
    </Container>
  );
};

export default DocumentManagement;
