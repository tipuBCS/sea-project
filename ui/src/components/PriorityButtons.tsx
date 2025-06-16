import { SpaceBetween } from "@cloudscape-design/components";
import { TaskImportance } from "../api/auto-generated-client";
import "../helper/priorityButtons.css";

export interface PriorityButtonsProps {
  selected: TaskImportance;
  onChange: (priority: TaskImportance) => void;
}
const PriorityButtons = ({ selected, onChange }: PriorityButtonsProps) => {
  const getButtonClasses = (priority: TaskImportance) => {
    const baseClass = "priority-button";
    const priorityClass = `priority-${priority.toLowerCase()}`;
    const selectedClass = selected === priority ? "selected" : "";
    return `${baseClass} ${priorityClass} ${selectedClass}`.trim();
  };

  return (
    <SpaceBetween direction={'horizontal'} size={"l"}>
      <button
        onClick={() => onChange(TaskImportance.NONE)}
        className={getButtonClasses(TaskImportance.NONE)}
      >
        None
      </button>
      <button
        onClick={() => onChange(TaskImportance.LOW)}
        className={getButtonClasses(TaskImportance.LOW)}
      >
        Low
      </button>
      <button
        onClick={() => onChange(TaskImportance.MEDIUM)}
        className={getButtonClasses(TaskImportance.MEDIUM)}
      >
        Medium
      </button>
      <button
        onClick={() => onChange(TaskImportance.HIGH)}
        className={getButtonClasses(TaskImportance.HIGH)}
      >
        High
      </button>
    </SpaceBetween>
  );
};

export default PriorityButtons;
