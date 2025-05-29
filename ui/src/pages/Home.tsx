import {
  AppLayout,
  Button,
  ContentLayout,
  Header,
  HelpPanel,
  Link,
  SideNavigation,
} from "@cloudscape-design/components";
import { useEffect, useMemo, useRef, useState } from "react";
import { type Swapy, createSwapy, utils } from "swapy";
import { getTasks } from "../api/api";
import type { Task } from "../api/auto-generated-client";
import "../helper/mainContainer.css";
import { TaskContainer } from "../helper/TaskContainer";



function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [slotItemMap, setSlotItemMap] = useState(
    utils.initSlotItemMap(tasks, "id")
  );

  const slottedItems = useMemo(
    () => utils.toSlottedItems(tasks, "id", slotItemMap),
    [tasks, slotItemMap]
  );

  useEffect(() => {
    console.log("tasks:");
    console.log(tasks);
  }, [tasks]);

  const [error, setError] = useState<string | null>(null);
  const swapy = useRef<null | Swapy>(null);
  const container = useRef(null);

  const [rows, setRows] = useState([
    "Uncategorised",
    "Milestones",
    "ProtoSec",
    "Backlog",
    "Prioritized Backlog",
  ]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(
    () =>
      utils.dynamicSwapy(
        swapy.current,
        tasks,
        "id",
        slotItemMap,
        setSlotItemMap
      ),
    [tasks]
  );

  useEffect(() => {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    swapy.current = createSwapy(container.current!, {
      manualSwap: true,
      // animation: 'dynamic'
      // autoScrollOnDrag: true,
      // swapMode: 'drop',
      // enabled: true,
      // dragAxis: 'x',
      // dragOnHold: true
    });

    swapy.current.onSwap((event) => {
      console.log(event);
      setSlotItemMap(event.newSlotItemMap.asArray);
    });

    return () => {
      swapy.current?.destroy();
    };
  }, []);

  // useEffect(() => {
  //   const fetchTaskData = async () => {
  //     try {
  //       const response = await getTasks("test");
  //       console.log(response);
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
      tools={<HelpPanel header={<h2>Overview</h2>}>Help content</HelpPanel>}
      content={
        // biome-ignore lint/style/useSelfClosingElements: <explanation>
        <ContentLayout
          header={
            <Header variant="h1" info={<Link variant="info">Info</Link>}>
              Kanban Board
            </Header>
          }
        ></ContentLayout>
      }
    />
  );
}

export default Home;
