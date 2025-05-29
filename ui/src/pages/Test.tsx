import {
  AppLayout,
  ContentLayout,
  Header,
  HelpPanel,
  Link,
  SideNavigation,
  SplitPanel,
} from "@cloudscape-design/components";
import {
  type DragEndEvent,
  type DragOverEvent,
  KeyboardSensor,
  type MeasuringConfiguration,
  MeasuringStrategy,
  PointerSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useEffect, useState } from "react";
import Draggable from "../helper/Draggable";
import "../helper/mainContainer.css";

import {
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { MultipleContainers } from "../multi-container-dnd/src/examples/Sortable/MultipleContainers";

const measuring: MeasuringConfiguration = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

interface Task {
  id: number;
  name: string;
  description: string;
  assignedTo: undefined;
  category: string;
}

interface Tasks {
  [key: string]: Task[];
}

const task1 = {
  id: 1,
  name: "First Task",
  description: "lorem ipsum",
  assignedTo: undefined,
  category: "Milestones",
};

const initalTask: Tasks = {
  Milestones: [
    {
      id: 1,
      name: "First Task",
      description: "lorem ipsum",
      assignedTo: undefined,
      category: "Milestones",
    },
    {
      id: 2,
      name: "Second Task",
      description: "lorem ipsum",
      assignedTo: undefined,
      category: "Milestones",
    },
  ],
  ProtoSec: [
    {
      id: 3,
      name: "third Task",
      description: "lorem ipsum",
      assignedTo: undefined,
      category: "ProtoSec",
    },

    {
      id: 4,
      name: "Fouth Task",
      description: "lorem ipsum",
      assignedTo: undefined,
      category: "ProtoSec",
    },
  ],
};

export type ContainerType = {
  id: UniqueIdentifier;
  name: string;
};

// {"container1": [{id: "1", name: "Task1 Title", {id: "2", name: "Task 2 Title"}}]}
export type ContainerCollection = Record<UniqueIdentifier, ItemType[]>;

export type ItemType = {
  id: UniqueIdentifier;
  name: string;
};

function Test() {
  const [containers, setContainers] = useState<ContainerType[]>([
    { id: "Uncategorised", name: "Uncategorised" },
    { id: "PrioritizedBacklog", name: "Prioritized Backlog" },
    { id: "Backlog", name: "Backlog" },
    { id: "Doing", name: "Doing" },
    { id: "Done", name: "Done" },
  ]);

  const [items, setItems] = useState<ContainerCollection>({
    Uncategorised: [
      { id: "123", name: "Item 1" },
      { id: "A2", name: "Item 2" },
      { id: "A3", name: "Item 3" },
    ],
    PrioritizedBacklog: [],
    Backlog: [],
    Doing: [],
    Done: [],
  });

  useEffect(() => {
    console.log("New Items: ");
    console.log(items);
  }, [items]);

  const [error, setError] = useState<string | null>(null);

  const [editTask, setEditTask] = useState<ItemType>({
    id: "123",
    name: "Make a game",
  });

  function startEditingTask(task: ItemType) {
    console.log('Clicked edit!')
    setEditTask(task);
  }
  // useEffect(() => {
  //   const fetchTaskData = async () => {
  //     try {
  //       const response = await getTasks("test");
  //       setTasks(response);
  //     } catch (error) {
  //       if (error instanceof Error) {
  //         setError(error.message);
  //       }
  //       setError("An unknown error occurred!");
  //     }
  //   };
  //   fetchTaskData();
  // }, []);

  return (
    <AppLayout
      navigation={
        <SideNavigation
          header={{
            href: "#",
            text: "Kanban Board",
          }}
          items={[
            { type: "link", text: "Board 1", href: "#1" },
            { type: "link", text: "Board 2", href: "#2" },
            { type: "link", text: "Board 3", href: "#3" },
          ]}
        />
      }
      splitPanel={
        <SplitPanel header={editTask.name}>Task Description Field</SplitPanel>
      }
      content={
        <ContentLayout
          header={
            <Header variant="h1" info={<Link variant="info">Info</Link>}>
              Kanban Board
            </Header>
          }
        >
          <div className="App">
            <MultipleContainers
              containers={containers}
              setContainers={setContainers}
              items={items}
              setItems={setItems}
              itemCount={5}
              strategy={rectSortingStrategy}
              vertical={false}
              startEditingTask={startEditingTask}
            />
          </div>
        </ContentLayout>
      }
    />
  );
}

export default Test;
