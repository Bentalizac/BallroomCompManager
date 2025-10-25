import { useDrop } from 'react-dnd';
import type { DragType } from './useDraggable';

export interface UseDroppableOptions<TItem> {
  // Array of drag types this drop zone accepts
  accept: DragType | DragType[];
  // Called when an item is dropped
  onDrop?: (item: TItem) => void;
  // Optional: control whether drops are allowed
  canDrop?: (item: TItem) => boolean;
}

export function useDroppable<TItem>({ accept, onDrop, canDrop }: UseDroppableOptions<TItem>) {
  const [{ isOver, canDropHere }, dropRef] = useDrop(() => ({
    accept,
    drop: (item: TItem) => {
      if (onDrop) {
        onDrop(item);
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
