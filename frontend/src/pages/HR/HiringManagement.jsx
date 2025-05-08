import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
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
  Label,
} from "semantic-ui-react";
import axios from "axios";
import { setFeedbackText } from "../../slices/hiringSlice";
import NavigationMenu from "../../component/NavigationMenu";
import RegistrationTokenTab from "../../component/RegistrationToken";
import EmployeeDetailsModal from "../../component/EmployeeDetailsModal";
import ApplicationRejectModal from "../../component/ApplicationRejectModal";

const visaDocumentTypes = [
  "OPT Receipt",
  "OPT EAD",
  "I-983",
  "I-20",
  "Work Authorization",
];

const DocumentManagement = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [userRole, setUserRole] = useState("hr");
  const { feedbackText } = useSelector((state) => state.hiring);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [approvedDocuments, setApprovedDocuments] = useState([]);
  const [rejectedDocuments, setRejectedDocuments] = useState([]);

  const [pendingApplications, setPendingApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationFeedback, setApplicationFeedback] = useState("");

  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    fetchPendingDocuments();
    fetchApprovedDocuments();
    fetchRejectedDocuments();
    fetchPendingApplications();
  }, []);

  const fetchPendingApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/hr/onboarding/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPendingApplications(response.data.data);
      }
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error fetching pending applications"
      );
      setLoading(false);
    }
  };

  // Handle employee approval
  const handleApproveEmployee = async (employeeId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:5000/api/hr/onboarding/${employeeId}/status`,
        {
          onboardingStatus: "approved",
          onboardingFeedback: "Application approved",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        await fetchPendingApplications();
        setSuccess("Employee approved successfully");
      }

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error approving employee");
      setLoading(false);
    }
  };

  // Handle employee rejection
  const handleRejectEmployee = async (employeeId) => {
    if (!applicationFeedback) {
      setError("Feedback is required for rejection");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:5000/api/hr/onboarding/${employeeId}/status`,
        {
          onboardingStatus: "rejected",
          onboardingFeedback: applicationFeedback,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        await fetchPendingApplications();
        setSuccess("Employee application rejected successfully");
        setApplicationFeedback("");
        setSelectedApplication(null);
      }

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error rejecting employee");
      setLoading(false);
    }
  };

  const fetchDocumentsByStatus = async (status, setDocumentsFunction) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Get visa status information with all associated documents
      const visaStatusResponse = await axios.get(
        "http://localhost:5000/api/visa-status/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Get regular documents with the specified status
      const documentResponse = await axios.get(
        `http://localhost:5000/api/documents/status/${status}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Process data if at least one request was successful
      if (visaStatusResponse.data.success) {
        // Extract visa documents with matching status from visa status records
        const visaDocuments = [];

        visaStatusResponse.data.data.forEach((visaStatus) => {
          // Check if this visa status has documents array
          if (visaStatus.documents && Array.isArray(visaStatus.documents)) {
            // Filter for documents with matching status
            const matchingDocs = visaStatus.documents.filter(
              (doc) =>
                doc.status === status && visaDocumentTypes.includes(doc.type)
            );

            // Enhance each document with visa and employee information
            matchingDocs.forEach((doc) => {
              visaDocuments.push({
                ...doc,
                _id: doc._id,
                employeeId: visaStatus.employeeId, // This contains the populated employee object
                visaStatus: {
                  _id: visaStatus._id,
                  visaType: visaStatus.visaType,
                  startDate: visaStatus.startDate,
                  endDate: visaStatus.endDate,
                  currentStep: visaStatus.currentStep,
                },
              });
            });
          }
        });

        // Combine visa documents with regular documents if available
        let allDocuments = [...visaDocuments];

        if (documentResponse.data.success) {
          // Filter regular documents to only include visa-related ones
          const regularVisaDocuments = documentResponse.data.data.filter(
            (doc) => visaDocumentTypes.includes(doc.type)
          );

          allDocuments = [...allDocuments, ...regularVisaDocuments];
        }

        // Set the documents in state
        setDocumentsFunction(allDocuments);
      } else if (documentResponse.data.success) {
        // If only regular documents were fetched successfully
        const filteredDocuments = documentResponse.data.data.filter((doc) =>
          visaDocumentTypes.includes(doc.type)
        );

        setDocumentsFunction(filteredDocuments);
      }

      setLoading(false);
    } catch (err) {
      console.error(`Error fetching ${status} documents:`, err);
      setError(
        err.response?.data?.message || `Error fetching ${status} documents`
      );
      setLoading(false);
    }
  };
  // Then call this function like:
  const fetchPendingDocuments = () =>
    fetchDocumentsByStatus("pending", setPendingDocuments);
  const fetchApprovedDocuments = () =>
    fetchDocumentsByStatus("approved", setApprovedDocuments);
  const fetchRejectedDocuments = () =>
    fetchDocumentsByStatus("rejected", setRejectedDocuments);

  // Handle document approval
  const handleApproveDocument = async (
    documentId,
    isVisaDocument = false,
    visaStatusId = null
  ) => {
    try {
      setLoading(true);

      // Find the document in your state
      const docToUpdate = [...rejectedDocuments, ...pendingDocuments].find(
        (doc) => doc._id === documentId
      );

      if (!docToUpdate) {
        setError("Document not found in state");
        setLoading(false);
        return;
      }

      // Optimistically update state (remove from current lists)
      setPendingDocuments((prev) =>
        prev.filter((doc) => doc._id !== documentId)
      );
      setRejectedDocuments((prev) =>
        prev.filter((doc) => doc._id !== documentId)
      );

      // Add to approved list with updated status
      setApprovedDocuments((prev) => [
        ...prev,
        { ...docToUpdate, status: "approved", reviewedAt: new Date() },
      ]);

      // Show success message immediately
      setSuccess("Document approved successfully");

      const token = localStorage.getItem("token");
      let endpoint = "";

      if (isVisaDocument && visaStatusId) {
        endpoint = `http://localhost:5000/api/visa-status/${visaStatusId}/document/${documentId}/status`;
      } else {
        endpoint = `http://localhost:5000/api/documents/${documentId}/status`;
      }

      // Make API call in background
      await axios.put(
        endpoint,
        { status: "approved" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Refresh data from server in the background
      fetchPendingDocuments();
      fetchApprovedDocuments();
      fetchRejectedDocuments();

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error approving document");
      setLoading(false);
    }
  };

  // Handle document rejection
  const handleRejectDocument = async (
    documentId,
    isVisaDocument = false,
    visaStatusId = null
  ) => {
    if (!feedbackText) {
      setError("Feedback is required for rejection");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      console.log("Document rejection request:", {
        documentId,
        isVisaDocument,
        visaStatusId,
      });

      let response;

      if (isVisaDocument && visaStatusId) {
        console.log("Using visa status endpoint for document rejection");
        // For documents stored in visa status
        response = await axios.put(
          `http://localhost:5000/api/visa-status/${visaStatusId}/document/${documentId}/status`,
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
      }

      if (response.data.success) {
        // Refresh documents
        await fetchPendingDocuments();
        await fetchRejectedDocuments();
        setSuccess("Document rejected successfully");
        dispatch(setFeedbackText(""));
      }

      fetchPendingDocuments();
      fetchApprovedDocuments();
      fetchRejectedDocuments();

      setLoading(false);
    } catch (err) {
      console.error(
        "Error rejecting document:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.message || "Error rejecting document");
      setLoading(false);
    }
  };

  const handleInitiateRejection = (employee) => {
    setSelectedApplication(employee);
    setApplicationFeedback("");
    setShowRejectForm(true);
  };

  const getPreviewUrl = (doc) => {
    // If it's a visa status document (has visaStatus property)
    if (doc.visaStatus) {
      return `http://localhost:5000/api/visa-status/preview?employeeId=${
        typeof doc.employeeId === "object" ? doc.employeeId._id : doc.employeeId
      }&type=${encodeURIComponent(doc.type)}`;
    }

    // Regular document
    return `http://localhost:5000/api/documents/preview?employeeId=${
      typeof doc.employeeId === "object" ? doc.employeeId._id : doc.employeeId
    }&type=${encodeURIComponent(doc.type)}`;
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
      menuItem: "Pending Applications",
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

          {pendingApplications.length === 0 ? (
            <Message info>
              <Message.Header>No pending applications</Message.Header>
              <p>There are no pending employee applications at this time.</p>
            </Message>
          ) : (
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Email</Table.HeaderCell>
                  <Table.HeaderCell>Phone</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Submission Date</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {pendingApplications.map((employee) => (
                  <Table.Row key={employee._id}>
                    <Table.Cell>
                      {employee.firstName} {employee.lastName}
                    </Table.Cell>
                    <Table.Cell>{employee.email}</Table.Cell>
                    <Table.Cell>{employee.contactInfo?.cellPhone}</Table.Cell>
                    <Table.Cell>
                      <Label color="yellow" horizontal>
                        {employee.onboardingStatus}
                      </Label>
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(employee.createdAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <Button.Group size="small">
                        <Button
                          icon
                          labelPosition="left"
                          onClick={() => {
                            setSelectedApplication(employee);
                          }}
                        >
                          <Icon name="eye" />
                          View Details
                        </Button>
                        <Button
                          color="green"
                          onClick={() => handleApproveEmployee(employee._id)}
                        >
                          Approve
                        </Button>
                        <Button
                          color="red"
                          onClick={() => {
                            setSelectedApplication(employee);
                            setApplicationFeedback("");
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
      menuItem: "Pending Visa Documents",
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
                            window.open(getPreviewUrl(doc), "_blank")
                          }
                        >
                          <Icon name="eye" />
                          Preview
                        </Button>
                        <Button
                          color="green"
                          onClick={() =>
                            handleApproveDocument(
                              doc._id,
                              !!doc.visaStatus, // true if it's a visa document
                              doc.visaStatus?._id // visa status ID if available
                            )
                          }
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
      menuItem: "Approved Visa Documents",
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
                          window.open(getPreviewUrl(doc), "_blank")
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
      menuItem: "Rejected Visa Documents",
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
                            window.open(getPreviewUrl(doc), "_blank")
                          }
                        >
                          <Icon name="eye" />
                          Preview
                        </Button>
                        <Button
                          color="green"
                          onClick={() => {
                            // Check if it's a visa document
                            const isVisaDoc =
                              !!doc.visaStatus ||
                              !!doc.visaStatusId ||
                              !!doc.uploadDate ||
                              doc.isVisaDocument === true;

                            // Get the visa status ID if it's a visa document
                            let visaStatusId = null;
                            if (isVisaDoc) {
                              visaStatusId =
                                doc.visaStatus?._id || doc.visaStatusId;
                            }

                            handleApproveDocument(
                              doc._id,
                              isVisaDoc,
                              visaStatusId
                            );
                          }}
                        >
                          <Icon name="check" />
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
      <NavigationMenu userRole={userRole} activePath={location.pathname} />
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
              handleRejectDocument(
                selectedDocument._id,
                !!selectedDocument.visaStatus,
                selectedDocument.visaStatus?._id
              );
              setSelectedDocument(null);
            }}
            disabled={!feedbackText}
          >
            Confirm Rejection
          </Button>
        </Modal.Actions>
      </Modal>
      <EmployeeDetailsModal
        employee={selectedApplication}
        isOpen={!!selectedApplication && !showRejectForm}
        onClose={() => {
          setSelectedApplication(null);
          setShowEmployeeDetails(false);
        }}
        onApprove={handleApproveEmployee}
        onReject={handleInitiateRejection}
      />

      {/* Application rejection modal */}
      <ApplicationRejectModal
        isOpen={!!selectedApplication && showRejectForm}
        onClose={() => {
          setSelectedApplication(null);
          setShowRejectForm(false);
        }}
        feedback={applicationFeedback}
        setFeedback={setApplicationFeedback}
        onReject={handleRejectEmployee}
        employeeId={selectedApplication?._id}
      />
    </Container>
  );
};

export default DocumentManagement;
