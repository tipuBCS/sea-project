import { ContentLayout, Header } from "@cloudscape-design/components";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import { MultipleContainers } from "../multi-container-dnd/src/examples/Sortable/MultipleContainers";
import { Dispatch, SetStateAction } from "react";
import { ContainerType } from "../pages/Home";
import { ContainerCollection, TaskType } from "../api/auto-generated-client";
import { Mode } from "@cloudscape-design/global-styles";

type BoardContentProps = {
  mode: Mode;
  boardUsername: string;
  canEditBoard: () => boolean;
  toggleTaskComplete: (taskId: string) => void;
  setDeleteTaskId: Dispatch<SetStateAction<string | undefined>>;
  setTasksChanged: Dispatch<SetStateAction<boolean>>;
  createTask: (category: string) => void;
  containers: ContainerType[];
  setContainers: Dispatch<SetStateAction<ContainerType[]>>;
  tasks: ContainerCollection;
  setTasks: Dispatch<SetStateAction<ContainerCollection>>;
  startEditingTask: (task: TaskType) => void;
};

const BoardContent = ({
  mode,
  boardUsername,
  canEditBoard,
  toggleTaskComplete,
  setDeleteTaskId,
  setTasksChanged,
  createTask,
  containers,
  setContainers,
  tasks,
  setTasks,
  startEditingTask,
}: BoardContentProps) => {
  return (
    <ContentLayout
      defaultPadding
      headerVariant="high-contrast"
      headerBackgroundStyle="linear-gradient(135deg, rgb(255, 99, 71) 3%, rgb(255, 140, 0) 44%, rgb(255, 69, 0) 69%, rgb(255, 20, 147) 94%)"
      header={
        <Header
          variant="h2"
          description="Use this board keep track of your work."
        >
          {boardUsername} Board {canEditBoard() ? "(Editable)" : "(Viewable)"}
        </Header>
      }
    >
      <div className="App">
        <MultipleContainers
          mode={mode}
          canEditBoard={canEditBoard}
          toggleTaskComplete={toggleTaskComplete}
          setDeleteTaskId={setDeleteTaskId}
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
  );
};

export default BoardContent;
