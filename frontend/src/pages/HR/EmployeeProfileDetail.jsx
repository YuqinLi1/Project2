import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  Container,
  Header,
  Segment,
  Grid,
  Image,
  List,
  Button,
  Tab,
  Icon,
  Message,
  Table,
} from "semantic-ui-react";
import axios from "axios";

const EmployeeProfileDetail = () => {
  const { id } = useParams();
  const selectedEmployee = useSelector(
    (state) => state.profiles.selectedEmployee
  );
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedEmployee && selectedEmployee._id === id) {
      setEmployee(selectedEmployee);
      fetchDocuments(id);
    } else {
      fetchEmployee(id);
    }
  }, [id, selectedEmployee]);

  const fetchEmployee = async (employeeId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/hr/employees/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setEmployee(response.data.data);
        fetchDocuments(employeeId);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Error fetching employee details"
      );
      setLoading(false);
    }
  };

  const fetchDocuments = async (employeeId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/documents/employee/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setDocuments(response.data.data);
      }
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error fetching employee documents"
      );
      setLoading(false);
    }
  };

  const handleDocumentPreview = (documentId) => {
    window.open(
      `http://localhost:5000/api/documents/${documentId}/preview`,
      "_blank"
    );
  };

  const handleDocumentDownload = (documentId) => {
    window.open(
      `http://localhost:5000/api/documents/${documentId}/download`,
      "_blank"
    );
  };

  if (loading)
    return (
      <Message icon>
        <Icon name="circle notched" loading />
        Loading employee profile...
      </Message>
    );
  if (error)
    return (
      <Message negative>
        <Message.Header>Error</Message.Header>
        <p>{error}</p>
      </Message>
    );
  if (!employee)
    return (
      <Message warning>
        <Message.Header>Employee not found</Message.Header>
      </Message>
    );

  const panes = [
    {
      menuItem: "Personal Information",
      render: () => (
        <Tab.Pane>
          <Grid columns={2} stackable>
            <Grid.Column width={6}>
              <Segment>
                <Image
                  src={
                    documents.find((doc) => doc.type === "Profile Picture")
                      ?.fileUrl
                      ? `http://localhost:5000/${
                          documents.find(
                            (doc) => doc.type === "Profile Picture"
                          )?.fileUrl
                        }`
                      : "/default-profile.png"
                  }
                  size="medium"
                  circular
                  centered
                />
                <Header as="h3" textAlign="center">
                  {`${employee.firstName} ${employee.lastName}`}
                  {employee.preferredName && (
                    <Header.Subheader>
                      ({employee.preferredName})
                    </Header.Subheader>
                  )}
                </Header>
              </Segment>
            </Grid.Column>

            <Grid.Column width={10}>
              <Segment>
                <Header as="h3">Basic Information</Header>
                <List divided relaxed>
                  <List.Item>
                    <List.Icon name="id card" />
                    <List.Content>
                      <List.Header>SSN</List.Header>
                      <List.Description>
                        {employee.ssn || "N/A"}
                      </List.Description>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Icon name="calendar" />
                    <List.Content>
                      <List.Header>Date of Birth</List.Header>
                      <List.Description>
                        {new Date(employee.dateOfBirth).toLocaleDateString() ||
                          "N/A"}
                      </List.Description>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Icon name="user" />
                    <List.Content>
                      <List.Header>Gender</List.Header>
                      <List.Description>
                        {employee.gender || "N/A"}
                      </List.Description>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Icon name="mail" />
                    <List.Content>
                      <List.Header>Email</List.Header>
                      <List.Description>{employee.email}</List.Description>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Icon name="phone" />
                    <List.Content>
                      <List.Header>Cell Phone</List.Header>
                      <List.Description>
                        {employee.cellPhone ||
                          (employee.contactInfo &&
                            employee.contactInfo.cellPhone) ||
                          "N/A"}
                      </List.Description>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Icon name="building" />
                    <List.Content>
                      <List.Header>Work Phone</List.Header>
                      <List.Description>
                        {employee.workPhone ||
                          (employee.contactInfo &&
                            employee.contactInfo.workPhone) ||
                          "N/A"}
                      </List.Description>
                    </List.Content>
                  </List.Item>
                </List>
              </Segment>
            </Grid.Column>
          </Grid>

          <Segment>
            <Header as="h3">Address</Header>
            <p>
              {employee.address?.building && `${employee.address.building}, `}
              {employee.address?.street && `${employee.address.street}, `}
              {employee.address?.city && `${employee.address.city}, `}
              {employee.address?.state && `${employee.address.state}, `}
              {employee.address?.zip && employee.address.zip}
              {!employee.address && "Address not provided"}
            </p>
          </Segment>
          <Segment>
            <Header as="h3">Work Authorization</Header>
            <List divided relaxed>
              <List.Item>
                <List.Icon name="id badge" />
                <List.Content>
                  <List.Header>Type</List.Header>
                  <List.Description>
                    {employee.isPermanentResident
                      ? employee.residencyType
                      : employee.visaType || "N/A"}
                  </List.Description>
                </List.Content>
              </List.Item>
              {!employee.isPermanentResident && (
                <>
                  <List.Item>
                    <List.Icon name="calendar check" />
                    <List.Content>
                      <List.Header>Start Date</List.Header>
                      <List.Description>
                        {employee.startDate
                          ? new Date(employee.startDate).toLocaleDateString()
                          : "N/A"}
                      </List.Description>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Icon name="calendar times" />
                    <List.Content>
                      <List.Header>End Date</List.Header>
                      <List.Description>
                        {employee.endDate
                          ? new Date(employee.endDate).toLocaleDateString()
                          : "N/A"}
                      </List.Description>
                    </List.Content>
                  </List.Item>
                </>
              )}
            </List>
          </Segment>
        </Tab.Pane>
      ),
    },
    {
      menuItem: "Documents",
      render: () => (
        <Tab.Pane>
          {documents.length === 0 ? (
            <Message info>
              <Message.Header>No documents found</Message.Header>
              <p>This employee has not uploaded any documents yet.</p>
            </Message>
          ) : (
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Type</Table.HeaderCell>
                  <Table.HeaderCell>File Name</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {documents.map((doc) => (
                  <Table.Row key={doc._id}>
                    <Table.Cell>{doc.type}</Table.Cell>
                    <Table.Cell>{doc.fileName}</Table.Cell>
                    <Table.Cell>{doc.status}</Table.Cell>
                    <Table.Cell>
                      <Button.Group size="small">
                        <Button
                          icon
                          labelPosition="left"
                          onClick={() => handleDocumentPreview(doc._id)}
                        >
                          <Icon name="eye" />
                          Preview
                        </Button>
                        <Button
                          icon
                          labelPosition="left"
                          onClick={() => handleDocumentDownload(doc._id)}
                        >
                          <Icon name="download" />
                          Download
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
      menuItem: "Emergency Contacts",
      render: () => (
        <Tab.Pane>
          {!employee.emergencyContacts ||
          employee.emergencyContacts.length === 0 ? (
            <Message info>
              <Message.Header>No emergency contacts</Message.Header>
              <p>This employee has not added any emergency contacts yet.</p>
            </Message>
          ) : (
            <List divided relaxed>
              {employee.emergencyContacts.map((contact, index) => (
                <List.Item key={index}>
                  <List.Icon name="user" size="large" verticalAlign="middle" />
                  <List.Content>
                    <List.Header>{`${contact.firstName} ${contact.lastName}`}</List.Header>
                    <List.Description>
                      <p>
                        <strong>Relationship:</strong> {contact.relationship}
                      </p>
                      <p>
                        <strong>Phone:</strong> {contact.phone}
                      </p>
                      <p>
                        <strong>Email:</strong> {contact.email}
                      </p>
                    </List.Description>
                  </List.Content>
                </List.Item>
              ))}
            </List>
          )}
        </Tab.Pane>
      ),
    },
  ];

  return (
    <Container>
      <Header as="h1">Employee Profile</Header>
      <Tab panes={panes} />
    </Container>
  );
};

export default EmployeeProfileDetail;
