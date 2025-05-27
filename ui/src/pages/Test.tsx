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
  title: string;
  isEmpty?: boolean;
};

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
  },
  {
    id: "1",
    title: "1",
    type: "Task",
  },
  {
    id: "2",
    title: "2",
    type: "Task",
  },
  {
    id: "3",
    title: "3",
    type: "Task",
  },
  {
    id: "5",
    title: "5",
    type: "Task",
  },
  {
    id: "6",
    title: "6",
    type: "Task",
  },
];

let id = 4;

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
      // animation: 'dynamic'
      // autoScrollOnDrag: true,
      // swapMode: 'drop',
      // enabled: true,
      // dragAxis: 'x',
      // dragOnHold: true
    });

    swapyRef.current.onSwap((event) => {
      setSlotItemMap(event.newSlotItemMap.asArray);
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
          <div ref={containerRef}>
            <div className="items">
              {rows.map((row) => {
                return <div key={row.id}>{row.name}</div>;
              })}
            </div>
            <div className="items">
              {slottedItems.map(({ slotId, itemId, item }) => (
                <div className="slot" key={slotId} data-swapy-slot={slotId}>
                  {item && (
                    <div className="item" data-swapy-item={itemId} key={itemId}>
                      <span>{item.id}</span>
                      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                      <span
                        className="delete"
                        data-swapy-no-drag
                        onClick={() => {
                          setItems(items.filter((i) => i.id !== item.id));
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div
              className="item item--add"
              onClick={() => {
                const newItem: Item = {
                  id: `${id}`,
                  title: `${id}`,
                  type: "Task",
                };
                setItems([...items, newItem]);
                id++;
              }}
            >
              +
            </div>
          </div>
        </ContentLayout>
      }
    />
  );
}

export default Test;
