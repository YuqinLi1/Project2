import React, { useState, useEffect } from "react";
import { Form, Button, Input, Table, Message, Header } from "semantic-ui-react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import {
  addRegistrationToken,
  setRegistrationTokens,
} from "../slices/hiringSlice";

const RegistrationTokenTab = () => {
  const dispatch = useDispatch();
  const { registrationTokens } = useSelector((state) => state.hiring);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchRegistrationTokens();
  }, []);

  // Fetch registration tokens
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

  // Add ability to resend token email
  const handleResendToken = async (tokenId) => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:5000/api/hr/resend-token/${tokenId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccess("Registration email resent successfully");
        // Refresh token list
        await fetchRegistrationTokens();
      }

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error resending token email");
      setLoading(false);
    }
  };

  // Add ability to revoke token
  const handleRevokeToken = async (tokenId) => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:5000/api/hr/revoke-token/${tokenId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccess("Token revoked successfully");
        // Refresh token list
        await fetchRegistrationTokens();
      }

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error revoking token");
      setLoading(false);
    }
  };

  return (
    <>
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
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {registrationTokens.map((record) => (
              <Table.Row key={record._id}>
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
                <Table.Cell>
                  <Button.Group size="tiny">
                    <Button
                      color="blue"
                      onClick={() => handleResendToken(record._id)}
                      disabled={
                        record.status === "used" || record.status === "revoked"
                      }
                    >
                      Resend
                    </Button>
                    <Button
                      color="red"
                      onClick={() => handleRevokeToken(record._id)}
                      disabled={
                        record.status === "used" || record.status === "revoked"
                      }
                    >
                      Revoke
                    </Button>
                  </Button.Group>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </>
  );
};

export default RegistrationTokenTab;
