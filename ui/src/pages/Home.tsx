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
import { useEffect, useState } from "react";
import "../helper/mainContainer.css";

import { rectSortingStrategy } from "@dnd-kit/sortable";
import { MultipleContainers } from "../multi-container-dnd/src/examples/Sortable/MultipleContainers";
import { createTaskAPI, deleteTaskAPI, getTasks, updateTask } from "../api/api";
import type {
  ContainerCollection,
  TaskType,
} from "../api/auto-generated-client";
import { debounce } from "lodash";

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
  const [tasksChanged, setTasksChanged] = useState(false);

  function toggleSplitPanel() {
    setSplitPanelOpen((enable) => !enable);
  }
  const [error, setError] = useState<string | null>(null);

  const [editTaskId, setEditTaskId] = useState<UniqueIdentifier>();

  const [splitPanelOpen, setSplitPanelOpen] = useState(false);

  // Create a debounced function to update the backend
  const updateBackend = debounce(async (currentTasks: ContainerCollection) => {
    try {
      console.log("Updating tasks");
      await Object.keys(currentTasks).forEach(async (containerId) => {
        await currentTasks[containerId].forEach(async (task, index) => {
          await updateTask(
            task.id,
            USERID,
            index,
            task.name,
            task.description,
            task.completed,
            task.assignedTo,
            containerId
          );
        });
      });
      setTasksChanged(false);
    } catch (error) {
      console.error("Failed to update tasks:", error);
    }
  }, 2000); // Will only fire after 2 seconds of no changes

  // Set up periodic sync if there are changes
  useEffect(() => {
    if (tasksChanged) {
      console.log("Updating backend ...");
      updateBackend(tasks);
    }

    return () => {
      // Clean up by canceling any pending debounced calls
      updateBackend.cancel();
    };
  }, [tasks, setTasksChanged]);

  function startEditingTask(task: TaskType) {
    setEditTaskId(task.id);
    setSplitPanelOpen(true);
  }

  // Function to sort tasks by position
  const sortTasksByPosition = (tasks: TaskType[]): TaskType[] => {
    return [...tasks].sort((a, b) => a.position - b.position);
  };

  // Function to sort all containers in the collection
  const sortContainerCollection = (
    collection: ContainerCollection
  ): ContainerCollection => {
    const sortedCollection: ContainerCollection = {};

    for (const [containerId, tasks] of Object.entries(collection)) {
      sortedCollection[containerId] = sortTasksByPosition(tasks);
    }

    return sortedCollection;
  };

  function deleteTask(deleteTaskId: string) {
    console.log(`RUnning delete task on id: ${deleteTaskId}`);
    setTasksChanged(true);
    deleteTaskAPI(USERID, deleteTaskId);

    setTasks((prevItems) => {
      // Find which container has this item
      const containerId = Object.keys(prevItems).find((containerId) =>
        prevItems[containerId].some((item) => item.id === deleteTaskId)
      );

      if (!containerId) {
        return prevItems; // Item not found in any container
      }

      // Update the item in the found container
      return {
        ...prevItems,
        [containerId]: prevItems[containerId].filter(
          (item) => item.id !== deleteTaskId
        ),
      };
    });
  }

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        console.log("Fetching task ..");
        const tasks = await getTasks(USERID);
        const sortedTasks = sortContainerCollection(tasks);
        setTasks(sortedTasks);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
        setError("An unknown error occurred!");
      }
    };
    fetchTaskData();
  }, []);

  function onChangeTask(updates: Partial<TaskType>) {
    if (!editTaskId) {
      return;
    }
    setTasksChanged(true);
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

  function createTask(category: string) {
    console.log(`Creating task in category: ${category}`);
    const newId = crypto.randomUUID();
    createTaskAPI(USERID, newId, category);
    setTasks((tasks) => {
      const newTask: TaskType = {
        id: newId,
        name: "",
        description: "",
        completed: false,
        createdAt: "",
        position: 1000,
      };

      const taskInCategory = tasks[category] ?? [];

      return { ...tasks, [category]: [...taskInCategory, newTask] };
    });
  }

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
              deleteTask={deleteTask}
              setTasksChanged={setTasksChanged}
              createTask={createTask}
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
