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
  TopNavigation,
  TopNavigationProps,
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
  getUser,
  updateTask,
} from "../api/api";
import type {
  ContainerCollection,
  GetUserResponse,
  TaskType,
} from "../api/auto-generated-client";
import { debounce } from "lodash";
import { useNavigate, useParams } from "react-router-dom";
import "../helper/home.css"

export type ContainerType = {
  id: UniqueIdentifier;
  name: string;
};

enum Mode {
  Light = "light",
  Dark = "dark",
}

function Home() {
  const navigate = useNavigate();
  const params = useParams<{ userId: string }>();
  const userIdBoard = params.userId as string;

  const [boardUsername, setBoardUsername] = useState("undefined");

  const [username, setUsername] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [role, setRole] = useState<string | undefined>(undefined);
  useEffect(() => {
    const localUserId = localStorage.getItem("userId");
    const localUsername = localStorage.getItem("username");
    const localRole = localStorage.getItem("role");
    if (!localUserId || !localUsername || !localRole) {
      navigate("/login");
    }
    setUsername(localUsername!);
    setUserId(localUserId!);
    setRole(localRole!);

    if (!userIdBoard) {
      navigate("/login");
    }
    const fetchUserData = async () => {
      try {
        const response = await getAllUsers();
        if (response.users) {
          const sideNavItems: SideNavigationProps.Link[] = response.users.map(
            (boardUser) => {
              return {
                type: "link",
                text: `${boardUser.username}`,
                href: boardUser.userId,
              };
            }
          );

          // Filter out the current user's board
          const filteredSideNavItems = sideNavItems.filter((navItem) => {
            if (navItem.href === localUserId) {
              return false;
            }
            return true;
          });

          setSideNavItems(filteredSideNavItems);
        }
      } catch (error) {
        console.log("Error occurred trying to fetch all users");
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const getBoardUser = async (): Promise<GetUserResponse> => {
      try {
        const response = await getUser(userIdBoard);
        return response;
      } catch (error) {
        console.error(`Error occurred fetching user: ${error}`);
        throw error;
      }
    };

    const getAndSetBoardUsername = async () => {
      if (userId === undefined) {
        return;
      }
      console.log(`board: ${userIdBoard}`);
      console.log(`user: ${userId}`);
      if (userIdBoard === userId) {
        console.log("This is our board");
        setBoardUsername("Your");
      } else {
        console.log("This is not our board!");
        const user = await getBoardUser();
        console.log("Setting board to display name");
        setBoardUsername(`${user.displayName}'s`);
      }
    };
    getAndSetBoardUsername();
  }, [userId]);

  const [containers, setContainers] = useState<ContainerType[]>([
    { id: "Uncategorised", name: "Uncategorised" },
    { id: "Backlog", name: "Backlog" },
    { id: "PrioritizedBacklog", name: "Prioritized Backlog" },
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

  const [mode, setMode] = useState<Mode>(Mode.Light);

  const [sideNavItems, setSideNavItems] = useState<
    ReadonlyArray<SideNavigationProps.Link>
  >([]);

  // Create a debounced function to update the backend
  const updateBackend = debounce(async (currentTasks: ContainerCollection) => {
    try {
      console.log("Updating tasks");

      const username = localStorage.getItem("username");
      const password = localStorage.getItem("password");
      Object.keys(currentTasks).forEach(async (containerId) => {
        currentTasks[containerId].forEach(
          async (task, index) =>
            await updateTask(
              task.id,
              username!,
              password!,
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
    deleteTaskAPI(userIdBoard, deleteTaskId);

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

  function logout() {
    localStorage.setItem("userId", "");
    localStorage.setItem("username", "");
    localStorage.setItem("password", "");
    localStorage.setItem("role", "");
    navigate("/login");
  }

  const topMenu = (
    username: string
  ): TopNavigationProps.MenuDropdownUtility => {
    return {
      type: "menu-dropdown",
      text: username,
      items: [{ id: "logout", text: "Sign out" }],

      onItemClick: (event) => {
        event.preventDefault();
        if (event.detail.id === "logout") {
          logout();
        }
      },
    };
  };

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        console.log("Fetching task ..");
        const tasks = await getTasks(userIdBoard);
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
    createTaskAPI(userIdBoard, newId, category);
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
  }

  function canEditBoard(): boolean {
    return role === "ADMIN" || userIdBoard === userId;
  }

  return (
    <>
      <TopNavigation
        data-color="red"
        identity={{ title: "Kanban Board", href: "" }}
        utilities={[
          {
            type: "button",
            text: mode === Mode.Light ? "Dark" : "Light",
            onClick: () =>
              setMode(mode === Mode.Light ? Mode.Dark : Mode.Light),
          },
          {
            type: "button",
            text: `Role: ${role}`,
          },
          topMenu(username || "undefined"),
        ]}
      ></TopNavigation>
      <AppLayout
        navigation={
          <SideNavigation
            activeHref={userIdBoard}
            header={{
              href: userId || "undefined",
              text: "Your Board",
            }}
            items={[
              {
                type: "section-group",
                title: "Other Boards",
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
                <Form>
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
                {boardUsername} Board{" "}
                {canEditBoard() ? "(Editable)" : "(Viewable)"}
              </Header>
            }
          >
            <div className="App">
              <MultipleContainers
                canEditBoard={canEditBoard}
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
    </>
  );
}

export default Home;
