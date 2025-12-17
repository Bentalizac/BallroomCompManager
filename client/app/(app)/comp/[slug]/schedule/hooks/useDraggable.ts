import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useEffect } from 'react';

export enum DRAG_TYPES {
  EVENT = 'event',
  BLOCK = 'block',
}

export type DragType = typeof DRAG_TYPES[keyof typeof DRAG_TYPES];


export interface UseDraggableOptions<TItem> {
  type: DragType;
  buildItem: (monitor?: unknown) => TItem; // Build the item payload at drag time (keeps it fresh)
}

export function useDraggable<TItem>({ type, buildItem }: UseDraggableOptions<TItem>) {
  const [{ isDragging }, dragRef, preview] = useDrag(() => ({
    type: type,
    item: (monitor) => {
      const item = buildItem(monitor);
      // Augment with grab offset for proper preview positioning
      try {
        const startPointer = monitor.getInitialClientOffset?.();
        const startSource = monitor.getInitialSourceClientOffset?.();
        if (startPointer && startSource && item && typeof item === 'object') {
          (item as Record<string, unknown>).grabOffsetY = startPointer.y - startSource.y;
          (item as Record<string, unknown>).grabOffsetX = startPointer.x - startSource.x;
        }
      } catch {}
      return item;
    },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [type, buildItem]);

  // Hide the default browser drag preview so only our CustomDragLayer shows
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  return {
    dragRef,
    isDragging,
  } as const;
}