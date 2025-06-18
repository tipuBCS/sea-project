import {
  Modal,
  Box,
  SpaceBetween,
  Button,
  Container,
  ColumnLayout,
  StatusIndicator,
} from "@cloudscape-design/components";
import { TaskImportance, TaskType } from "../api/auto-generated-client";

export type DeleteConfirmationModalProps = {
  task: TaskType;
  onConfirm: () => void;
  onCancel: () => void;
};

const DeleteConfirmationModal = ({
  task,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) => {
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Calculate time estimate range
  const timeEstimate = `${task.minTime}-${task.maxTime} hours`;

  return (
    <Modal
      visible={true}
      onDismiss={onCancel}
      header={<h2>Confirm Task Deletion</h2>}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onConfirm}>
              Delete task
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size="l">
        <Box>
          <h4>Are you sure you want to delete this task?</h4>
          <Box variant="p" color="text-status-error">
            This action cannot be undone.
          </Box>
        </Box>

        <Container header={<h3>Task Details</h3>}>
          <ColumnLayout columns={2} variant="text-grid">
            <div>
              <Box variant="h4">Heading</Box>
              <Box variant="p">{task.name ? task.name : "None"}</Box>
            </div>

            <div>
              <Box variant="h4">Description</Box>
              <Box variant="p">{task.description ? task.description : "None"}</Box>
            </div>

            <div>
              <Box variant="h4">Status</Box>
              <Box variant="p">
                {task.completed ? (
                  <StatusIndicator type="success">Completed</StatusIndicator>
                ) : (
                  <StatusIndicator type="in-progress">
                    In Progress
                  </StatusIndicator>
                )}
              </Box>
            </div>

            <div>
              <Box variant="h4">Priority</Box>
              <Box variant="p">
                <StatusIndicator
                  type={
                    task.importance === TaskImportance.HIGH
                      ? "error"
                      : task.importance === TaskImportance.MEDIUM
                      ? "warning"
                      : "info"
                  }
                >
                  {task.importance.charAt(0).toUpperCase() +
                    task.importance.slice(1)}
                </StatusIndicator>
              </Box>
            </div>

            <div>
              <Box variant="h4">Time Estimate</Box>
              <Box variant="p">{timeEstimate}</Box>
            </div>

            {task.dueDate && (
              <div>
                <Box variant="h4">Due Date</Box>
                <Box variant="p">{formatDate(task.dueDate)}</Box>
              </div>
            )}
          </ColumnLayout>
        </Container>
      </SpaceBetween>
    </Modal>
  );
};

export default DeleteConfirmationModal;
