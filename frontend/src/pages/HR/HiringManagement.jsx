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
} from "semantic-ui-react";
import axios from "axios";
import {
  addRegistrationToken,
  setPendingApplications,
  setRejectedApplications,
  setApprovedApplications,
  setSelectedApplication,
  setFeedbackText,
  approveApplication,
  rejectApplication,
  setRegistrationTokens,
} from "../../slices/hiringSlice";

const HiringManagement = () => {
  const dispatch = useDispatch();
  const {
    registrationTokens,
    pendingApplications,
    rejectedApplications,
    approvedApplications,
    selectedApplication,
    feedbackText,
  } = useSelector((state) => state.hiring);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch registration tokens and applications on component mount
  useEffect(() => {
    fetchRegistrationTokens();
    fetchPendingApplications();
    fetchRejectedApplications();
    fetchApprovedApplications();
  }, []);

  const fetchRegistrationTokens = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/hr/registration-tokens",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // No need to dispatch an action as registrationTokens are added one by one
        dispatch(setRegistrationTokens(response.data.data));
      }
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error fetching registration tokens"
      );
      setLoading(false);
    }
  };

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
        dispatch(setPendingApplications(response.data.data));
      }
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error fetching pending applications"
      );
      setLoading(false);
    }
  };

  const fetchRejectedApplications = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/hr/onboarding/rejected",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        dispatch(setRejectedApplications(response.data.data));
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Error fetching rejected applications"
      );
    }
  };

  const fetchApprovedApplications = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/hr/onboarding/approved",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        dispatch(setApprovedApplications(response.data.data));
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Error fetching approved applications"
      );
    }
  };

  const handleSyncApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/hr/sync-applications",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(`${response.data.message}. Refreshing data...`);

      // Refresh application lists
      await fetchPendingApplications();
      await fetchRejectedApplications();
      await fetchApprovedApplications();

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error syncing applications");
      setLoading(false);
    }
  };

  const handleGenerateToken = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/hr/registration-token",
        { email, name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        dispatch(
          addRegistrationToken({
            email: response.data.data.email,
            name: response.data.data.name,
            token: response.data.data.token,
            expiresAt: response.data.data.expiresAt,
            status: "sent",
            createdAt: new Date().toISOString(),
          })
        );

        setSuccess("Registration token generated and email sent successfully");
        setEmail("");
        setName("");
      }

      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error generating registration token"
      );
      setLoading(false);
    }
  };

  const handleViewApplication = (application) => {
    dispatch(setSelectedApplication(application));
    setIsApplicationModalOpen(true);
  };

  const handleApproveApplication = async () => {
    if (!selectedApplication) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:5000/api/hr/onboarding/${selectedApplication._id}`,
        { status: "approved" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        dispatch(approveApplication(selectedApplication._id));
        setSuccess("Application approved successfully");
        setIsApplicationModalOpen(false);
      }

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error approving application");
      setLoading(false);
    }
  };

  const handleRejectApplication = async () => {
    if (!selectedApplication) return;

    if (!feedbackText) {
      setError("Feedback is required for rejection");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:5000/api/hr/onboarding/${selectedApplication._id}`,
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
        dispatch(
          rejectApplication({
            id: selectedApplication._id,
            feedback: feedbackText,
          })
        );

        setSuccess("Application rejected successfully");
        setIsApplicationModalOpen(false);
        dispatch(setFeedbackText(""));
      }

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error rejecting application");
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

  const panes = [
    {
      menuItem: "Registration Token",
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

          <Form>
            <Form.Field>
              <label>Email *</label>
              <Input
                placeholder="Employee's Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Field>
            <Form.Field>
              <label>Name (Optional)</label>
              <Input
                placeholder="Employee's Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Field>
            <Button
              primary
              onClick={handleGenerateToken}
              loading={loading}
              disabled={loading || !email}
            >
              Generate Token and Send Email
            </Button>
          </Form>

          <Header as="h3" style={{ marginTop: "30px" }}>
            Registration History
          </Header>

          {registrationTokens.length === 0 ? (
            <Message info>
              <Message.Header>No registration tokens</Message.Header>
              <p>No registration tokens have been generated yet.</p>
            </Message>
          ) : (
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Email</Table.HeaderCell>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Token</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Created At</Table.HeaderCell>
                  <Table.HeaderCell>Expires At</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {registrationTokens.map((record, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{record.email}</Table.Cell>
                    <Table.Cell>{record.name || "N/A"}</Table.Cell>
                    <Table.Cell>{record.token}</Table.Cell>
                    <Table.Cell>{record.status}</Table.Cell>
                    <Table.Cell>
                      {new Date(record.createdAt).toLocaleString()}
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(record.expiresAt).toLocaleString()}
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

          <Button
            primary
            onClick={handleSyncApplications}
            style={{ marginBottom: "15px" }}
          >
            Sync Applications
          </Button>

          {pendingApplications.length === 0 ? (
            <Message info>
              <Message.Header>No pending applications</Message.Header>
              <p>There are no pending applications at this time.</p>
            </Message>
          ) : (
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Full Name</Table.HeaderCell>
                  <Table.HeaderCell>Email</Table.HeaderCell>
                  <Table.HeaderCell>Submitted Date</Table.HeaderCell>
                  <Table.HeaderCell>Action</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {pendingApplications.map((application) => (
                  <Table.Row key={application._id}>
                    <Table.Cell>
                      {application.employeeId
                        ? `${application.employeeId.firstName} ${application.employeeId.lastName}`
                        : "N/A"}
                    </Table.Cell>
                    <Table.Cell>
                      {application.employeeId
                        ? application.employeeId.email
                        : "N/A"}
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(application.createdAt).toLocaleString()}
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        primary
                        onClick={() => handleViewApplication(application)}
                      >
                        View Application
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
      menuItem: "Rejected Applications",
      render: () => (
        <Tab.Pane loading={loading}>
          {rejectedApplications.length === 0 ? (
            <Message info>
              <Message.Header>No rejected applications</Message.Header>
              <p>There are no rejected applications at this time.</p>
            </Message>
          ) : (
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Full Name</Table.HeaderCell>
                  <Table.HeaderCell>Email</Table.HeaderCell>
                  <Table.HeaderCell>Rejection Reason</Table.HeaderCell>
                  <Table.HeaderCell>Rejected Date</Table.HeaderCell>
                  <Table.HeaderCell>Action</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {rejectedApplications.map((application) => (
                  <Table.Row key={application._id}>
                    <Table.Cell>
                      {application.employeeId
                        ? `${application.employeeId.firstName} ${application.employeeId.lastName}`
                        : "N/A"}
                    </Table.Cell>
                    <Table.Cell>
                      {application.employeeId
                        ? application.employeeId.email
                        : "N/A"}
                    </Table.Cell>
                    <Table.Cell>
                      {application.feedback || "No feedback provided"}
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(application.updatedAt).toLocaleString()}
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        onClick={() => handleViewApplication(application)}
                      >
                        View Application
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
      menuItem: "Approved Applications",
      render: () => (
        <Tab.Pane loading={loading}>
          {approvedApplications.length === 0 ? (
            <Message info>
              <Message.Header>No approved applications</Message.Header>
              <p>There are no approved applications at this time.</p>
            </Message>
          ) : (
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Full Name</Table.HeaderCell>
                  <Table.HeaderCell>Email</Table.HeaderCell>
                  <Table.HeaderCell>Approved Date</Table.HeaderCell>
                  <Table.HeaderCell>Action</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {approvedApplications.map((application) => (
                  <Table.Row key={application._id}>
                    <Table.Cell>
                      {application.employeeId
                        ? `${application.employeeId.firstName} ${application.employeeId.lastName}`
                        : "N/A"}
                    </Table.Cell>
                    <Table.Cell>
                      {application.employeeId
                        ? application.employeeId.email
                        : "N/A"}
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(application.updatedAt).toLocaleString()}
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        onClick={() => handleViewApplication(application)}
                      >
                        View Application
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
  ];

  return (
    <Container>
      <Header as="h1">Hiring Management</Header>
      <Tab panes={panes} />

      <Modal
        open={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        size="large"
      >
        <Modal.Header>
          Application Review
          {selectedApplication && selectedApplication.employeeId && (
            <>
              : {selectedApplication.employeeId.firstName}{" "}
              {selectedApplication.employeeId.lastName}
            </>
          )}
        </Modal.Header>
        <Modal.Content>
          {loading && <Loader active>Loading application details</Loader>}

          {error && (
            <Message negative onDismiss={() => setError(null)}>
              <Message.Header>Error</Message.Header>
              <p>{error}</p>
            </Message>
          )}

          {selectedApplication && selectedApplication.employeeId && (
            <>
              <Table definition>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell width={4}>Full Name</Table.Cell>
                    <Table.Cell>
                      {selectedApplication.employeeId.firstName}{" "}
                      {selectedApplication.employeeId.lastName}
                      {selectedApplication.employeeId.middleName &&
                        ` ${selectedApplication.employeeId.middleName}`}
                      {selectedApplication.employeeId.preferredName &&
                        ` (${selectedApplication.employeeId.preferredName})`}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Email</Table.Cell>
                    <Table.Cell>
                      {selectedApplication.employeeId.email || "N/A"}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>SSN</Table.Cell>
                    <Table.Cell>
                      {selectedApplication.employeeId.ssn || "N/A"}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Date of Birth</Table.Cell>
                    <Table.Cell>
                      {selectedApplication.employeeId.dateOfBirth
                        ? new Date(
                            selectedApplication.employeeId.dateOfBirth
                          ).toLocaleDateString()
                        : "N/A"}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Gender</Table.Cell>
                    <Table.Cell>
                      {selectedApplication.employeeId.gender || "N/A"}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Cell Phone</Table.Cell>
                    <Table.Cell>
                      {selectedApplication.employeeId.contactInfo?.cellPhone ||
                        "N/A"}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Work Phone</Table.Cell>
                    <Table.Cell>
                      {selectedApplication.employeeId.contactInfo?.workPhone ||
                        "N/A"}
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>

              <Header as="h3">Address</Header>
              <p>
                {selectedApplication.employeeId.currentAddress
                  ? `${
                      selectedApplication.employeeId.currentAddress.building ||
                      ""
                    } 
           ${selectedApplication.employeeId.currentAddress.street || ""}, 
           ${selectedApplication.employeeId.currentAddress.city || ""}, 
           ${selectedApplication.employeeId.currentAddress.state || ""} 
           ${selectedApplication.employeeId.currentAddress.zip || ""}`
                  : "Address not provided"}
              </p>

              <Header as="h3">Work Authorization</Header>
              <p>
                <strong>Permanent Resident or Citizen: </strong>
                {selectedApplication.employeeId.isPermanentResident
                  ? "Yes"
                  : "No"}
              </p>

              {selectedApplication.employeeId.isPermanentResident ? (
                <p>
                  <strong>Type: </strong>
                  {selectedApplication.employeeId.residencyType || "N/A"}
                </p>
              ) : (
                <>
                  <p>
                    <strong>Visa Type: </strong>
                    {selectedApplication.employeeId.visaType || "N/A"}
                  </p>
                  <p>
                    <strong>Start Date: </strong>
                    {selectedApplication.employeeId.startDate
                      ? new Date(
                          selectedApplication.employeeId.startDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>
                    <strong>End Date: </strong>
                    {selectedApplication.employeeId.endDate
                      ? new Date(
                          selectedApplication.employeeId.endDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </>
              )}
            </>
          )}
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={() => setIsApplicationModalOpen(false)}>
            Close
          </Button>
          {selectedApplication && selectedApplication.status === "pending" && (
            <>
              <Button
                negative
                onClick={handleRejectApplication}
                disabled={!feedbackText}
                loading={loading}
              >
                Reject
              </Button>
              <Button
                positive
                onClick={handleApproveApplication}
                loading={loading}
              >
                Approve
              </Button>
            </>
          )}
        </Modal.Actions>
      </Modal>
    </Container>
  );
};

export default HiringManagement;
