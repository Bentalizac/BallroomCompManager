import { GripVertical } from 'lucide-react';
import { DRAG_TYPES } from '../../../hooks/useDraggable';
import type { Event } from '../../../types';
import { State, STATE_TYPES, DraggableItem  } from './draggableItem';

export interface DraggableEventProps {
  event: Event;
}

export const DraggableEvent = ({ event }: DraggableEventProps) => {
  const content = (
    <div className="flex items-center gap-2 px-3 py-2 rounded" style={{ backgroundColor: event.color? event.color : '#3b82f6' }}>
      <GripVertical className="w-4 h-4 text-gray-400" />
      <span className="text-sm">{event.name}</span>
    </div>
  );

  return (
    <DraggableItem
      dragType={DRAG_TYPES.EVENT}
      state={event.state}
      data={{ ...event }}
      display={content}
    />
  );
}