import {
  AppLayout,
  Button,
  ColumnLayout,
  Container,
  ContentLayout,
  Form,
  FormField,
  Header,
  Input,
  Link,
  SideNavigation,
  SideNavigationProps,
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
import {
  createTaskAPI,
  deleteTaskAPI,
  getAllUsers,
  getTasks,
  updateTask,
} from "../api/api";
import type {
  ContainerCollection,
  TaskType,
} from "../api/auto-generated-client";
import { debounce } from "lodash";
import { useNavigate, useParams } from "react-router-dom";
import { assert } from "console";

export type ContainerType = {
  id: UniqueIdentifier;
  name: string;
};

const USERID = "1";

function Home() {
  const navigate = useNavigate();
  const params = useParams<{ userId: string }>();
  const userId = params.userId as string;

  if (!userId) {
    navigate("/login");
    return null;
  }
  const [containers, setContainers] = useState<ContainerType[]>([
    { id: "Uncategorised", name: "Uncategorised" },
    { id: "Backlog", name: "Backlog" },
    { id: "PrioritizedBacklog", name: "Prioritized Backlog" },
    { id: "Doing", name: "Doing" },
    { id: "Done", name: "Done" },
  ]);

  const [tasks, setTasks] = useState<ContainerCollection>({});
  const [tasksChanged, setTasksChanged] = useState(false);
  const [users, setUsers] = useState<string[]>();

  function toggleSplitPanel() {
    setSplitPanelOpen((enable) => !enable);
  }
  const [error, setError] = useState<string | null>(null);

  const [editTaskId, setEditTaskId] = useState<UniqueIdentifier>();

  const [splitPanelOpen, setSplitPanelOpen] = useState(false);

  const [sideNavItems, setSideNavItems] = useState<
    ReadonlyArray<SideNavigationProps.Link>
  >([]);

  // Create a debounced function to update the backend
  const updateBackend = debounce(async (currentTasks: ContainerCollection) => {
    try {
      console.log("Updating tasks");
      Object.keys(currentTasks).forEach(async (containerId) => {
        currentTasks[containerId].forEach(
          async (task, index) =>
            await updateTask(
              task.id,
              userId,
              index,
              task.name,
              task.description,
              task.completed,
              task.assignedTo,
              containerId
            )
        );
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
    deleteTaskAPI(userId, deleteTaskId);

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
    if (editTaskId === deleteTaskId) {
      setSplitPanelOpen(false);
    }
  }

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        console.log("Fetching task ..");
        const tasks = await getTasks(userId);
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

    const fetchUserData = async () => {
      try {
        const response = await getAllUsers();
        if (response.users) {
          // setUsers(response.users);
          const sideNavItems: SideNavigationProps.Link[] = response.users.map(
            (user) => {
              return {
                type: "link",
                text: `${user.username}`,
                href: `${user.userId}`,
              };
            }
          );

          setSideNavItems(sideNavItems);
        }
      } catch (error) {
        console.log("Error occurred trying to fetch all users");
      }
    };
    fetchUserData();
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
    createTaskAPI(userId, newId, category);
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
    setEditTaskId(newId);
  }

  function toggleTaskComplete(taskId: string) {
    setTasksChanged(true);
    setTasks((prevItems) => {
      // Find which container has this item
      const containerId = Object.keys(prevItems).find((containerId) =>
        prevItems[containerId].some((item) => item.id === taskId)
      );

      if (!containerId) {
        return prevItems; // Item not found in any container
      }

      // Update the item in the found container
      return {
        ...prevItems,
        [containerId]: prevItems[containerId].map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        ),
      };
    });
    console.log(tasks);
    console.log("Toggling");
  }

  return (
    <AppLayout
      navigation={
        <SideNavigation
          activeHref={userId}
          header={{
            href: "#",
            text: "Kanban Board",
          }}
          items={[
            {
              type: "section-group",
              title: "User Boards",
              items: [...sideNavItems],
            },
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
                    onChange={() => {
                      editTaskId
                        ? toggleTaskComplete(editTaskId.toString())
                        : null;
                    }}
                    pressed={getTaskFromId(editTaskId)?.completed ?? false}
                  >
                    Mark as{" "}
                    {getTaskFromId(editTaskId)?.completed
                      ? "Incomplete"
                      : "Complete"}
                  </ToggleButton>
                </SpaceBetween>
              </Form>
            </ColumnLayout>
          </SplitPanel>
        ) : undefined
      }
      content={
        <ContentLayout
          defaultPadding
          headerVariant="high-contrast"
          headerBackgroundStyle="linear-gradient(135deg, rgb(255, 99, 71) 3%, rgb(255, 140, 0) 44%, rgb(255, 69, 0) 69%, rgb(255, 20, 147) 94%)"
          header={
            <Header
              variant="h2"
              description="Use this board keep track of your work."
            >
              Kanban Board
            </Header>
          }
        >
          <div className="App">
            <MultipleContainers
              toggleTaskComplete={toggleTaskComplete}
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

export default Home;
