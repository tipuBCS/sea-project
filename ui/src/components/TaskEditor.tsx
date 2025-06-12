import {
  SplitPanel,
  ColumnLayout,
  SpaceBetween,
  FormField,
  Input,
  Textarea,
  ToggleButton,
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
      <ColumnLayout columns={4}>
        <form>
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
        </form>
      </ColumnLayout>
    </SplitPanel>
  );
};

export default TaskEditor;
