import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Header,
  Input,
  Table,
  Button,
  Icon,
  Message,
} from "semantic-ui-react";
import {
  setEmployees,
  setSearchTerm,
  setSelectedEmployee,
} from "../../slices/profileSlice";
import axios from "axios";
import NavigationMenu from "../../component/NavigationMenu";

const EmployeeProfiles = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState("hr");
  const { employees, filteredEmployees, searchTerm } = useSelector(
    (state) => state.profiles
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all employees on component mount
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role) {
      setUserRole(role);
    }
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/hr/employees",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          dispatch(setEmployees(response.data.data));
        }
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching employees");
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [dispatch]);

  // Handle search input change
  const handleSearch = (e) => {
    const searchValue = e.target.value;
    dispatch(setSearchTerm(searchValue));

    // If search term is long enough, call backend search API
    if (searchValue.length >= 3) {
      searchEmployeesFromBackend(searchValue);
    }
  };

  // Search employees using the backend API
  const searchEmployeesFromBackend = async (term) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/hr/employees/search?term=${term}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Only update filtered employees, not the full list
        dispatch(setEmployees(response.data.data));
      }
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error searching employees");
      setLoading(false);
    }
  };

  // View employee profile in a new tab
  const handleViewProfile = (employee) => {
    dispatch(setSelectedEmployee(employee));
    navigate(`/employee-profile/${employee._id}`);
  };

  return (
    <Container>
      <NavigationMenu userRole={userRole} activePath={location.pathname} />
      <Header as="h1">Employee Profiles</Header>
      {error && (
        <Message negative>
          <Message.Header>Error</Message.Header>
          <p>{error}</p>
        </Message>
      )}

      <Input
        icon="search"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={handleSearch}
        fluid
        style={{ marginBottom: "20px" }}
        loading={loading}
      />

      <Header as="h3">Total Employees: {filteredEmployees.length}</Header>

      {loading && <p>Loading employees...</p>}

      {!loading && filteredEmployees.length === 0 ? (
        <Message info>
          <Message.Header>No employees found</Message.Header>
          <p>
            Try a different search term or check if employees have been
            onboarded.
          </p>
        </Message>
      ) : (
        <Table celled selectable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>SSN</Table.HeaderCell>
              <Table.HeaderCell>Work Authorization</Table.HeaderCell>
              <Table.HeaderCell>Phone Number</Table.HeaderCell>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>Action</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {filteredEmployees.map((employee) => (
              <Table.Row key={employee._id}>
                <Table.Cell>
                  {`${employee.firstName} ${employee.lastName}`}
                  {employee.preferredName && ` (${employee.preferredName})`}
                </Table.Cell>
                <Table.Cell>{employee.ssn || "N/A"}</Table.Cell>
                <Table.Cell>
                  {employee.visaType || employee.workAuthorization || "N/A"}
                </Table.Cell>
                <Table.Cell>
                  {employee.contactInfo?.cellPhone || "N/A"}
                </Table.Cell>
                <Table.Cell>{employee.email}</Table.Cell>
                <Table.Cell>
                  <Button primary onClick={() => handleViewProfile(employee)}>
                    <Icon name="user" />
                    View Profile
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Container>
  );
};

export default EmployeeProfiles;
