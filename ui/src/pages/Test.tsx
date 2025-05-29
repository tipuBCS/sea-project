import {
  AppLayout,
  ContentLayout,
  Header,
  HelpPanel,
  Link,
  SideNavigation,
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
import { useState } from "react";
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

function Test() {
  const [Tasks1, SetTasks1] = useState(["A2", "A1"]);
  const [Tasks2, SetTasks2] = useState(["B1", "B2"]);

  const [items, setItems] = useState<UniqueIdentifier[]>([1, 2, 3]);
  const [tasks, setTasks] = useState(initalTask);
  const [rows, setRows] = useState([
    "Uncategorised",
    "Milestones",
    "ProtoSec",
    "Backlog",
    "Prioritized Backlog",
  ]);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const containers = ["A", "B", "C"];
  const [parent, setParent] = useState(null);
  const draggableMarkup = <Draggable id="draggable">Drag me</Draggable>;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    console.log(event);
    console.log(`Active: ${active.id}`);
    console.log(`Over: ${over?.id}`);
    if (!over) {
      return;
    }
    if (active.id !== over.id) {
      // setTasks((tasks) => {
      //   const oldIndex = items.indexOf(active.id);
      //   const newIndex = items.indexOf(over.id);
      //   return arrayMove(tasks, oldIndex, newIndex);
      // });
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    console.log(event);
    console.log(`Active: ${active.id}`);
    console.log(`Over: ${over?.id}`);
  }

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
      tools={<HelpPanel header={<h2>Overview</h2>}>Help content</HelpPanel>}
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
              itemCount={5}
              strategy={rectSortingStrategy}
              vertical
            />
          </div>
        </ContentLayout>
      }
    />
  );
}

// <DndContext
//   onDragEnd={handleDragEnd}
//   onDragOver={handleDragOver}
//   collisionDetection={closestCenter}
//   measuring={measuring}
// >
//   <div className="columns">
//     <SortableContext
//       items={Tasks1}
//       strategy={verticalListSortingStrategy}
//     >
//       <div className="mainContainer">
//         Container 1
//         <Droppable id={"Task1 Droppable"}>
//           {Tasks1.map((task) => {
//             return (
//               <SortableItem key={task} id={task}>
//                 <TaskContainer TaskItem={{ id: task, name: task }} />
//               </SortableItem>
//             );
//           })}
//         </Droppable>
//       </div>
//     </SortableContext>

//     <div className="mainContainer">Container 2</div>
//   </div>
//   {/* <div key="columns" className="columns">
//     {rows.map((row) => {
//       const rowItems: Task[] = [];
//       if (row in tasks) {
//         tasks[row].map((task) => {
//           rowItems.push(task);
//         });
//       }
//       return (
//         <div key={row}>
//           <div key={row} className="mainContainer">
//             {row}
//             <SortableContext
//               items={rowItems}
//               strategy={verticalListSortingStrategy}
//             >
//               {rowItems.map((task) => {
//                 return (
//                   <SortableItem key={task.id} id={task.id}>
//                     <TaskContainer TaskItem={task} />
//                   </SortableItem>
//                 );
//               })}
//             </SortableContext>

//             <Button onClick={() => {}}>Add</Button>
//           </div>
//         </div>
//       );
//     })}
//   </div> */}
// </DndContext>

export default Test;
