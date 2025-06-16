import {
  SplitPanel,
  ColumnLayout,
  SpaceBetween,
  FormField,
  Input,
  Textarea,
  ToggleButton,
  DatePicker,
  Grid,
  Button,
} from "@cloudscape-design/components";
import { JSX } from "react";
import { TaskImportance, TaskType } from "../api/auto-generated-client";
import { UniqueIdentifier } from "@dnd-kit/core";
import PriorityButtons, { PriorityButtonsProps } from "./PriorityButtons";

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
  const currentTaskImportance =
    getTaskFromId(editTaskId)?.importance ?? TaskImportance.NONE;
  const PriorityButtonProps: PriorityButtonsProps = {
    selected: currentTaskImportance,
    onChange: function (priority: TaskImportance): void {
      onChangeTask({ importance: priority });
    },
  };
  return (
    <SplitPanel header={"Edit Task"} closeBehavior={"hide"}>
      <SpaceBetween size="l">
        <Grid gridDefinition={[{ colspan: 5 }, { colspan: 3 }]}>
          <FormField description="Enter your task heading" label="Task Heading">
            <Input
              disabled={!canEditBoard()}
              onChange={({ detail }) => {
                onChangeTask({ name: detail.value });
              }}
              value={getTaskFromId(editTaskId)?.name ?? ""}
            />
          </FormField>

          <FormField
            description="Enter the task's priority level"
            label="Priority"
          >
            {PriorityButtons(PriorityButtonProps)}
          </FormField>
        </Grid>
        <Grid
          gridDefinition={[
            { colspan: 5 },
            { colspan: 2 },
            { colspan: 2 },
            { colspan: 2 },
          ]}
        >
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
          <FormField description="Enter your task due date" label="Due Date">
            <DatePicker
              value={getTaskFromId(editTaskId)?.dueDate ?? ""}
              onChange={({ detail }) => {
                console.log(detail);
                onChangeTask({ dueDate: detail.value });
              }}
            ></DatePicker>
          </FormField>

          <FormField
            description="Enter your minimum time"
            label="Minimum Time (Hrs)"
          >
            <Input
              onChange={({ detail }) => {
                console.log(detail);
                onChangeTask({ minTime: Number(detail.value) });
              }}
              value={String(
                getTaskFromId(editTaskId)?.minTime === -1
                  ? 0
                  : getTaskFromId(editTaskId)?.minTime ?? 0
              )}
              inputMode="numeric"
              type="number"
            />
          </FormField>

          <FormField
            description="Enter your maximum time"
            label="Maximum Time (Hrs)"
          >
            <Input
              onChange={({ detail }) => {
                console.log(detail);
                onChangeTask({ maxTime: Number(detail.value) });
              }}
              value={String(
                getTaskFromId(editTaskId)?.maxTime === -1
                  ? 0
                  : getTaskFromId(editTaskId)?.maxTime ?? 0
              )}
              inputMode="numeric"
              type="number"
            />
          </FormField>
        </Grid>
        <Grid gridDefinition={[{ colspan: 6 }, { offset: 4, colspan: 2 }]}>
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
          <Button>Save Changes</Button>
        </Grid>
      </SpaceBetween>
    </SplitPanel>
  );
};

export default TaskEditor;
