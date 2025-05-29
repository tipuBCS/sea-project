import type { JSX } from "react";
import type { Task } from "../api/auto-generated-client";
import "./task.css";

export const TaskContainer = ({
  TaskItem,
}: {
  TaskItem: Task;
}): JSX.Element => <div className="task-container">{TaskItem.name}</div>;
