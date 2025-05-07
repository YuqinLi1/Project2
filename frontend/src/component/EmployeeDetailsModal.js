import React from "react";
import { Button, Modal, Table } from "semantic-ui-react";

const EmployeeDetailsModal = ({
  employee,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!employee) return null;

  return (
    <Modal open={isOpen} onClose={onClose} size="large">
      <Modal.Header>Employee Application Details</Modal.Header>
      <Modal.Content>
        <Table definition>
          <Table.Body>
            <Table.Row>
              <Table.Cell width={4}>Full Name</Table.Cell>
              <Table.Cell>
                {employee.firstName} {employee.middleName} {employee.lastName}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Email</Table.Cell>
              <Table.Cell>{employee.email}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Cell Phone</Table.Cell>
              <Table.Cell>{employee.contactInfo?.cellPhone}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>SSN</Table.Cell>
              <Table.Cell>{employee.ssn}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Date of Birth</Table.Cell>
              <Table.Cell>
                {employee.dateOfBirth
                  ? new Date(employee.dateOfBirth).toLocaleDateString()
                  : "N/A"}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Gender</Table.Cell>
              <Table.Cell>
                {employee.gender === "male"
                  ? "Male"
                  : employee.gender === "female"
                  ? "Female"
                  : "Prefer not to say"}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Current Address</Table.Cell>
              <Table.Cell>
                {employee.currentAddress?.building}{" "}
                {employee.currentAddress?.street},{" "}
                {employee.currentAddress?.city},{" "}
                {employee.currentAddress?.state}, {employee.currentAddress?.zip}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Residency Status</Table.Cell>
              <Table.Cell>
                {employee.isPermanentResident
                  ? "Permanent Resident"
                  : "Not a Permanent Resident"}
              </Table.Cell>
            </Table.Row>
            {!employee.isPermanentResident && (
              <>
                <Table.Row>
                  <Table.Cell>Visa Type</Table.Cell>
                  <Table.Cell>{employee.visaType}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Visa Validity</Table.Cell>
                  <Table.Cell>
                    {employee.startDate
                      ? new Date(employee.startDate).toLocaleDateString()
                      : "N/A"}{" "}
                    to{" "}
                    {employee.endDate
                      ? new Date(employee.endDate).toLocaleDateString()
                      : "N/A"}
                  </Table.Cell>
                </Table.Row>
              </>
            )}
            <Table.Row>
              <Table.Cell>Onboarding Status</Table.Cell>
              <Table.Cell>{employee.onboardingStatus}</Table.Cell>
            </Table.Row>
            {employee.onboardingFeedback && (
              <Table.Row>
                <Table.Cell>Feedback</Table.Cell>
                <Table.Cell>{employee.onboardingFeedback}</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose}>Close</Button>
        <Button color="green" onClick={() => onApprove(employee._id)}>
          Approve Application
        </Button>
        <Button color="red" onClick={() => onReject(employee)}>
          Reject Application
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default EmployeeDetailsModal;
