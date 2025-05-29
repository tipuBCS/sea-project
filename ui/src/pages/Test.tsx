import {
  AppLayout,
  type AppLayoutProps,
  Button,
  ColumnLayout,
  Container,
  ContentLayout,
  Form,
  FormField,
  Header,
  Input,
  Link,
  SideNavigation,
  SpaceBetween,
  SplitPanel,
  Textarea,
  ToggleButton,
} from "@cloudscape-design/components";
import {
  type MeasuringConfiguration,
  MeasuringStrategy,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { useEffect, useState } from "react";
import "../helper/mainContainer.css";

import { rectSortingStrategy } from "@dnd-kit/sortable";
import { MultipleContainers } from "../multi-container-dnd/src/examples/Sortable/MultipleContainers";
import type { NonCancelableEventHandler } from "@cloudscape-design/components/internal/events";
import { BaseChangeDetail } from "@cloudscape-design/components/input/interfaces";

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
  description: string;
  completed: boolean;
  assigned?: string;
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
      {
        id: "123",
        name: "Item 1",
        description: "First item description",
        completed: false,
      },
      {
        id: "A2",
        name: "Item 2",
        description: "Second Item description",
        completed: false,
      },
      {
        id: "A3",
        name: "Item 3",
        description: "Third Item description",
        completed: false,
      },
    ],
    PrioritizedBacklog: [],
    Backlog: [],
    Doing: [],
    Done: [],
  });

  function toggleSplitPanel() {
    setSplitPanelOpen((enable) => !enable);
  }
  const [error, setError] = useState<string | null>(null);

  const [editTaskId, setEditTaskId] = useState<UniqueIdentifier>();

  const [splitPanelOpen, setSplitPanelOpen] = useState(false);

  function startEditingTask(task: ItemType) {
    console.log("Clicked edit!");
    setEditTaskId(task.id);
    setSplitPanelOpen(true);
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

  function onChangeTask(updates: Partial<ItemType>) {
    if (!editTaskId) {
      return;
    }
    setItems((prevItems) => {
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

  function getTaskFromId(id: UniqueIdentifier): ItemType | undefined {
    // Find which container has this item
    const containerId = Object.keys(items).find((containerId) =>
      items[containerId].some((item) => item.id === id)
    );

    if (!containerId) {
      return undefined; // Item not found in any container
    }
    return items[containerId].find((item) => item.id === id);
  }

  // // Update The currently edited task
  // useEffect(() => {
  //   // Update the task
  //   setEditTask((task) => {
  //     if (!task) {
  //       return;
  //     }
  //   });
  // }, [items]);

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
      splitPanelOpen={splitPanelOpen}
      onSplitPanelToggle={() => {
        toggleSplitPanel();
      }}
      splitPanel={
        editTaskId ? (
          <SplitPanel header={"Edit Task"}>
            <ColumnLayout columns={4}>
              <Form
                actions={
                  <SpaceBetween size="xs" direction="horizontal">
                    <Button>Submit</Button>
                  </SpaceBetween>
                }
              >
                <SpaceBetween size="l">
                  <FormField
                    description="Enter your task heading"
                    label="Task Heading"
                  >
                    <Input
                      onChange={({ detail }) =>
                        onChangeTask({ name: detail.value })
                      }
                      value={getTaskFromId(editTaskId)?.name ?? ''}
                    />
                  </FormField>
                  <FormField
                    description="Enter your task description"
                    label="Task Description"
                  >
                    <Textarea
                      onChange={({ detail }) =>
                        onChangeTask({ description: detail.value })
                      }
                      value={getTaskFromId(editTaskId)?.description ?? ''}
                    />
                  </FormField>
                  <ToggleButton pressed={getTaskFromId(editTaskId)?.completed ?? false}>
                    Mark as Complete
                  </ToggleButton>
                </SpaceBetween>
              </Form>
            </ColumnLayout>
          </SplitPanel>
        ) : undefined
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
