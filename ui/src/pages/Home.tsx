import { useState } from "react";
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
import { BoardProps } from "@cloudscape-design/board-components/board";
import { BoardComponent } from "../components/Board";

export interface Data {
  title: string;
  content: string;
}

function Home() {
  return (
    <AppLayout
      navigation={
        <SideNavigation
          header={{
            href: "#",
            text: "Kanban Board",
          }}
          items={[
            { type: "link", text: `Board 1`, href: `#1` },
            { type: "link", text: `Board 2`, href: `#2` },
            { type: "link", text: `Board 3`, href: `#3` },
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
          <Container>
            <ColumnLayout columns={4}>
              {BoardComponent()}
              {BoardComponent()}
            </ColumnLayout>
          </Container>
        </ContentLayout>
      }
    />
  );
}

export default Home;
