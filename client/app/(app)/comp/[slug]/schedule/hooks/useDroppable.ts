import { useDrop, DropTargetMonitor } from 'react-dnd';
import type { DragType } from './useDraggable';

export interface UseDroppableOptions<TItem> {
  // Array of drag types this drop zone accepts
  accept: DragType | DragType[];
  // Called when an item is dropped - receives item and monitor for position info
  onDrop?: (item: TItem, monitor: DropTargetMonitor) => void;
  // Optional: control whether drops are allowed
  canDrop?: (item: TItem) => boolean;
}

export function useDroppable<TItem>({ accept, onDrop, canDrop }: UseDroppableOptions<TItem>) {
  const [{ isOver, canDropHere }, dropRef] = useDrop(() => ({
    accept,
    drop: (item: TItem, monitor: DropTargetMonitor) => {
      if (onDrop) {
        onDrop(item, monitor);
      }
    },
    canDrop: canDrop ? (item: TItem) => canDrop(item) : undefined,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDropHere: monitor.canDrop(),
    }),
  }), [accept, onDrop, canDrop]);

  return {
    dropRef,
    isOver,
    canDropHere,
  } as const;
}
