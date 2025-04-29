import { BoardProps } from "@cloudscape-design/board-components/board";

export const Boardi18nStrings: BoardProps.I18nStrings<any> = {
    // Announce when drag and drop operations start
    liveAnnouncementDndStarted: (operationType: BoardProps.DndOperationType) => {
      const operations = {
        reorder: "Started reordering item",
        resize: "Started resizing item",
        insert: "Started inserting new item"
      };
      return operations[operationType];
    },
  
    // Announce item reordering
    liveAnnouncementDndItemReordered: (operation: BoardProps.DndReorderState<any>) => {
      const { direction, conflicts, disturbed } = operation;
      const conflictCount = conflicts.length;
      const disturbedCount = disturbed.length;
      
      return `Moving ${direction === 'horizontal' ? 'left/right' : 'up/down'}. ` +
             `${conflictCount ? `Conflicts with ${conflictCount} items. ` : ''}` +
             `${disturbedCount ? `Will affect ${disturbedCount} other items.` : ''}`;
    },
  
    // Announce item resizing
    liveAnnouncementDndItemResized: (operation: BoardProps.DndResizeState<any>) => {
      const { direction, isMinimalColumnsReached, isMinimalRowsReached, disturbed } = operation;
      const disturbedCount = disturbed.length;
      
      return `Resizing ${direction === 'horizontal' ? 'width' : 'height'}. ` +
             `${isMinimalColumnsReached ? 'Minimum width reached. ' : ''}` +
             `${isMinimalRowsReached ? 'Minimum height reached. ' : ''}` +
             `${disturbedCount ? `Will affect ${disturbedCount} other items.` : ''}`;
    },
  
    // Announce item insertion
    liveAnnouncementDndItemInserted: (operation: BoardProps.DndInsertState<any>) => {
      const { conflicts, disturbed } = operation;
      const conflictCount = conflicts.length;
      const disturbedCount = disturbed.length;
      
      return `Inserting item. ` +
             `${conflictCount ? `Conflicts with ${conflictCount} items. ` : ''}` +
             `${disturbedCount ? `Will affect ${disturbedCount} other items.` : ''}`;
    },
  
    // Announce operation commitment
    liveAnnouncementDndCommitted: (operationType: BoardProps.DndOperationType) => {
      const operations = {
        reorder: "Item reordering completed",
        resize: "Item resizing completed",
        insert: "Item insertion completed"
      };
      return operations[operationType];
    },
  
    // Announce operation discard
    liveAnnouncementDndDiscarded: (operationType: BoardProps.DndOperationType) => {
      const operations = {
        reorder: "Item reordering cancelled",
        resize: "Item resizing cancelled",
        insert: "Item insertion cancelled"
      };
      return operations[operationType];
    },
  
    // Announce item removal
    liveAnnouncementItemRemoved: (operation: BoardProps.ItemRemovedState<any>) => {
      const { disturbed } = operation;
      const disturbedCount = disturbed.length;
      
      return `Item removed. ` +
             `${disturbedCount ? `Affected ${disturbedCount} other items.` : ''}`;
    },
  
    // Deprecated properties
    navigationAriaLabel: "Board navigation",
    navigationAriaDescription: "Use arrow keys to navigate between items",
    navigationItemAriaLabel: (item) => 
      item ? `Board item ${item.id}` : "Empty board cell"
  };