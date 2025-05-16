import "./task.css";
import type { JSX } from "react";
import type { TTask } from "../api/task-data";

interface TaskProps {
  task: TTask;
}

export const Task = ({task}: TaskProps): JSX.Element => (
  <div key={task.id} data-swapy-slot={task.id}>
    <div data-swapy-item={task.id}>
      <div className="container">{task.content}</div>
    </div>
  </div>
);
