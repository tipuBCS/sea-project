import {
  AppLayout,
  Button,
  ColumnLayout,
  ContentLayout,
  Form,
  FormField,
  Header,
  Input,
  Link,
  SideNavigation,
  SpaceBetween,
  SplitPanel,
  Textarea,
  ToggleButton,
} from "@cloudscape-design/components";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { useEffect, useRef, useState } from "react";
import "../helper/mainContainer.css";

import { rectSortingStrategy } from "@dnd-kit/sortable";
import { MultipleContainers } from "../multi-container-dnd/src/examples/Sortable/MultipleContainers";
import { getTasks, updateTask, updateTaskPositions } from "../api/api";
import type {
  ContainerCollection,
  TaskPosition,
  TaskType,
} from "../api/auto-generated-client";

export type ContainerType = {
  id: UniqueIdentifier;
  name: string;
};

const USERID = "1";

function Test() {
  const [containers, setContainers] = useState<ContainerType[]>([
    { id: "Uncategorised", name: "Uncategorised" },
    { id: "PrioritizedBacklog", name: "Prioritized Backlog" },
    { id: "Backlog", name: "Backlog" },
    { id: "Doing", name: "Doing" },
    { id: "Done", name: "Done" },
  ]);

  const [tasks, setTasks] = useState<ContainerCollection>({});

  function toggleSplitPanel() {
    setSplitPanelOpen((enable) => !enable);
  }
  const [error, setError] = useState<string | null>(null);

  const [editTaskId, setEditTaskId] = useState<UniqueIdentifier>();

  const [splitPanelOpen, setSplitPanelOpen] = useState(false);

  function startEditingTask(task: TaskType) {
    console.log("Clicked edit!");
    setEditTaskId(task.id);
    setSplitPanelOpen(true);
  }
  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        console.log("Fetching task ..");
        const response = await getTasks(USERID);
        console.log(response);
        setTasks(response);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
        setError("An unknown error occurred!");
      }
    };
    fetchTaskData();
  }, []);

  const previousTasks = useRef<ContainerCollection>({});

  useEffect(() => {
    // Find what changed by comparing previous and current tasks
    const changes = findChanges(previousTasks.current, tasks);
    function updateTaskCategory(task: TaskType, newCategory: string) {
      updateTask(
        task.id,
        USERID,
        undefined,
        undefined,
        undefined,
        undefined,
        newCategory
      );
    }
    changes.forEach((change) => {
      updateTaskCategory(change.tasks, change.toContainer);
    });

    if (changes.length > 0) {
      console.log("Changes detected:", changes);
    }

    // Update the previous value
    previousTasks.current = tasks;
  }, [tasks]);

  const findChanges = (
    prev: ContainerCollection,
    current: ContainerCollection
  ) => {
    const changes: Array<{
      type: "moved";
      container: string;
      tasks: TaskType;
      fromContainer: string;
      toContainer: string;
    }> = [];

    // Create maps for previous and current task locations
    const prevTaskLocations = new Map<string, string>();
    const currentTaskLocations = new Map<string, string>();

    // Map all tasks in previous state
    Object.entries(prev).forEach(([containerId, tasks]) => {
      tasks.forEach((task) => {
        prevTaskLocations.set(task.id.toString(), containerId);
      });
    });

    // Check for moved tasks in current state
    Object.entries(current).forEach(([containerId, tasks]) => {
      tasks.forEach((task) => {
        const taskId = task.id.toString();
        const prevContainer = prevTaskLocations.get(taskId);

        // If task existed before and is in a different container now
        if (prevContainer && prevContainer !== containerId) {
          changes.push({
            type: "moved",
            container: containerId,
            tasks: task,
            fromContainer: prevContainer,
            toContainer: containerId,
          });
        }
      });
    });

    return changes;
  };

  function onChangeTask(updates: Partial<TaskType>) {
    if (!editTaskId) {
      return;
    }
    updateTask(
      editTaskId,
      USERID,
      updates.name,
      updates.description,
      updates.completed,
      updates.assignedTo
    );
    setTasks((prevItems) => {
      // Find which container has this item
      const containerId = Object.keys(prevItems).find((containerId) =>
        prevItems[containerId].some((item) => item.id === editTaskId)
      );

      if (!containerId) {
        return prevItems; // Item not found in any container
      }

      // Update the item in the found container
      return {
        ...prevItems,
        [containerId]: prevItems[containerId].map((item) =>
          item.id === editTaskId ? { ...item, ...updates } : item
        ),
      };
    });
  }

  function getTaskFromId(id: UniqueIdentifier): TaskType | undefined {
    // Find which container has this item
    const containerId = Object.keys(tasks).find((containerId) =>
      tasks[containerId].some((task) => task.id === id)
    );

    if (!containerId) {
      return undefined; // Item not found in any container
    }
    return tasks[containerId].find((task) => task.id === id);
  }

  useEffect(() => {
    console.log("tasks changed!");
    console.log(tasks);
    const items: Array<TaskPosition> = [];
    Object.keys(tasks).find((containerId) =>
      tasks[containerId].forEach((task, index) =>
        items.push({
          taskId: task.id.toString(),
          position: index,
          category: containerId,
        })
      )
    );

    updateTaskPositions(USERID, items);
  }, [tasks]);

  return (
    <AppLayout
      navigation={
        <SideNavigation
          header={{
            href: "#",
            text: "Kanban Board",
          }}
          items={[
            { type: "link", text: "Board 1", href: "#1" },
            { type: "link", text: "Board 2", href: "#2" },
            { type: "link", text: "Board 3", href: "#3" },
          ]}
        />
      }
      splitPanelOpen={splitPanelOpen}
      onSplitPanelToggle={() => {
        toggleSplitPanel();
      }}
      splitPanel={
        editTaskId ? (
          <SplitPanel header={"Edit Task"}>
            <ColumnLayout columns={4}>
              <Form
                actions={
                  <SpaceBetween size="xs" direction="horizontal">
                    <Button>Submit</Button>
                  </SpaceBetween>
                }
              >
                <SpaceBetween size="l">
                  <FormField
                    description="Enter your task heading"
                    label="Task Heading"
                  >
                    <Input
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
                      onChange={({ detail }) =>
                        onChangeTask({ description: detail.value })
                      }
                      value={getTaskFromId(editTaskId)?.description ?? ""}
                    />
                  </FormField>
                  <ToggleButton
                    pressed={getTaskFromId(editTaskId)?.completed ?? false}
                  >
                    Mark as Complete
                  </ToggleButton>
                </SpaceBetween>
              </Form>
            </ColumnLayout>
          </SplitPanel>
        ) : undefined
      }
      content={
        <ContentLayout
          header={
            <Header variant="h1" info={<Link variant="info">Info</Link>}>
              Kanban Board
            </Header>
          }
        >
          <div className="App">
            <MultipleContainers
              containers={containers}
              setContainers={setContainers}
              tasks={tasks}
              setTasks={setTasks}
              itemCount={5}
              strategy={rectSortingStrategy}
              vertical={false}
              startEditingTask={startEditingTask}
            />
          </div>
        </ContentLayout>
      }
    />
  );
}

export default Test;
