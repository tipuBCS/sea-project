import {
  type CancelDrop,
  type CollisionDetection,
  DndContext,
  DragOverlay,
  type DropAnimation,
  type KeyboardCoordinateGetter,
  KeyboardSensor,
  MeasuringStrategy,
  type Modifiers,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  closestCenter,
  defaultDropAnimationSideEffects,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  type AnimateLayoutChanges,
  SortableContext,
  type SortingStrategy,
  arrayMove,
  defaultAnimateLayoutChanges,
  horizontalListSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type React from "react";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { coordinateGetter as multipleContainersCoordinateGetter } from "./multipleContainersKeyboardCoordinates";

import { Container, type ContainerProps, Item } from "../../components";

import type { ContainerType } from "../../../../pages/Home";
import type {
  TaskType,
  ContainerCollection,
} from "../../../../api/auto-generated-client";

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

function DroppableContainer({
  children,
  columns = 1,
  disabled,
  id,
  items,
  style,
  ...props
}: ContainerProps & {
  disabled?: boolean;
  id: UniqueIdentifier;
  items: TaskType[];
  style?: React.CSSProperties;
}) {
  const {
    active,
    attributes,
    isDragging,
    listeners,
    over,
    setNodeRef,
    transition,
    transform,
  } = useSortable({
    id,
    data: {
      type: "container",
      children: items,
    },
    animateLayoutChanges,
  });
  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== "container") ||
      items.some((item) => item.id === over.id)
    : false;

  return (
    <Container
      ref={disabled ? undefined : setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
      }}
      hover={isOverContainer}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      columns={columns}
      {...props}
    >
      {children}
    </Container>
  );
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;

interface Props {
  containers: ContainerType[];
  setContainers: Dispatch<SetStateAction<ContainerType[]>>;
  startEditingTask: (task: TaskType) => void;
  tasks: ContainerCollection;
  setTasks: Dispatch<SetStateAction<ContainerCollection>>;
  adjustScale?: boolean;
  cancelDrop?: CancelDrop;
  columns?: number;
  containerStyle?: React.CSSProperties;
  coordinateGetter?: KeyboardCoordinateGetter;
  getItemStyles?(args: {
    value: UniqueIdentifier;
    index: number;
    overIndex: number;
    isDragging: boolean;
    containerId: UniqueIdentifier;
    isSorting: boolean;
    isDragOverlay: boolean;
  }): React.CSSProperties;
  wrapperStyle?(args: { index: number }): React.CSSProperties;
  itemCount?: number;
  handle?: boolean;
  strategy?: SortingStrategy;
  modifiers?: Modifiers;
  minimal?: boolean;
  trashable?: boolean;
  scrollable?: boolean;
  vertical?: boolean;
}

export const TRASH_ID = "void";
const PLACEHOLDER_ID = "placeholder";
const empty: UniqueIdentifier[] = [];

export function MultipleContainers({
  containers,
  setContainers,
  startEditingTask,
  tasks,
  setTasks,
  adjustScale = false,
  itemCount = 3,
  cancelDrop,
  columns,
  handle = false,
  containerStyle,
  coordinateGetter = multipleContainersCoordinateGetter,
  getItemStyles = () => ({}),
  wrapperStyle = () => ({}),
  minimal = false,
  modifiers,
  strategy = verticalListSortingStrategy,
  trashable = false,
  vertical = false,
  scrollable,
}: Props) {
  const checkIfContainerExists = (searchId: UniqueIdentifier) => {
    return containers.some((container) => container.id === searchId);
  };

  const checkIfTaskContainerContains = (
    tasks: TaskType[],
    searchId: UniqueIdentifier
  ) => {
    return tasks.some((task) => task.id === searchId);
  };

  const getTaskFromId = (searchId: UniqueIdentifier) => {
    const container = containers.find((container) =>
      tasks[container.id].some((task) => task.id === searchId)
    );

    // If we found a container, then find the specific item in that container
    if (container) {
      return tasks[container.id].find((task) => task.id === searchId);
    }
  };

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const isSortingContainer = activeId
    ? checkIfContainerExists(activeId)
    : false;
  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeId && activeId in tasks) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in tasks
          ),
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

      if (overId != null) {
        if (overId === TRASH_ID) {
          // If the intersecting droppable is the trash, return early
          // Remove this if you're not using trashable functionality in your app
          return intersections;
        }

        if (overId in tasks) {
          const containerTasks = tasks[overId];

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerTasks.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  checkIfTaskContainerContains(containerTasks, container.id)
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, tasks]
  );
  const [clonedTasks, setClonedTasks] = useState<ContainerCollection | null>(
    null
  );
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );
  const findContainer = (id: UniqueIdentifier) => {
    if (id in tasks) {
      return id;
    }

    return Object.keys(tasks).find((key) =>
      checkIfTaskContainerContains(tasks[key], id)
    );
  };

  const getIndex = (id: UniqueIdentifier) => {
    const container = findContainer(id);

    if (!container) {
      return -1;
    }

    const index = tasks[container].findIndex((task) => task.id === id);

    return index;
  };

  const onDragCancel = () => {
    if (clonedTasks) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      setTasks(clonedTasks);
    }

    setActiveId(null);
    setClonedTasks(null);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [tasks]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={({ active }) => {
        setActiveId(active.id);
        setClonedTasks(tasks);
      }}
      onDragOver={({ active, over }) => {
        const overId = over?.id;

        if (overId == null || overId === TRASH_ID || active.id in tasks) {
          return;
        }

        const overContainer = findContainer(overId);
        const activeContainer = findContainer(active.id);

        if (!overContainer || !activeContainer) {
          return;
        }

        if (activeContainer !== overContainer) {
          setTasks((tasks) => {
            const activeTasks = tasks[activeContainer];
            const overTasks = tasks[overContainer];

            const overIndex = overTasks.findIndex((task) => task.id === overId);
            const activeIndex = activeTasks.findIndex(
              (task) => task.id === active.id
            );

            let newIndex: number;

            if (overId in tasks) {
              newIndex = overTasks.length + 1;
            } else {
              const isBelowOverTask =
                over &&
                active.rect.current.translated &&
                active.rect.current.translated.top >
                  over.rect.top + over.rect.height;

              const modifier = isBelowOverTask ? 1 : 0;

              newIndex =
                overIndex >= 0 ? overIndex + modifier : overTasks.length + 1;
            }

            recentlyMovedToNewContainer.current = true;

            return {
              ...tasks,
              [activeContainer]: tasks[activeContainer].filter(
                (task) => task.id !== active.id
              ),
              [overContainer]: [
                ...tasks[overContainer].slice(0, newIndex),
                tasks[activeContainer][activeIndex],
                ...tasks[overContainer].slice(
                  newIndex,
                  tasks[overContainer].length
                ),
              ],
            };
          });
        }
      }}
      onDragEnd={({ active, over }) => {
        if (active.id in tasks && over?.id) {
          // Removed - not changing container position or amount
          // setContainers((containers) => {
          //   const activeIndex = containers.indexOf(active.id);
          //   const overIndex = containers.indexOf(over.id);
          //   return arrayMove(containers, activeIndex, overIndex);
          // });
        }

        const activeContainer = findContainer(active.id);

        if (!activeContainer) {
          setActiveId(null);
          return;
        }

        const overId = over?.id;

        if (overId == null) {
          setActiveId(null);
          return;
        }

        if (overId === TRASH_ID) {
          setTasks((tasks) => ({
            ...tasks,
            [activeContainer]: tasks[activeContainer].filter(
              (task) => task.id !== activeId
            ),
          }));
          setActiveId(null);
          return;
        }

        // Removed - Not changing the container position or amount

        // if (overId === PLACEHOLDER_ID) {
        //   const newContainerId = getNextContainerId();

        //   unstable_batchedUpdates(() => {
        //     setContainers((containers) => [...containers, newContainerId]);
        //     setItems((items) => ({
        //       ...items,
        //       [activeContainer]: items[activeContainer].filter(
        //         (id) => id !== activeId
        //       ),
        //       [newContainerId]: [active.id],
        //     }));
        //     setActiveId(null);
        //   });
        //   return;
        // }

        const overContainer = findContainer(overId);

        if (overContainer) {
          const activeIndex = tasks[activeContainer].findIndex(
            (task) => task.id === active.id
          );
          const overIndex = tasks[overContainer].findIndex(
            (task) => task.id === overId
          );

          if (activeIndex !== overIndex) {
            setTasks((tasks) => ({
              ...tasks,
              [overContainer]: arrayMove(
                tasks[overContainer],
                activeIndex,
                overIndex
              ),
            }));
          }
        }

        setActiveId(null);
      }}
      cancelDrop={cancelDrop}
      onDragCancel={onDragCancel}
      modifiers={modifiers}
    >
      <div
        style={{
          display: "inline-grid",
          boxSizing: "border-box",
          padding: 20,
          gridAutoFlow: vertical ? "row" : "column",
        }}
      >
        <SortableContext
          items={[...containers, PLACEHOLDER_ID]}
          strategy={
            vertical
              ? verticalListSortingStrategy
              : horizontalListSortingStrategy
          }
        >
          {containers.map((container) => (
            <DroppableContainer
              key={container.id}
              id={container.id}
              label={container.name}
              columns={columns}
              items={tasks[container.id] ?? []}
              scrollable={scrollable}
              style={containerStyle}
              unstyled={minimal}
            >
              <SortableContext
                items={tasks[container.id] ?? []}
                strategy={strategy}
              >
                {tasks[container.id] &&
                  tasks[container.id].map((task, index) => {
                    return (
                      <SortableItem
                        startEditingTask={startEditingTask}
                        task={task}
                        disabled={isSortingContainer}
                        key={task.id}
                        id={task.id}
                        index={index}
                        handle={handle}
                        style={getItemStyles}
                        wrapperStyle={wrapperStyle}
                        containerId={container.id}
                        getIndex={getIndex}
                      />
                    );
                  })}
              </SortableContext>
            </DroppableContainer>
          ))}
        </SortableContext>
      </div>
      {createPortal(
        <DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
          {activeId
            ? checkIfContainerExists(activeId)
              ? renderContainerDragOverlay(activeId)
              : renderSortableItemDragOverlay(activeId)
            : null}
        </DragOverlay>,
        document.body
      )}
      {trashable && activeId && !checkIfContainerExists(activeId) ? (
        <Trash id={TRASH_ID} />
      ) : null}
    </DndContext>
  );

  function renderSortableItemDragOverlay(id: UniqueIdentifier) {
    const task = getTaskFromId(id);
    if (!task) return;
    return (
      <Item
        startEditingTask={startEditingTask}
        task={task}
        value={id}
        handle={handle}
        style={getItemStyles({
          containerId: findContainer(id) as UniqueIdentifier,
          overIndex: -1,
          index: getIndex(id),
          value: id,
          isSorting: true,
          isDragging: true,
          isDragOverlay: true,
        })}
        color={getColor(id)}
        wrapperStyle={wrapperStyle({ index: 0 })}
        dragOverlay
      />
    );
  }

  function renderContainerDragOverlay(containerId: UniqueIdentifier) {
    return (
      <Container
        label={`Column ${containerId}`}
        columns={columns}
        style={{
          height: "100%",
        }}
        shadow
        unstyled={false}
      >
        {tasks[containerId].map((task, index) => (
          <Item
            startEditingTask={startEditingTask}
            task={task}
            key={task.id}
            value={task.name}
            handle={handle}
            style={getItemStyles({
              containerId,
              overIndex: -1,
              index: getIndex(task.id),
              value: task.id,
              isDragging: false,
              isSorting: false,
              isDragOverlay: false,
            })}
            color={undefined}
            wrapperStyle={wrapperStyle({ index })}
          />
        ))}
      </Container>
    );
  }

  function getNextContainerId() {
    const containerIds = Object.keys(tasks);
    const lastContainerId = containerIds[containerIds.length - 1];

    return String.fromCharCode(lastContainerId.charCodeAt(0) + 1);
  }
}

function getColor(id: UniqueIdentifier) {
  switch (String(id)[0]) {
    case "A":
      return "#7193f1";
    case "B":
      return "#ffda6c";
    case "C":
      return "#00bcd4";
    case "D":
      return "#ef769f";
  }

  return undefined;
}

function Trash({ id }: { id: UniqueIdentifier }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        left: "50%",
        marginLeft: -150,
        bottom: 20,
        width: 300,
        height: 60,
        borderRadius: 5,
        border: "1px solid",
        borderColor: isOver ? "red" : "#DDD",
      }}
    >
      Drop here to delete
    </div>
  );
}

interface SortableItemProps {
  startEditingTask: (task: TaskType) => void;
  task: TaskType;
  containerId: UniqueIdentifier;
  id: UniqueIdentifier;
  index: number;
  handle: boolean;
  disabled?: boolean;
  style(args: any): React.CSSProperties;
  getIndex(id: UniqueIdentifier): number;
  wrapperStyle({ index }: { index: number }): React.CSSProperties;
}

function SortableItem({
  startEditingTask,
  task,
  disabled,
  id,
  index,
  handle,
  style,
  containerId,
  getIndex,
  wrapperStyle,
}: SortableItemProps) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    isDragging,
    isSorting,
    over,
    overIndex,
    transform,
    transition,
  } = useSortable({
    id,
  });
  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;

  return (
    <Item
      startEditingTask={startEditingTask}
      ref={disabled ? undefined : setNodeRef}
      value={id}
      task={task}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      handleProps={handle ? { ref: setActivatorNodeRef } : undefined}
      index={index}
      wrapperStyle={wrapperStyle({ index })}
      style={style({
        index,
        value: id,
        isDragging,
        isSorting,
        overIndex: over ? getIndex(over.id) : overIndex,
        containerId,
      })}
      color={getColor(id)}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
    />
  );
}

function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}
