import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type React from "react";

export function SortableItem(props: {
  id: UniqueIdentifier;
  children:
    | string
    | number
    | bigint
    | boolean
    | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
    | Iterable<React.ReactNode>
    | React.ReactPortal
    | Promise<
        | string
        | number
        | bigint
        | boolean
        | React.ReactPortal
        | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
        | Iterable<React.ReactNode>
        | null
        | undefined
      >
    | null
    | undefined;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.children}
    </div>
  );
}
