import {
  AppLayout,
  Header,
  HelpPanel,
  Modal,
  SideNavigationProps,
} from "@cloudscape-design/components";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import "../helper/mainContainer.css";
import { applyMode, Mode } from "@cloudscape-design/global-styles";
import { debounce } from "lodash";
import { useNavigate, useParams } from "react-router-dom";
import { getAllUsers, getTasks, getUser, updateTask } from "../api/api";
import type {
  ContainerCollection,
  GetUserResponse,
  TaskType,
  User,
} from "../api/auto-generated-client";
import BoardContent from "../components/BoardContent";
import SideNav from "../components/SideNav";
import TaskEditor from "../components/TaskEditor";
import TopNav from "../components/TopNav";
import "../helper/home.css";
import useTaskManagement from "../hooks/useTaskManagement";
import InformationPanel from "../components/InformationPanel";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

export type ContainerType = {
  id: UniqueIdentifier;
  name: string;
};

function Home() {
  const navigate = useNavigate();
  const params = useParams<{ userId: string }>();
  const userIdBoard = params.userId as string;

  const [splitPanelOpen, setSplitPanelOpen] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  function startEditingTask(task: TaskType) {
    setEditTaskId(task.id);
    setSplitPanelOpen(true);
  }

  const {
    tasks,
    setTasks,
    editTaskId,
    containers,
    setContainers,
    onChangeTask,
    deleteTask,
    createTask,
    toggleTaskComplete,
    setTasksChanged,
    tasksChanged,
    setEditTaskId,
  } = useTaskManagement({ userIdBoard, setSplitPanelOpen, startEditingTask });

  const [boardUsername, setBoardUsername] = useState("undefined");

  const [deleteTaskId, setDeleteTaskId] = useState<string | undefined>(
    undefined
  );

  const [displayName, setDisplayName] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [role, setRole] = useState<string | undefined>(undefined);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  useEffect(() => {
    const localUserId = localStorage.getItem("userId");
    const localUsername = localStorage.getItem("username");
    const localRole = localStorage.getItem("role");
    if (!localUserId || !localUsername || !localRole) {
      navigate("/login");
    }
    setUserId(localUserId!);
    setRole(localRole!);

    if (!userIdBoard) {
      navigate("/login");
    }
    const fetchUserData = async () => {
      try {
        const response = await getAllUsers();
        if (response.users) {
          setAllUsers(response.users);
          const sideNavItems: SideNavigationProps.Link[] = response.users.map(
            (boardUser) => {
              return {
                type: "link",
                text: `${boardUser.displayName}`,
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
        console.log(error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const setUserDisplayName = async () => {
      if (!userId) {
        return;
      }
      const user = await getUser(userId);
      setDisplayName(user.displayName);
    };
    setUserDisplayName();
  }, [userId]);

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

  function toggleSplitPanel() {
    setSplitPanelOpen((enable) => !enable);
  }
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>(Mode.Light);

  useEffect(() => {
    applyMode(mode);
  }, [mode]);

  const [sideNavItems, setSideNavItems] = useState<
    Array<SideNavigationProps.Link>
  >([]);

  async function saveTaskChanges() {
    try {
      console.log("Updating tasks");
      Object.keys(tasks).forEach(async (containerId) => {
        tasks[containerId].forEach(
          async (task, index) =>
            await updateTask(
              task.id,
              index,
              task.name,
              task.description,
              task.completed,
              task.assignedTo,
              task.dueDate,
              task.minTime,
              task.maxTime,
              task.importance,
              containerId
            )
        );
      });
      setTasksChanged(false);
    } catch (error) {
      console.error("Failed to update tasks:", error);
    }
  }

  // Create a debounced function to update the backend
  const updateBackend = debounce(async () => {
    saveTaskChanges();
  }, 2000); // Will only fire after 2 seconds of no changes

  // Set up periodic sync if there are changes
  useEffect(() => {
    if (tasksChanged) {
      console.log("Updating backend ...");
      updateBackend();
    }

    return () => {
      // Clean up by canceling any pending debounced calls
      updateBackend.cancel();
    };
  }, [tasks, setTasksChanged]);

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

  function logout() {
    localStorage.setItem("userId", "");
    localStorage.setItem("username", "");
    localStorage.setItem("password", "");
    localStorage.setItem("role", "");
    navigate("/login");
  }

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

  function canEditBoard(): boolean {
    return role?.toLowerCase() === "admin" || userIdBoard === userId;
  }

  return (
    <>
      {deleteTaskId && getTaskFromId(deleteTaskId) && (
        <DeleteConfirmationModal
          task={getTaskFromId(deleteTaskId) as TaskType}
          onConfirm={() => {
            deleteTask(deleteTaskId);
            setDeleteTaskId(undefined);
          }}
          onCancel={() => {
            setDeleteTaskId(undefined);
          }}
        />
      )}

      <TopNav
        displayName={displayName}
        mode={mode}
        setMode={setMode}
        role={role}
        logout={logout}
      />
      <AppLayout
        tools={<InformationPanel />}
        navigation={
          <SideNav
            userId={userId}
            userIdBoard={userIdBoard}
            sideNavItems={sideNavItems}
          />
        }
        splitPanelOpen={splitPanelOpen}
        onSplitPanelToggle={() => {
          toggleSplitPanel();
        }}
        splitPanel={
          editTaskId ? (
            <TaskEditor
              saveTaskChanges={saveTaskChanges}
              canEditBoard={canEditBoard}
              onChangeTask={onChangeTask}
              getTaskFromId={getTaskFromId}
              editTaskId={editTaskId}
              toggleTaskComplete={toggleTaskComplete}
              allUsers={allUsers}
            />
          ) : undefined
        }
        content={
          <BoardContent
            mode={mode}
            boardUsername={boardUsername}
            canEditBoard={canEditBoard}
            toggleTaskComplete={toggleTaskComplete}
            setDeleteTaskId={setDeleteTaskId}
            setTasksChanged={setTasksChanged}
            createTask={createTask}
            containers={containers}
            setContainers={setContainers}
            tasks={tasks}
            setTasks={setTasks}
            startEditingTask={startEditingTask}
          />
        }
      />
    </>
  );
}

export default Home;
