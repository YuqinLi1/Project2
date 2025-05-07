import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Container,
  Header,
  Tab,
  Table,
  Button,
  Modal,
  Form,
  Message,
  Icon,
  Loader,
  Segment,
  Divider,
} from "semantic-ui-react";
import axios from "axios";
import { setVisaState, setVisaMessage } from "../../slices/visaSlice";

const VisaManagement = () => {
  const dispatch = useDispatch();
  const { currentState, message } = useSelector((state) => state.visa);

  // State for employees with visa status in progress
  const [inProgressEmployees, setInProgressEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // State for document review
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  // State for loading and error handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch employees with visa in progress on component mount
  useEffect(() => {
    fetchInProgressEmployees();
    fetchAllVisaEmployees();
  }, []);

  // Fetch pending visa documents
  const fetchInProgressEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Get visa status information first
      const visaStatusResponse = await axios.get(
        "http://localhost:5000/api/visa-status/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const response = await axios.get(
        "http://localhost:5000/api/documents/status/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && visaStatusResponse.data.success) {
        // Create visa status map for quick lookup
        const visaStatusMap = {};
        visaStatusResponse.data.data.forEach((status) => {
          visaStatusMap[status.employeeId._id] = status;
        });

        // Enhance document data with visa status information
        const enhancedData = response.data.data.map((doc) => {
          const employeeId = doc.employeeId._id;
          const visaStatus = visaStatusMap[employeeId];

          return {
            ...doc,
            visaType: visaStatus?.visaType || "N/A",
            startDate: visaStatus?.startDate || null,
            endDate: visaStatus?.endDate || null,
            currentStep: visaStatus?.currentStep || "N/A",
          };
        });

        setInProgressEmployees(enhancedData);
      }

      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error fetching employees with visa in progress"
      );
      setLoading(false);
    }
  };

  // Fetch all documents (or potentially separate calls for each status)
  const fetchAllVisaEmployees = async () => {
    try {
      const token = localStorage.getItem("token");

      // Get visa status information first
      const visaStatusResponse = await axios.get(
        "http://localhost:5000/api/visa-status/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Then get documents by status
      const pendingResponse = await axios.get(
        "http://localhost:5000/api/documents/status/pending",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const approvedResponse = await axios.get(
        "http://localhost:5000/api/documents/status/approved",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const rejectedResponse = await axios.get(
        "http://localhost:5000/api/documents/status/rejected",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Combine all documents
      if (
        pendingResponse.data.success &&
        approvedResponse.data.success &&
        rejectedResponse.data.success &&
        visaStatusResponse.data.success
      ) {
        const allDocuments = [
          ...pendingResponse.data.data,
          ...approvedResponse.data.data,
          ...rejectedResponse.data.data,
        ];

        // Create visa status map for quick lookup
        const visaStatusMap = {};
        visaStatusResponse.data.data.forEach((status) => {
          // Handle both string and object IDs
          const id = status.employeeId._id || status.employeeId;
          visaStatusMap[id] = status;

          // Also add a fallback entry with string version
          if (typeof id === "object") {
            visaStatusMap[id.toString()] = status;
          }
        });
        // Group documents by employee
        const employeeMap = {};
        allDocuments.forEach((doc) => {
          if (!employeeMap[doc.employeeId._id]) {
            // Get visa status info for this employee
            const visaStatus = visaStatusMap[doc.employeeId._id];

            employeeMap[doc.employeeId._id] = {
              employeeId: doc.employeeId,
              documents: [],
              // Add visa status fields
              visaType: visaStatus?.visaType || "N/A",
              startDate: visaStatus?.startDate || null,
              endDate: visaStatus?.endDate || null,
              currentStep: visaStatus?.currentStep || "N/A",
              isPermanentResident: visaStatus?.isPermanentResident || false,
            };
          }
          employeeMap[doc.employeeId._id].documents.push(doc);
        });

        // Convert map to array
        const employees = Object.values(employeeMap);
        setAllEmployees(employees);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Error fetching all visa documents"
      );
    }
  };

  // Approve document
  const handleApproveDocument = async () => {
    if (!selectedDocument || !selectedEmployee) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:5000/api/documents/${selectedDocument._id}/status`,
        {
          status: "approved",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccess(
          `Document approved successfully. The employee will be notified about the next step.`
        );
        setIsReviewModalOpen(false);

        // Update visa state in Redux
        const nextStepMap = {
          "OPT Receipt": "pending2",
          "OPT EAD": "pending3",
          "I-983": "pending4",
          "I-20": "pass4",
        };

        if (selectedDocument.type in nextStepMap) {
          dispatch(setVisaState(nextStepMap[selectedDocument.type]));

          // Set next step message
          const nextStepMessageMap = {
            "OPT Receipt": "Employee needs to upload OPT EAD",
            "OPT EAD": "Employee needs to fill out and upload I-983",
            "I-983": "Employee needs to upload I-20",
            "I-20": "All documents have been approved",
          };

          dispatch(setVisaMessage(nextStepMessageMap[selectedDocument.type]));
        }

        // Refresh data
        fetchInProgressEmployees();
        fetchAllVisaEmployees();
      }

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error approving document");
      setLoading(false);
    }
  };

  // Reject document
  const handleRejectDocument = async () => {
    if (!selectedDocument || !selectedEmployee) return;

    if (!feedback) {
      setError("Feedback is required when rejecting a document");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:5000/api/documents/${selectedDocument._id}/status`,
        {
          status: "rejected",
          feedback,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        setSuccess(
          `Document rejected. Feedback has been sent to the employee.`
        );
        setIsReviewModalOpen(false);

        // Update visa state in Redux
        const rejectStepMap = {
          "OPT Receipt": "reject1",
          "OPT EAD": "reject2",
          "I-983": "reject3",
          "I-20": "reject4",
        };

        if (selectedDocument.type in rejectStepMap) {
          dispatch(setVisaState(rejectStepMap[selectedDocument.type]));
          dispatch(setVisaMessage(feedback));
        }

        // Refresh data
        fetchInProgressEmployees();
        fetchAllVisaEmployees();
      }

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error rejecting document");
      setLoading(false);
    }
  };

  // Send notification to employee
  const handleSendNotification = async (employee) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:5000/api/visa-status/notify/${employee.employeeId._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccess(
          `Notification sent to ${employee.employeeId.firstName} ${employee.employeeId.lastName}`
        );
      }

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error sending notification");
      setLoading(false);
    }
  };

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [success]);

  // Calculate days remaining for visa
  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return "N/A";

    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  // Format document status with icon
  const renderDocumentStatus = (status) => {
    switch (status) {
      case "pending":
        return (
          <>
            <Icon name="clock outline" color="yellow" /> Pending
          </>
        );
      case "approved":
        return (
          <>
            <Icon name="check circle" color="green" /> Approved
          </>
        );
      case "rejected":
        return (
          <>
            <Icon name="times circle" color="red" /> Rejected
          </>
        );
      default:
        return status;
    }
  };

  // Get next step for employee
  const getNextStep = (employee) => {
    // For documents from the pending documents API
    if (!employee) return "Unknown";

    // If this is a document object (like in In Progress tab)
    if (employee.type && employee.status) {
      return `Waiting for approval of ${employee.type}`;
    }

    // For grouped employees with documents array (like in All Employees tab)
    if (employee.documents) {
      const pendingDoc = employee.documents.find(
        (doc) => doc.status === "pending"
      );

      if (pendingDoc) {
        return `Waiting for approval of ${pendingDoc.type}`;
      }

      const documentTypes = employee.documents.map((doc) => doc.type);

      if (documentTypes.includes("OPT Receipt")) {
        return "OPT Receipt is being processed";
      } else if (documentTypes.includes("OPT EAD")) {
        return "OPT EAD is being processed";
      } else if (documentTypes.includes("I-983")) {
        return "I-983 is being processed";
      } else if (documentTypes.includes("I-20")) {
        return "I-20 is being processed";
      }
    }

    // If currentStep is available from visa status
    if (employee.currentStep) {
      return `Current step: ${employee.currentStep}`;
    }

    return "No documents in process";
  };

  const panes = [
    {
      menuItem: "In Progress",
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

          {inProgressEmployees.length === 0 ? (
            <Message info>
              <Message.Header>No employees in process</Message.Header>
              <p>
                There are no employees with ongoing visa processes at this time.
              </p>
            </Message>
          ) : (
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Visa Type</Table.HeaderCell>
                  <Table.HeaderCell>Start/End Date</Table.HeaderCell>
                  <Table.HeaderCell>Days Remaining</Table.HeaderCell>
                  <Table.HeaderCell>Next Steps</Table.HeaderCell>
                  <Table.HeaderCell>Action</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {inProgressEmployees.map((employee) => (
                  <Table.Row key={employee._id}>
                    <Table.Cell>
                      {employee.employeeId
                        ? `${employee.employeeId.firstName} ${employee.employeeId.lastName}`
                        : "Unknown"}
                    </Table.Cell>
                    <Table.Cell>{employee.visaType}</Table.Cell>
                    <Table.Cell>
                      {employee.startDate
                        ? new Date(employee.startDate).toLocaleDateString()
                        : "N/A"}{" "}
                      -
                      {employee.endDate
                        ? new Date(employee.endDate).toLocaleDateString()
                        : "N/A"}
                    </Table.Cell>
                    <Table.Cell>
                      {calculateDaysRemaining(employee.endDate)}
                    </Table.Cell>
                    <Table.Cell>{getNextStep(employee)}</Table.Cell>
                    <Table.Cell>
                      {employee.documents &&
                      employee.documents.some(
                        (doc) => doc.status === "pending"
                      ) ? (
                        <div>
                          {employee.documents
                            .filter((doc) => doc.status === "pending")
                            .map((doc) => (
                              <div
                                key={doc._id}
                                style={{ marginBottom: "10px" }}
                              >
                                <Button.Group size="small">
                                  <Button
                                    primary
                                    onClick={() => {
                                      setSelectedEmployee(employee);
                                      setSelectedDocument(doc);
                                      window.open(
                                        `http://localhost:5000/api/documents/preview?employeeId=${
                                          typeof employee.employeeId ===
                                          "object"
                                            ? employee.employeeId._id
                                            : employee.employeeId
                                        }&type=${encodeURIComponent(doc.type)}`,
                                        "_blank"
                                      );
                                    }}
                                  >
                                    <Icon name="eye" /> View {doc.type}
                                  </Button>
                                  <Button.Or />
                                  <Button
                                    color="green"
                                    onClick={() => {
                                      setSelectedEmployee(employee);
                                      setSelectedDocument(doc);
                                      setIsReviewModalOpen(true);
                                    }}
                                  >
                                    <Icon name="check" /> Review
                                  </Button>
                                </Button.Group>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <Button
                          primary
                          onClick={() => handleSendNotification(employee)}
                        >
                          <Icon name="mail" /> Send Notification
                        </Button>
                      )}
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
      menuItem: "All Employees",
      render: () => (
        <Tab.Pane loading={loading}>
          {allEmployees.length === 0 ? (
            <Message info>
              <Message.Header>No visa employees</Message.Header>
              <p>There are no employees with visa information in the system.</p>
            </Message>
          ) : (
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Visa Type</Table.HeaderCell>
                  <Table.HeaderCell>Current Step</Table.HeaderCell>
                  <Table.HeaderCell>Visa Validity</Table.HeaderCell>
                  <Table.HeaderCell>Days Remaining</Table.HeaderCell>
                  <Table.HeaderCell>Documents</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {allEmployees.map((employee) => (
                  <Table.Row key={employee._id}>
                    <Table.Cell>
                      {employee.employeeId
                        ? `${employee.employeeId.firstName} ${employee.employeeId.lastName}`
                        : "Unknown"}
                    </Table.Cell>
                    <Table.Cell>{employee.visaType}</Table.Cell>
                    <Table.Cell>{employee.currentStep}</Table.Cell>
                    <Table.Cell>
                      {employee.startDate
                        ? new Date(employee.startDate).toLocaleDateString()
                        : "N/A"}{" "}
                      -
                      {employee.endDate
                        ? new Date(employee.endDate).toLocaleDateString()
                        : "N/A"}
                    </Table.Cell>
                    <Table.Cell>
                      {calculateDaysRemaining(employee.endDate)}
                    </Table.Cell>
                    <Table.Cell>
                      {employee.documents.length === 0 ? (
                        "No documents"
                      ) : (
                        <div>
                          {employee.documents.map((doc) => (
                            <div key={doc._id} style={{ marginBottom: "5px" }}>
                              <Button
                                size="mini"
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setSelectedDocument(doc);
                                  window.open(
                                    `http://localhost:5000/api/documents/preview?employeeId=${
                                      // Make sure we get the string ID, not the object
                                      typeof employee.employeeId === "object"
                                        ? employee.employeeId._id
                                        : employee.employeeId
                                    }&type=${encodeURIComponent(doc.type)}`,
                                    "_blank"
                                  );
                                }}
                                color={
                                  doc.status === "approved"
                                    ? "green"
                                    : doc.status === "rejected"
                                    ? "red"
                                    : "yellow"
                                }
                              >
                                {doc.type} ({renderDocumentStatus(doc.status)})
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
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
      <Header as="h1">Visa Status Management</Header>
      <Tab panes={panes} />

      {/* Document Preview Modal */}
      <Modal
        open={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
      >
        <Modal.Header>Document Preview</Modal.Header>
        <Modal.Content>
          {loading ? (
            <Loader active>Loading document...</Loader>
          ) : selectedDocument ? (
            <div>
              <Table definition>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell width={4}>Document Type</Table.Cell>
                    <Table.Cell>{selectedDocument.type}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>File Name</Table.Cell>
                    <Table.Cell>{selectedDocument.fileName}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Status</Table.Cell>
                    <Table.Cell>
                      {renderDocumentStatus(selectedDocument.status)}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Uploaded</Table.Cell>
                    <Table.Cell>
                      {selectedDocument.createdAt
                        ? new Date(selectedDocument.createdAt).toLocaleString()
                        : "Unknown"}
                    </Table.Cell>
                  </Table.Row>
                  {selectedDocument.feedback && (
                    <Table.Row>
                      <Table.Cell>Feedback</Table.Cell>
                      <Table.Cell>{selectedDocument.feedback}</Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>

              <Divider />

              <Segment
                placeholder
                textAlign="center"
                style={{ height: "300px" }}
              >
                <Header icon>
                  <Icon name="file outline" />
                  Document Preview
                </Header>
                <p>Preview would appear here in a production environment</p>
                <Button
                  primary
                  onClick={() =>
                    window.open(
                      `http://localhost:5000/api/documents/download?employeeId=${
                        selectedEmployee.employeeId._id ||
                        selectedEmployee.employeeId
                      }&type=${encodeURIComponent(selectedDocument.type)}`,
                      "_blank"
                    )
                  }
                >
                  <Icon name="download" /> Download Document
                </Button>
              </Segment>
            </div>
          ) : (
            <Message warning>
              <Message.Header>Document not found</Message.Header>
              <p>The selected document could not be found or loaded.</p>
            </Message>
          )}
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setIsPreviewModalOpen(false)}>Close</Button>
        </Modal.Actions>
      </Modal>

      {/* Document Review Modal */}
      <Modal
        open={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      >
        <Modal.Header>Review Document</Modal.Header>
        <Modal.Content>
          {loading ? (
            <Loader active>Loading...</Loader>
          ) : selectedEmployee && selectedDocument ? (
            <div>
              <Header as="h3">
                {selectedEmployee.employeeId.firstName}{" "}
                {selectedEmployee.employeeId.lastName} - {selectedDocument.type}
              </Header>

              <Button.Group fluid style={{ marginBottom: "20px" }}>
                <Button
                  primary
                  onClick={() =>
                    window.open(
                      `http://localhost:5000/api/documents/preview?employeeId=${
                        selectedEmployee.employeeId._id ||
                        selectedEmployee.employeeId
                      }&type=${encodeURIComponent(selectedDocument.type)}`,
                      "_blank"
                    )
                  }
                >
                  <Icon name="eye" /> Preview Document
                </Button>
                <Button
                  onClick={() =>
                    window.open(
                      `http://localhost:5000/api/documents/download?employeeId=${
                        selectedEmployee.employeeId._id ||
                        selectedEmployee.employeeId
                      }&type=${encodeURIComponent(selectedDocument.type)}`,
                      "_blank"
                    )
                  }
                >
                  <Icon name="download" /> Download
                </Button>
              </Button.Group>

              <Form>
                <Form.TextArea
                  label="Feedback (required for rejection)"
                  placeholder="Provide feedback on why the document is being rejected..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={5}
                />
              </Form>
            </div>
          ) : (
            <Message warning>
              <Message.Header>Document or employee not found</Message.Header>
              <p>The selected document or employee could not be found.</p>
            </Message>
          )}
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={() => setIsReviewModalOpen(false)}>
            <Icon name="cancel" /> Cancel
          </Button>
          <Button
            negative
            onClick={handleRejectDocument}
            disabled={!feedback}
            loading={loading}
          >
            <Icon name="times" /> Reject
          </Button>
          <Button positive onClick={handleApproveDocument} loading={loading}>
            <Icon name="check" /> Approve
          </Button>
        </Modal.Actions>
      </Modal>
    </Container>
  );
};

export default VisaManagement;
