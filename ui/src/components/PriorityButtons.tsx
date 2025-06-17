import { SpaceBetween } from "@cloudscape-design/components";
import { TaskImportance } from "../api/auto-generated-client";
import "../helper/priorityButtons.css";

export interface PriorityButtonsProps {
  selected: TaskImportance;
  onChange: (priority: TaskImportance) => void;
  canEditBoard: () => boolean;
}

const PriorityButtons = ({
  selected,
  onChange,
  canEditBoard,
}: PriorityButtonsProps) => {
  const getButtonClasses = (priority: TaskImportance) => {
    const baseClass = "priority-button";
    const priorityClass = `priority-${priority.toLowerCase()}`;
    const selectedClass = selected === priority ? "selected" : "";
    const disabledClass = !canEditBoard() ? "disabled" : "";
    return `${baseClass} ${priorityClass} ${selectedClass} ${disabledClass}`.trim();
  };

  return (
    <SpaceBetween direction={"horizontal"} size={"l"}>
      <button
        onClick={() => onChange(TaskImportance.NONE)}
        className={getButtonClasses(TaskImportance.NONE)}
        disabled={!canEditBoard()}
      >
        None
      </button>
      <button
        onClick={() => onChange(TaskImportance.LOW)}
        className={getButtonClasses(TaskImportance.LOW)}
        disabled={!canEditBoard()}
      >
        Low
      </button>
      <button
        onClick={() => onChange(TaskImportance.MEDIUM)}
        className={getButtonClasses(TaskImportance.MEDIUM)}
        disabled={!canEditBoard()}
      >
        Medium
      </button>
      <button
        onClick={() => onChange(TaskImportance.HIGH)}
        className={getButtonClasses(TaskImportance.HIGH)}
        disabled={!canEditBoard()}
      >
        High
      </button>
    </SpaceBetween>
  );
};

export default PriorityButtons;
