import {
  SplitPanel,
  ColumnLayout,
  SpaceBetween,
  FormField,
  Input,
  Textarea,
  ToggleButton,
  DatePicker,
} from "@cloudscape-design/components";
import { JSX } from "react";
import { TaskType } from "../api/auto-generated-client";
import { UniqueIdentifier } from "@dnd-kit/core";

type TaskEditorProps = {
  canEditBoard: () => boolean;
  onChangeTask: (updates: Partial<TaskType>) => void;
  getTaskFromId: (id: UniqueIdentifier) => TaskType | undefined;
  editTaskId: UniqueIdentifier;
  toggleTaskComplete: (taskId: string) => void;
};
const TaskEditor = ({
  canEditBoard,
  onChangeTask,
  getTaskFromId,
  editTaskId,
  toggleTaskComplete,
}: TaskEditorProps): JSX.Element => {
  return (
    <SplitPanel header={"Edit Task"}>
      <form>
        <ColumnLayout columns={2}>
          <SpaceBetween size="l">
            <FormField
              description="Enter your task heading"
              label="Task Heading"
            >
              <Input
                disabled={!canEditBoard()}
                onChange={({ detail }) => {
                  onChangeTask({ name: detail.value });
                }}
                value={getTaskFromId(editTaskId)?.name ?? ""}
              />
            </FormField>
            <FormField
              description="Enter your task description"
              label="Task Description"
            >
              <Textarea
                disabled={!canEditBoard()}
                onChange={({ detail }) =>
                  onChangeTask({ description: detail.value })
                }
                value={getTaskFromId(editTaskId)?.description ?? ""}
              />
            </FormField>
            <ToggleButton
              disabled={!canEditBoard()}
              onChange={() => {
                editTaskId ? toggleTaskComplete(editTaskId.toString()) : null;
              }}
              pressed={getTaskFromId(editTaskId)?.completed ?? false}
            >
              Mark as{" "}
              {getTaskFromId(editTaskId)?.completed ? "Incomplete" : "Complete"}
            </ToggleButton>
          </SpaceBetween>

          <FormField description="Enter your task due date" label="Due Date">
            <DatePicker
              value={getTaskFromId(editTaskId)?.dueDate ?? ""}
              onChange={({ detail }) => {
                console.log(detail);
                onChangeTask({ dueDate: detail.value });
              }}
            ></DatePicker>
          </FormField>
        </ColumnLayout>
      </form>
    </SplitPanel>
  );
};

export default TaskEditor;
