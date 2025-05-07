import React from "react";
import { Button, Modal, Form } from "semantic-ui-react";

const ApplicationRejectModal = ({
  isOpen,
  onClose,
  feedback,
  setFeedback,
  onReject,
  employeeId,
}) => {
  return (
    <Modal open={isOpen} onClose={onClose} size="small">
      <Modal.Header>Reject Application</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.TextArea
            label="Rejection Feedback"
            placeholder="Provide a reason for rejecting this application"
            value={feedback}
            onChange={(e, { value }) => setFeedback(value)}
          />
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          negative
          onClick={() => onReject(employeeId)}
          disabled={!feedback}
        >
          Confirm Rejection
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default ApplicationRejectModal;
