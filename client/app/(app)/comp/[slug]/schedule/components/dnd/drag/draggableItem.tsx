import { useDraggable } from '../../../hooks/useDraggable';
import type { DragType } from '../../../hooks/useDraggable';

export enum STATE_TYPES {
    AVAILABLE = 'available',
    SCHEDULED = 'scheduled',
    INFINITE = 'infinite',
    IN_BLOCK = 'in_block',
}

export type State = typeof STATE_TYPES[keyof typeof STATE_TYPES];

export interface DraggableItemProps {
  dragType: DragType;
  state?: State;
  data: Record<string, unknown>;
  display: React.ReactNode;
  className?: string;
}

export const DraggableItem = ({ dragType, state, data, display, className }: DraggableItemProps) => {
  const { isDragging, dragRef } = useDraggable({
    type: dragType,
    buildItem: () => ({ state, dragType, ...data }),
  });

  return (
    <div ref={dragRef as unknown as React.Ref<HTMLDivElement>} className={`cursor-grab ${isDragging ? 'opacity-20' : ''} ${className ?? ''}`}>
      {display}
    </div>
  );
}