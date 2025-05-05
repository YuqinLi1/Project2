import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Header,
  Grid,
  Segment,
  Button,
  Icon,
  Card,
  Statistic,
  Message,
  Divider,
  Menu,
} from "semantic-ui-react";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    pendingDocuments: 0,
    pendingApplications: 0,
    totalEmployees: 0,
    visaExpiringSoon: 0,
    onboardingStatus: "never submit", // Add this to track employee's onboarding status
  });

  // Fetch user info and role-specific stats on component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("userRole");

        if (!token) {
          navigate("/login");
          return;
        }

        if (role) {
          setUserRole(role);

          // Get user profile information
          const userResponse = await axios.get(
            "http://localhost:5000/api/auth/me",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (userResponse.data.success) {
            setUserName(userResponse.data.data.username);
          }

          // Fetch role-specific statistics
          if (role === "hr") {
            await fetchHRStats(token);
          } else {
            await fetchEmployeeStats(token);
          }
        } else {
          // If role isn't in localStorage, redirect to login
          localStorage.removeItem("token");
          navigate("/login");
        }

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Error loading dashboard");
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const fetchHRStats = async (token) => {
    let pendingDocs = 0;
    let totalEmployees = 0;
    let pendingApps = 0;
    let expiringVisas = 0;

    try {
      // Fetch pending documents (visa status in progress)
      try {
        const pendingDocsResponse = await axios.get(
          "http://localhost:5000/api/visa-status/in-progress",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Pending docs response:", pendingDocsResponse.data);

        // Check if there's a data array or explicit count
        if (pendingDocsResponse.data.data) {
          pendingDocs = pendingDocsResponse.data.data.length;
        } else if (pendingDocsResponse.data.count !== undefined) {
          pendingDocs = pendingDocsResponse.data.count;
        }
      } catch (error) {
        console.error("Error fetching pending documents:", error);
      }

      // Fetch employees count
      try {
        const employeesResponse = await axios.get(
          "http://localhost:5000/api/hr/employees",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Employees response:", employeesResponse.data);

        // Check if there's a data array or explicit count
        if (employeesResponse.data.data) {
          totalEmployees = employeesResponse.data.data.length;
        } else if (employeesResponse.data.count !== undefined) {
          totalEmployees = employeesResponse.data.count;
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }

      // Fetch pending applications
      try {
        const pendingAppsResponse = await axios.get(
          "http://localhost:5000/api/hr/onboarding/pending",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Pending apps response:", pendingAppsResponse.data);

        // Check if there's a data array or explicit count
        if (pendingAppsResponse.data.data) {
          pendingApps = pendingAppsResponse.data.data.length;
        } else if (pendingAppsResponse.data.count !== undefined) {
          pendingApps = pendingAppsResponse.data.count;
        }
      } catch (error) {
        console.error("Error fetching pending applications:", error);
      }

      // Fetch expiring visas
      try {
        // This endpoint might not exist or be renamed
        const expiringVisasResponse = await axios.get(
          "http://localhost:5000/api/visa-status/expiring-soon",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Expiring visas response:", expiringVisasResponse.data);

        // Check if there's a data array or explicit count
        if (expiringVisasResponse.data.data) {
          expiringVisas = expiringVisasResponse.data.data.length;
        } else if (expiringVisasResponse.data.count !== undefined) {
          expiringVisas = expiringVisasResponse.data.count;
        }
      } catch (error) {
        console.error("Error fetching expiring visas:", error);
      }

      // Update stats with collected values
      setStats({
        pendingDocuments: pendingDocs,
        totalEmployees: totalEmployees,
        pendingApplications: pendingApps,
        visaExpiringSoon: expiringVisas,
      });
    } catch (err) {
      console.error("Error in fetchHRStats:", err);
    }
  };

  // Fetch employee-specific statistics
  const fetchEmployeeStats = async (token) => {
    try {
      // Get the userId from JWT token
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const userId = decoded.id;

      // Fetch employee's onboarding status
      try {
        const statusResponse = await axios.get(
          `http://localhost:5000/api/employee/status/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Employee status response:", statusResponse.data);

        if (statusResponse.data) {
          setStats((prevStats) => ({
            ...prevStats,
            onboardingStatus: statusResponse.data.status || "never submit",
          }));
        }
      } catch (error) {
        console.error("Error fetching employee status:", error);
      }

      // Only try to fetch visa status if onboarding is approved
      // This prevents errors for employees who haven't completed onboarding yet
      if (stats.onboardingStatus === "approved") {
        try {
          const visaStatusResponse = await axios.get(
            "http://localhost:5000/api/visa-status/my-status",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          console.log("Visa status response:", visaStatusResponse.data);

          if (visaStatusResponse.data.success && visaStatusResponse.data.data) {
            const visaStatus = visaStatusResponse.data.data;
            if (visaStatus.documents && Array.isArray(visaStatus.documents)) {
              const pendingDocs = visaStatus.documents.filter(
                (doc) => doc.status === "pending"
              ).length;

              setStats((prevStats) => ({
                ...prevStats,
                pendingDocuments: pendingDocs,
              }));
            }
          }
        } catch (error) {
          console.error("Error fetching visa status:", error);
        }
      }
    } catch (err) {
      console.error("Error in fetchEmployeeStats:", err);
    }
  };

  // Navigation helper
  const handleNavigate = (path) => {
    navigate(path);
  };

  // Main navigation component
  const NavigationMenu = () => (
    <Menu pointing secondary>
      <Menu.Item header>Employee Portal</Menu.Item>

      {userRole === "hr" ? (
        // HR Navigation Items
        <>
          <Menu.Item
            name="Dashboard"
            active
            onClick={() => handleNavigate("/dashboard")}
          />
          <Menu.Item
            name="Employee Profiles"
            onClick={() => handleNavigate("/profiles")}
          />
          <Menu.Item
            name="Visa Management"
            onClick={() => handleNavigate("/visa-management")}
          />
          <Menu.Item
            name="Hiring Management"
            onClick={() => handleNavigate("/hiring-management")}
          />
        </>
      ) : (
        // Employee Navigation Items
        <>
          <Menu.Item
            name="Dashboard"
            active
            onClick={() => handleNavigate("/dashboard")}
          />
          <Menu.Item
            name="Onboarding"
            onClick={() => handleNavigate("/application")}
          />
          <Menu.Item
            name="Personal Information"
            onClick={() => handleNavigate("/information")}
          />
          <Menu.Item
            name="Visa Status"
            onClick={() => handleNavigate("/management")}
          />
        </>
      )}

      <Menu.Menu position="right">
        <Menu.Item
          name="Logout"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("userRole");
            handleNavigate("/login");
          }}
        />
      </Menu.Menu>
    </Menu>
  );

  if (loading) {
    return (
      <Container style={{ marginTop: "2em" }}>
        <Segment loading>
          <Header as="h1">Loading Dashboard...</Header>
        </Segment>
      </Container>
    );
  }

  return (
    <Container style={{ marginTop: "2em" }}>
      <NavigationMenu />

      <Header as="h1" dividing>
        Welcome to the Employee Portal, {userName}!
        <Header.Subheader>
          {userRole === "hr" ? "HR Management Dashboard" : "Employee Dashboard"}
        </Header.Subheader>
      </Header>

      {error && (
        <Message negative>
          <Message.Header>Error</Message.Header>
          <p>{error}</p>
        </Message>
      )}

      {/* Application Status Alert for Employees */}
      {userRole === "employee" && stats.onboardingStatus === "never submit" && (
        <Message warning>
          <Message.Header>Onboarding Required</Message.Header>
          <p>
            You haven't submitted your onboarding application yet. Please
            complete your application to access all features.
          </p>
          <Button
            primary
            onClick={() => navigate("/application")}
            style={{ marginTop: "10px" }}
          >
            Complete Onboarding
          </Button>
        </Message>
      )}

      {userRole === "employee" && stats.onboardingStatus === "rejected" && (
        <Message negative>
          <Message.Header>Application Rejected</Message.Header>
          <p>
            Your onboarding application was rejected. Please review the feedback
            and resubmit your application.
          </p>
          <Button
            primary
            onClick={() => navigate("/application")}
            style={{ marginTop: "10px" }}
          >
            Review and Resubmit
          </Button>
        </Message>
      )}

      {/* Statistics Section */}
      <Segment raised>
        <Header as="h2">Dashboard Overview</Header>
        <Statistic.Group widths={userRole === "hr" ? 4 : 2} size="small">
          {userRole === "hr" && (
            <>
              <Statistic>
                <Statistic.Value>{stats.totalEmployees}</Statistic.Value>
                <Statistic.Label>Total Employees</Statistic.Label>
              </Statistic>

              <Statistic color="orange">
                <Statistic.Value>{stats.pendingApplications}</Statistic.Value>
                <Statistic.Label>Pending Applications</Statistic.Label>
              </Statistic>
            </>
          )}

          <Statistic color={stats.pendingDocuments > 0 ? "yellow" : "green"}>
            <Statistic.Value>{stats.pendingDocuments}</Statistic.Value>
            <Statistic.Label>Pending Documents</Statistic.Label>
          </Statistic>

          {userRole === "hr" && (
            <Statistic color={stats.visaExpiringSoon > 0 ? "red" : "green"}>
              <Statistic.Value>{stats.visaExpiringSoon}</Statistic.Value>
              <Statistic.Label>Visas Expiring Soon</Statistic.Label>
            </Statistic>
          )}
        </Statistic.Group>
      </Segment>

      <Divider hidden />

      {/* Quick Access Section */}
      <Header as="h2">Quick Access</Header>
      <Grid
        stackable
        columns={
          userRole === "hr" ? 3 : stats.onboardingStatus === "approved" ? 2 : 1
        }
      >
        {userRole === "hr" ? (
          // HR Navigation Cards
          <>
            <Grid.Column>
              <Card fluid>
                <Card.Content>
                  <Card.Header>Employee Profiles</Card.Header>
                  <Card.Description>
                    View and manage employee details, search for specific
                    employees, and access their full profiles.
                  </Card.Description>
                </Card.Content>
                <Card.Content extra>
                  <Button primary fluid onClick={() => navigate("/profiles")}>
                    <Icon name="users" /> View Employee Profiles
                  </Button>
                </Card.Content>
              </Card>
            </Grid.Column>

            <Grid.Column>
              <Card fluid>
                <Card.Content>
                  <Card.Header>Visa Status Management</Card.Header>
                  <Card.Description>
                    Review and approve visa documents, track visa status, and
                    manage employee work authorization.
                  </Card.Description>
                </Card.Content>
                <Card.Content extra>
                  <Button
                    primary
                    fluid
                    onClick={() => navigate("/visa-management")}
                  >
                    <Icon name="file alternate" /> Manage Visa Documents
                  </Button>
                </Card.Content>
              </Card>
            </Grid.Column>

            <Grid.Column>
              <Card fluid>
                <Card.Content>
                  <Card.Header>Hiring Management</Card.Header>
                  <Card.Description>
                    Generate registration tokens, review onboarding
                    applications, and manage the hiring process.
                  </Card.Description>
                </Card.Content>
                <Card.Content extra>
                  <Button
                    primary
                    fluid
                    onClick={() => navigate("/hiring-management")}
                  >
                    <Icon name="add user" /> Manage Hiring
                  </Button>
                </Card.Content>
              </Card>
            </Grid.Column>
          </>
        ) : (
          // Employee Navigation Cards
          <>
            {/* Always show application card if not approved */}
            {stats.onboardingStatus !== "approved" && (
              <Grid.Column>
                <Card fluid>
                  <Card.Content>
                    <Card.Header>Onboarding Application</Card.Header>
                    <Card.Description>
                      {stats.onboardingStatus === "never submit"
                        ? "Complete your onboarding application to get started."
                        : stats.onboardingStatus === "rejected"
                        ? "Review feedback and resubmit your application."
                        : "View your pending application status."}
                    </Card.Description>
                  </Card.Content>
                  <Card.Content extra>
                    <Button
                      primary
                      fluid
                      onClick={() => navigate("/application")}
                    >
                      <Icon name="clipboard check" />
                      {stats.onboardingStatus === "never submit"
                        ? "Complete Application"
                        : "View Application"}
                    </Button>
                  </Card.Content>
                </Card>
              </Grid.Column>
            )}

            {/* Only show these after onboarding is approved */}
            {stats.onboardingStatus === "approved" && (
              <>
                <Grid.Column>
                  <Card fluid>
                    <Card.Content>
                      <Card.Header>Personal Information</Card.Header>
                      <Card.Description>
                        View and update your personal information, address,
                        contact details, and more.
                      </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                      <Button
                        primary
                        fluid
                        onClick={() => navigate("/information")}
                      >
                        <Icon name="user" /> Manage Personal Information
                      </Button>
                    </Card.Content>
                  </Card>
                </Grid.Column>

                <Grid.Column>
                  <Card fluid>
                    <Card.Content>
                      <Card.Header>Visa Status</Card.Header>
                      <Card.Description>
                        Track your visa status, upload required documents, and
                        monitor document approval status.
                      </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                      <Button
                        primary
                        fluid
                        onClick={() => navigate("/management")}
                      >
                        <Icon name="file alternate" /> Manage Visa Documents
                      </Button>
                    </Card.Content>
                  </Card>
                </Grid.Column>
              </>
            )}
          </>
        )}
      </Grid>

      <Divider hidden />

      {/* System Notifications Section */}
      <Segment raised>
        <Header as="h2">System Notifications</Header>
        <Message info>
          <Message.Header>
            Welcome to the Employee Management System
          </Message.Header>
          <p>
            This dashboard provides quick access to the various features of the
            employee management portal. Use the cards above to navigate to
            different sections of the application.
          </p>
        </Message>

        {stats.pendingDocuments > 0 && (
          <Message warning>
            <Message.Header>Document Action Required</Message.Header>
            <p>
              {userRole === "hr"
                ? `There are ${stats.pendingDocuments} documents pending your review.`
                : "You have documents awaiting approval from HR."}
            </p>
          </Message>
        )}

        {userRole === "hr" && stats.pendingApplications > 0 && (
          <Message warning>
            <Message.Header>Applications Pending Review</Message.Header>
            <p>
              There are {stats.pendingApplications} onboarding applications
              waiting for your review.
            </p>
          </Message>
        )}

        {userRole === "hr" && stats.visaExpiringSoon > 0 && (
          <Message negative>
            <Message.Header>Visa Expiration Alert</Message.Header>
            <p>
              {stats.visaExpiringSoon} employees have visas expiring within the
              next 90 days.
            </p>
          </Message>
        )}
      </Segment>
    </Container>
  );
};

export default Dashboard;
