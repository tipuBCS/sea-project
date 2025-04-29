import Board, { BoardProps } from "@cloudscape-design/board-components/board";
import BoardItem, {
  BoardItemProps,
} from "@cloudscape-design/board-components/board-item";
import { Header } from "@cloudscape-design/components";
import { EmptyState } from "./emptyState";
import { Data } from "../pages/Home";
import { Boardi18nStrings } from "../helper/BoardAriaStrings";
import { useState } from "react";

const i18nStrings: BoardItemProps.I18nStrings = {
  dragHandleAriaLabel: "Drag to reposition item",
  dragHandleAriaDescription:
    "Press space or enter to start dragging, arrow keys to move, space or enter to drop",
  resizeHandleAriaLabel: "Resize item",
  resizeHandleAriaDescription:
    "Press space or enter to start resizing, arrow keys to resize, space or enter to confirm",
};

interface BoardItem {
  //
}

export const BoardComponent = () => {
  const [items, setItems] = useState<BoardProps.Item<Data>[]>([
    {
      id: "1",
      rowSpan: 1,
      columnSpan: 2,
      data: { title: "Demo 1", content: "First item" },
    },
    {
      id: "2",
      rowSpan: 1,
      columnSpan: 2,
      data: { title: "Demo 2", content: "Second item" },
    },
    {
      id: "3",
      rowSpan: 1,
      columnSpan: 2,
      data: { title: "Demo 3", content: "Third item" },
    },
  ]);
  return (
    <Board
      renderItem={(item) => (
        <BoardItem
          header={<Header>{(item.data as Data).title}</Header>}
          i18nStrings={i18nStrings}
        >
          {(item.data as Data).content}
        </BoardItem>
      )}
      onItemsChange={(event) => {
        console.log(event);
        setItems([...event.detail.items]);
      }}
      items={items}
      i18nStrings={Boardi18nStrings}
      empty={<EmptyState />}
    />
  );
};
