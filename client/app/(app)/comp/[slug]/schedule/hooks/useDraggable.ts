import { useDrag } from 'react-dnd';

export enum DRAG_TYPES {
  EVENT = 'event',
  BLOCK = 'block',
}

export type DragType = typeof DRAG_TYPES[keyof typeof DRAG_TYPES];


export interface UseDraggableOptions<TItem> {
  type: DragType;
  buildItem: () => TItem; // Build the item payload at drag time (keeps it fresh)
}

export function useDraggable<TItem>({ type, buildItem }: UseDraggableOptions<TItem>) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: type,
    item: () => (buildItem()), // react-dnd allows item as a function to lazily read latest data
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [type, buildItem]);

  return {
    dragRef,
    isDragging,
  } as const;
}