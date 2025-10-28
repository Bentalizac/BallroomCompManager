import { GripVertical } from 'lucide-react';
import { DRAG_TYPES } from '../../../hooks/useDraggable';
import type { Event } from '../../../types';
import { State, STATE_TYPES, DraggableItem  } from './draggableItem';
import { getContrastingTextColor } from '../../../utils';
import { useScheduleState } from '../../../hooks';

export interface DraggableEventProps {
  event: Event;
}

export const DraggableEvent = ({ event }: DraggableEventProps) => {
  const bgColor = event.color ?? '#4d4d4dff';
  const textColor = getContrastingTextColor(bgColor);
  const schedule = useScheduleState();
  const isSelected = schedule.selectedItemID === event.id;

  const content = (
    <div 
      className={`flex items-center gap-2 px-3 py-2 rounded border-2 transition-shadow ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-transparent'
      }`}
      style={{ backgroundColor: bgColor, color: textColor }}
      onClick={(e) => {
        e.stopPropagation();
        schedule.setSelectedItemID(event.id);
      }}
    >
      <GripVertical className="w-4 h-4" style={{ color: textColor, opacity: 0.7 }} />
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