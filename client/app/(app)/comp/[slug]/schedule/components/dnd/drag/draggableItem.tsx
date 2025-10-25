import { useDraggable, DRAG_TYPES } from '../../../hooks/useDraggable';
import type { DragType } from '../../../hooks/useDraggable';

export enum STATE_TYPES {
    AVAILABLE = 'available',
    SCHEDULED = 'scheduled',
    INFINITE = 'infinite',
}

export type State = typeof STATE_TYPES[keyof typeof STATE_TYPES];

export interface DraggableItemProps {
  dragType: DragType;
  state?: State;
  data: any;
  display: React.ReactNode;
}

export const DraggableItem = ({ dragType, state, data, display }: DraggableItemProps) => {
  const { isDragging, dragRef } = useDraggable({
    type: dragType,
    buildItem: () => ({ state, dragType, ...data }),
  });

  return (
    <div ref={dragRef as any} className={`cursor-grab ${isDragging ? 'opacity-50' : ''}`}>
      {display}
    </div>
  );
}