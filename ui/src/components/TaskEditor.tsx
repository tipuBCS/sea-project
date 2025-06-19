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
  Select,
  SelectProps,
} from "@cloudscape-design/components";
import { JSX, useEffect, useState } from "react";
import { TaskImportance, TaskType, User } from "../api/auto-generated-client";
import { UniqueIdentifier } from "@dnd-kit/core";
import PriorityButtons, { PriorityButtonsProps } from "./PriorityButtons";
import { toast } from "react-toastify";

type TaskEditorProps = {
  saveTaskChanges: () => void;
  canEditBoard: () => boolean;
  onChangeTask: (updates: Partial<TaskType>) => void;
  getTaskFromId: (id: UniqueIdentifier) => TaskType | undefined;
  editTaskId: UniqueIdentifier;
  toggleTaskComplete: (taskId: string) => void;
  allUsers: User[];
};
const TaskEditor = ({
  saveTaskChanges,
  canEditBoard,
  onChangeTask,
  getTaskFromId,
  editTaskId,
  toggleTaskComplete,
  allUsers,
}: TaskEditorProps): JSX.Element => {
  const [selectedOption, setSelectedOption] =
    useState<SelectProps.Option | null>(null);

  const [saveButtonDisabled, setSaveButtonDisabled] = useState<boolean>(false);

  useEffect(() => {
    if (getTaskFromId(editTaskId)?.assignedTo) {
      const user: User | undefined = allUsers.find(
        (user) => user.userId === getTaskFromId(editTaskId)?.assignedTo
      );
      if (user) {
        setSelectedOption({ label: user.displayName, value: user.userId });
      }
    }
  }, []);

  const currentTaskImportance =
    getTaskFromId(editTaskId)?.importance ?? TaskImportance.NONE;
  const PriorityButtonProps: PriorityButtonsProps = {
    selected: currentTaskImportance,
    onChange: function (priority: TaskImportance): void {
      onChangeTask({ importance: priority });
    },
    canEditBoard,
  };

  function saveTaskChangesAndDisplayToaster() {
    setSaveButtonDisabled(true);
    saveTaskChanges();
    const savingToast = toast("Updating task details ...", { type: "info" });
    setTimeout(() => {
      setSaveButtonDisabled(false);
      toast.update(savingToast, {
        render: "Task updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 4000,
      });
    }, 2000);
  }

  return (
    <SplitPanel
      header={"Edit Task"}
      closeBehavior={"hide"}
      hidePreferencesButton={true}
    >
      <SpaceBetween size="l">
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 2 }, { colspan: 4 }]}>
          <FormField
            description="Enter your task heading"
            label="Task Heading"
            stretch={true}
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
            description="Assign a user to the task"
            label="Assigned User"
          >
            <Select
              disabled={!canEditBoard()}
              selectedOption={selectedOption}
              onChange={({ detail }) => {
                console.log(detail);
                setSelectedOption(detail.selectedOption);
                onChangeTask({ assignedTo: detail.selectedOption.value });
              }}
              options={allUsers.map((user) => {
                return { label: user.displayName, value: user.userId };
              })}
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
            { colspan: 4 },
            { colspan: 2 },
            { colspan: 2},
            { colspan: 2 },
          ]}
        >
          <FormField
            description="Enter your task description"
            label="Task Description"
            stretch={true}
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
              disabled={!canEditBoard()}
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
              disabled={!canEditBoard()}
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
              disabled={!canEditBoard()}
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
          <Button
            disabled={!canEditBoard() || saveButtonDisabled}
            onClick={() => {
              saveTaskChangesAndDisplayToaster();
            }}
          >
            Save Changes
          </Button>
        </Grid>
      </SpaceBetween>
    </SplitPanel>
  );
};

export default TaskEditor;
