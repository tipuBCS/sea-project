import { Dispatch, SetStateAction, useState } from "react";
import { ContainerCollection, TaskType } from "../api/auto-generated-client";
import { UniqueIdentifier } from "@dnd-kit/core";
import { ContainerType } from "../pages/Home";
import { createTaskAPI, deleteTaskAPI } from "../api/api";
import { TaskImportance } from "../api/auto-generated-client/models/TaskImportance";

type Returns = {
  tasks: ContainerCollection;
  setTasks: Dispatch<SetStateAction<ContainerCollection>>;
  editTaskId?: UniqueIdentifier;
  containers: ContainerType[];
  setContainers: Dispatch<SetStateAction<ContainerType[]>>;
  onChangeTask: (updates: Partial<TaskType>) => void;
  deleteTask: (deleteTaskId: string) => void;
  createTask: (category: string) => void;
  toggleTaskComplete: (taskId: string) => void;
  tasksChanged: boolean;
  setTasksChanged: Dispatch<SetStateAction<boolean>>;
  setEditTaskId: Dispatch<SetStateAction<UniqueIdentifier | undefined>>;
};

type useTaskManagementProps = {
  userIdBoard?: string;
  setSplitPanelOpen: React.Dispatch<SetStateAction<boolean>>;
  startEditingTask: (task: TaskType) => void;
};

export default function useTaskManagement({
  userIdBoard,
  setSplitPanelOpen,
  startEditingTask,
}: useTaskManagementProps): Returns {
  const [tasks, setTasks] = useState<ContainerCollection>({});
  const [editTaskId, setEditTaskId] = useState<UniqueIdentifier>();
  const [tasksChanged, setTasksChanged] = useState(false);
  // TO DO: Match the ids to the names, requires reset of all task data?
  const [containers, setContainers] = useState<ContainerType[]>([
    { id: "Uncategorised", name: "Backlog" },
    { id: "Backlog", name: "To Do" },
    { id: "PrioritizedBacklog", name: "In Progress" },
    { id: "Doing", name: "Review" },
    { id: "Done", name: "Completed" },
  ]);

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

  function createTask(category: string) {
    console.log(`Creating task in category: ${category}`);
    const newId = crypto.randomUUID();
    if (!userIdBoard) {
      throw console.error("Tried to create a task with no userIdBoard");
    }
    createTaskAPI(newId, userIdBoard, category);
    setTasks((tasks) => {
      const newTask: TaskType = {
        id: newId,
        name: "",
        description: "",
        completed: false,
        createdAt: "",
        position: 1000,
        minTime: -1,
        maxTime: -1,
        importance: TaskImportance.NONE,
      };

      const taskInCategory = tasks[category] ?? [];
      startEditingTask(newTask);
      return { ...tasks, [category]: [...taskInCategory, newTask] };
    });
  }

  function deleteTask(deleteTaskId: string) {
    console.log(`Running delete task on id: ${deleteTaskId}`);
    setTasksChanged(true);
    deleteTaskAPI(deleteTaskId);

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

  return {
    tasks,
    setTasks,
    editTaskId,
    containers,
    setContainers,
    onChangeTask,
    deleteTask,
    createTask,
    toggleTaskComplete,
    tasksChanged,
    setTasksChanged,
    setEditTaskId,
  };
}
