import {
  AppLayout,
  ContentLayout,
  Header,
  HelpPanel,
  Link,
  SideNavigation,
} from "@cloudscape-design/components";
import { useEffect, useRef, useState } from "react";
import { type Swapy, createSwapy } from "swapy";
import { getTasks } from "../api/api";
import type { Task } from "../api/auto-generated-client";
import "../helper/mainContainer.css";
import { TaskContainer } from "../helper/TaskContainer";

function Home() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const swapy = useRef<null | Swapy>(null);
  const container = useRef(null);
  const enabled = true;

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const response = await getTasks("test");
        setTasks(response);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
        setError("An unknown error occured!");
      }
    };
    fetchTaskData();
  }, []);

  const [rows, setRows] = useState([
    "Milestones",
    "ProtoSec",
    "Backlog",
    "Prioritized Backlog",
  ]);

  useEffect(() => {
    // If container element is loaded
    if (container.current) {
      swapy.current = createSwapy(container.current);

      // Your event listeners
      swapy.current.onSwap((event) => {
        console.log("swap", event);
      });
    }

    return () => {
      // Destroy the swapy instance on component destroy
      swapy.current?.destroy();
    };
  }, []);

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
          <div ref={container}>
            {tasks === null ? (
              <div>Loading</div>
            ) : (
              <div className="columns">
                <div key={"Uncategorised"}>
                  <div key={"Uncategorised"} className="mainContainer">
                    Uncategorised
                    {tasks.map((taskItem) =>
                      !rows.includes(taskItem.category) ? (
                        <TaskContainer key={taskItem.id} TaskItem={taskItem} />
                      ) : null
                    )}
                  </div>
                </div>
                {rows.map((row) => (
                  <div key={row}>
                    <div key={row} className="mainContainer">
                      {row}
                      {tasks.map((taskItem) =>
                        taskItem.category === row ? (
                          <TaskContainer
                            key={taskItem.id}
                            TaskItem={taskItem}
                          />
                        ) : null
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ContentLayout>
      }
    />
  );
}

export default Home;
