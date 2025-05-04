import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Header } from "semantic-ui-react";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Container textAlign="center" style={{ marginTop: "3em" }}>
      <Header as="h2">Welcome to the Dashboard</Header>
      <Button primary onClick={() => navigate("/application")}>Onboading</Button>
      <Button secondary onClick={() => navigate("/information")}>PersonalProfile</Button>
      <Button color="teal" onClick={() => navigate("/management")}>Visa Management</Button>
    </Container>
  );
};

export default Dashboard;