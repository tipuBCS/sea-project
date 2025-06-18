import { HelpPanel } from "@cloudscape-design/components";

const InformationPanel = () => {
  return (
    <HelpPanel header={<h2>Task Management Guide</h2>}>
      <div className="help-content">
        <h3>Getting Started</h3>
        <p>
          Welcome to your Kanban board! This visual task management system helps
          you track work progress through different stages. Drag and drop tasks
          between columns to update their status.
        </p>

        <h3>Creating Tasks</h3>
        <p>
          Click the "Add Task" button to create a new task. Fill in essential
          details like task name, description, time estimates, and priority
          level. Assign team members to track responsibility.
        </p>

        <h3>Managing Workflow</h3>
        <p>
          Tasks move from left to right: Backlog → Prioritized Backlog → To Do →
          In Progress → Completed. Use drag-and-drop to move tasks between
          columns as their status changes.
        </p>

        <h3>Time Management</h3>
        <p>
          Provide minimum and maximum hour estimates for each task to help with
          planning. Update task status regularly to maintain an accurate project
          overview.
        </p>
      </div>
    </HelpPanel>
  );
};

export default InformationPanel;
