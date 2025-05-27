import type { JSX } from "react";
import type { Task } from "../api/auto-generated-client";
import "./task.css";

export const TaskContainer = ({
  SlotId,
  ItemId,
  TaskItem,
}: {
  SlotId: string;
  ItemId: string;
  TaskItem: Task;
}): JSX.Element => (
  <div key={SlotId} data-swapy-slot={SlotId}>
    <div key={ItemId} data-swapy-item={ItemId}>
      <div className="task-container">{TaskItem.name}</div>
    </div>
  </div>
);

export const PlaceholderTaskContainer = ({
  id,
}: {
  id: string;
}): JSX.Element => (
  <div key={id} data-swapy-slot={id}>
    <div data-swapy-item={id}>
      <div className="task-container" />
    </div>
  </div>
);
