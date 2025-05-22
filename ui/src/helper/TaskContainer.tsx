import type { JSX } from "react";
import type { Task } from "../api/auto-generated-client";
import "./task.css";

export const TaskContainer = ({
  TaskItem,
}: {
  TaskItem: Task;
}): JSX.Element => (
  <div key={TaskItem.id} data-swapy-slot={TaskItem.id}>
    <div data-swapy-item={TaskItem.id}>
      <div className="container">{TaskItem.name}</div>
    </div>
  </div>
);
