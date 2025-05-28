import {
  AppLayout,
  ContentLayout,
  Header,
  HelpPanel,
  Link,
  SideNavigation,
} from "@cloudscape-design/components";
import { useEffect, useMemo, useRef, useState } from "react";
import { type SlotItemMapArray, type Swapy, createSwapy, utils } from "swapy";
import "../helper/mainContainer.css";
import "./TestStyle.css";

type RowPlaceholder = {
  type: "RowPlaceHolder";
  id: string;
  name: string;
};

type Item = {
  type: "Task";
  id: string;
  category: Category;
  index: number;
  title: string;
};

type Category = "First" | "Second" | "Third" | "Fourth" | "Fifth"

const rows: RowPlaceholder[] = [ 
  { type: "RowPlaceHolder", id: "row-1", name: "First" },
  { type: "RowPlaceHolder", id: "row-2", name: "Second" },
  { type: "RowPlaceHolder", id: "row-3", name: "Third" },
  { type: "RowPlaceHolder", id: "row-4", name: "Forth" },
  { type: "RowPlaceHolder", id: "row-5", name: "Fifth" },
];

const initialItems: Item[] = [
  {
      id: "0",
      title: "0",
      type: "Task",
      category: "First",
      index: 0
  },
  {
      id: "1",
      title: "1",
      type: "Task",
      category: "First",
      index: 0
  },
  {
      id: "2",
      title: "2",
      type: "Task",
      category: "Second",
      index: 0
  },
  {
      id: "3",
      title: "3",
      type: "Task",
      category: "Fifth",
      index: 0
  },
  {
      id: "5",
      title: "5",
      type: "Task",
      category: "Fifth",
      index: 0
  },
  {
      id: "6",
      title: "6",
      type: "Task",
      category: "Fourth",
      index: 0
  },
];

function itemToSwapySlots(items: Item[]) {
    // For each 'category' make 5 swapy slots
    
}

function Test() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [swappySlots, setSwappySlots] = useState<Item[]>(items);
  const [slotItemMap, setSlotItemMap] = useState<SlotItemMapArray>(
    utils.initSlotItemMap(swappySlots, "id")
  );
  const slottedItems = useMemo(
    () => utils.toSlottedItems(swappySlots, "id", slotItemMap),
    [swappySlots, slotItemMap]
  );

  const swapyRef = useRef<Swapy | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(
    () =>
      utils.dynamicSwapy(
        swapyRef.current,
        swappySlots,
        "id",
        slotItemMap,
        setSlotItemMap
      ),
    [swappySlots]
  );

  useEffect(() => {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    swapyRef.current = createSwapy(containerRef.current!, {
      manualSwap: true,
      //   animation: 'dynamic'
      autoScrollOnDrag: true,
      swapMode: "hover",
      // enabled: true,
      // dragAxis: 'x',
      //   dragOnHold: true
    });

    swapyRef.current.onSwapStart((event) => {
      console.log(event);
    });

    swapyRef.current.onSwap((event) => {
      //   setSlotItemMap(event.newSlotItemMap.asArray);
      console.log(event);
    });

    return () => {
      swapyRef.current?.destroy();
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
          <div ref={containerRef} className="kanban-board">
            <div className="column" id="todo">
              To Do
            </div>

            <div className="column" id="Backlog">
              Backlog
            </div>

            <div className="column" id="in-progress">
              In Progress
            </div>

            <div className="column" id="in-progress2">
              In Progress2
            </div>

            <div className="column" id="in-progress3">
              In Progress3
            </div>
            {slottedItems.map(({ slotId, itemId, item: taskItem }) => {
              return (
                <div className="slot" key={slotId} data-swapy-slot={slotId}>
                  <div className="item" data-swapy-item={itemId} key={itemId}>
                    <span>Task3</span>
                  </div>
                </div>
              );
            })}
          </div>
        </ContentLayout>
      }
    />
  );
}

export default Test;
