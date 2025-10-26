import { useDrag } from 'react-dnd';

export enum DRAG_TYPES {
  EVENT = 'event',
  BLOCK = 'block',
}

export type DragType = typeof DRAG_TYPES[keyof typeof DRAG_TYPES];


export interface UseDraggableOptions<TItem> {
  type: DragType;
  buildItem: (monitor?: any) => TItem; // Build the item payload at drag time (keeps it fresh)
}

export function useDraggable<TItem>({ type, buildItem }: UseDraggableOptions<TItem>) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: type,
    item: (monitor) => {
      const item = buildItem(monitor);
      // Augment with grab offset for proper preview positioning
      try {
        const startPointer = monitor.getInitialClientOffset?.();
        const startSource = monitor.getInitialSourceClientOffset?.();
        if (startPointer && startSource && item && typeof item === 'object') {
          (item as any).grabOffsetY = startPointer.y - startSource.y;
          (item as any).grabOffsetX = startPointer.x - startSource.x;
        }
      } catch {}
      return item;
    },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [type, buildItem]);

  return {
    dragRef,
    isDragging,
  } as const;
}