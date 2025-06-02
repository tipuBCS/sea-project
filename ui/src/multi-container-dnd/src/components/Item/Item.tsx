import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import type { Transform } from "@dnd-kit/utilities";
import classNames from "classnames";
import React, { useEffect, useState } from "react";

import { Handle, Remove } from "./components";

import { Button, Icon } from "@cloudscape-design/components";
import styles from "./Item.module.scss";
import type { TaskType } from "../../../../api/auto-generated-client";

export interface Props {
  toggleTaskComplete: (taskId: string) => void;
  deleteTask: (deleteTaskId: string) => void;
  startEditingTask: (task: TaskType) => void;
  task: TaskType;
  dragOverlay?: boolean;
  color?: string;
  disabled?: boolean;
  dragging?: boolean;
  handle?: boolean;
  handleProps?: any;
  height?: number;
  index?: number;
  fadeIn?: boolean;
  transform?: Transform | null;
  listeners?: DraggableSyntheticListeners;
  sorting?: boolean;
  style?: React.CSSProperties;
  transition?: string | null;
  wrapperStyle?: React.CSSProperties;
  value: React.ReactNode;
  onRemove?(): void;
  renderItem?(args: {
    dragOverlay: boolean;
    dragging: boolean;
    sorting: boolean;
    index: number | undefined;
    fadeIn: boolean;
    listeners: DraggableSyntheticListeners;
    ref: React.Ref<HTMLElement>;
    style: React.CSSProperties | undefined;
    transform: Props["transform"];
    transition: Props["transition"];
    value: Props["value"];
  }): React.ReactElement;
}

export const Item = React.memo(
  React.forwardRef<HTMLLIElement, Props>(
    (
      {
        toggleTaskComplete,
        deleteTask,
        startEditingTask,
        task,
        color,
        dragOverlay,
        dragging,
        disabled,
        fadeIn,
        handle,
        handleProps,
        height,
        index,
        listeners,
        onRemove,
        renderItem,
        sorting,
        style,
        transition,
        transform,
        value,
        wrapperStyle,
        ...props
      },
      ref
    ) => {
      const [itemHovered, setItemHovered] = useState(false);
      const [buttonHovered, setButtonHovered] = useState(false);

      useEffect(() => {
        if (!dragOverlay) {
          return;
        }

        document.body.style.cursor = "grabbing";

        return () => {
          document.body.style.cursor = "";
        };
      }, [dragOverlay]);

      return (
        <li
          onMouseEnter={() => setItemHovered(true)}
          onMouseLeave={() => setItemHovered(false)}
          className={classNames(
            styles.Wrapper,
            fadeIn && styles.fadeIn,
            sorting && styles.sorting,
            dragOverlay && styles.dragOverlay
          )}
          style={
            {
              ...wrapperStyle,
              transition: [transition, wrapperStyle?.transition]
                .filter(Boolean)
                .join(", "),
              "--translate-x": transform
                ? `${Math.round(transform.x)}px`
                : undefined,
              "--translate-y": transform
                ? `${Math.round(transform.y)}px`
                : undefined,
              "--scale-x": transform?.scaleX
                ? `${transform.scaleX}`
                : undefined,
              "--scale-y": transform?.scaleY
                ? `${transform.scaleY}`
                : undefined,
              "--index": index,
              "--color": color,
            } as React.CSSProperties
          }
          ref={ref}
        >
          <div
            className={classNames(
              styles.Item,
              dragging && styles.dragging,
              handle && styles.withHandle,
              dragOverlay && styles.dragOverlay,
              disabled && styles.disabled,
              color && styles.color
            )}
            style={style}
            data-cypress="draggable-item"
            {...(!buttonHovered ? listeners : undefined)}
            {...props}
            tabIndex={!handle ? 0 : undefined}
          >
            <button
              onMouseEnter={() => setButtonHovered(true)}
              onMouseLeave={() => setButtonHovered(false)}
              onClick={(e) => {
                e.stopPropagation();
                toggleTaskComplete(task.id.toString());
              }}
              className={classNames(styles.taskCheckbox)}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                {task.completed ? (
                  <img
                    width="100%"
                    height="100%"
                    src="../../../../GreenCheckmark.png"
                  ></img>
                ) : null}
              </div>
            </button>
            <div className={classNames(styles.ItemText)}>{task.name}</div>

            {itemHovered ? (
              <span
                className={styles.Actions}
                onMouseEnter={() => setButtonHovered(true)}
                onMouseLeave={() => setButtonHovered(false)}
              >
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditingTask(task);
                  }}
                >
                  Edit
                </Button>
                {
                  <Remove
                    className={styles.Remove}
                    onClick={() => {
                      deleteTask(task.id.toString());
                    }}
                  />
                }
              </span>
            ) : null}
          </div>
        </li>
      );
    }
  )
);
