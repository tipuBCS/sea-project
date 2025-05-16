import {
  AppLayout,
  ColumnLayout,
  Container,
  ContentLayout,
  Header,
  HelpPanel,
  Link,
  SideNavigation,
} from "@cloudscape-design/components";
import { useEffect, useRef, useState } from "react";
import { type Swapy, createSwapy } from "swapy";
import { type TTask, getTasks } from "../api/task-data";
import { Task } from "../helper/Task";

export interface Data {
  title: string;
  content: string;
}

function Home() {
  const [tasks, setTasks] = useState<TTask[]>(() => getTasks());
  const swapy = useRef<null | Swapy>(null);
  const container = useRef(null);

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
            <ColumnLayout columns={4}>
              <Container>
                {tasks.map((taskItem: TTask) => (
                  <Task key={taskItem.id} task={taskItem} />
                ))}
              </Container>
              <Container>
                <Task key={"test"} task={{ content: "usefulness", id:'test1', status:'done' }} />
                <Task key={"tes2"} task={{ content: "stuff and things", id:'test2', status:'done' }} />
                <Task key={"tes3"} task={{ content: "value", id:'test3', status:'done' }} />
                <Task key={"test4"} task={{ content: "abc", id:'test4', status:'done' }} />
              </Container>
              <Container>Test</Container>
              <Container>Test</Container>
            </ColumnLayout>
          </div>
        </ContentLayout>
      }
    />
  );
}

export default Home;
