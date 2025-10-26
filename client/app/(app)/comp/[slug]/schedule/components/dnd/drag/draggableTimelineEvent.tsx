import { DraggableItem } from '../../dnd/drag/draggableItem';
import type { Event } from '../../../types';
import { useEffect, useRef, useState } from 'react';
import { TIME_CONSTANTS } from '../../../constants';
import { useScheduleState } from '../../../hooks';
import { DRAG_TYPES } from '../../../hooks/useDraggable';

function getDuration(startDate: Date | null, endDate: Date | null): number {
  if (!startDate || !endDate) return 0;
  return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)); // duration in minutes
}

export interface DraggableTimelineEventProps {
  event: Event;
}

export const DraggableTimelineEvent = ({ event }: DraggableTimelineEventProps) => {
  const schedule = useScheduleState();
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startDurationRef = useRef(0);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startYRef.current = e.clientY;
    startDurationRef.current = getDuration(event.startDate, event.endDate);

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startYRef.current;
      // Convert deltaY to minutes based on pixel scale
      const deltaMinutes = Math.round((deltaY / TIME_CONSTANTS.PIXELS_PER_SLOT) * TIME_CONSTANTS.LINE_INTERVAL);
      const newDuration = Math.max(TIME_CONSTANTS.LINE_INTERVAL, startDurationRef.current + deltaMinutes);

      // Update endDate based on new duration
      if (event.startDate) {
        const newEndDate = new Date(event.startDate.getTime() + newDuration * 60 * 1000);
        schedule.handleEventUpdate(event.id, { endDate: newEndDate });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const LIGHT_PURPLE = '#673d72ff'; // static light purple for timeline items
  const content = (
    <div
      className={`absolute left-0 top-0 w-full h-full rounded shadow-sm border-2 transition-colors ${
        schedule.selectedItemID === event.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'
      }`}
      style={{ backgroundColor: LIGHT_PURPLE }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="p-1 h-full overflow-hidden relative">
        <div className="text-xs font-medium text-gray-800 truncate">
          {event.name}
        </div>
        {schedule.selectedItemID === event.id && (
          <div className="absolute top-1 right-1 text-xs text-blue-600 font-medium">
            DEL
          </div>
        )}
        {/* Resize handle */}
        <div
          className="absolute bottom-0 left-0 w-full h-3 cursor-ns-resize hover:bg-black/20 flex items-end justify-center"
          onMouseDown={handleResizeStart}
          style={{ zIndex: 10 }}
        >
          <div className="w-4 h-1 bg-gray-400 rounded-full opacity-50 hover:opacity-100" />
        </div>
      </div>
    </div>
  );

  return (
    <DraggableItem
      dragType={DRAG_TYPES.EVENT}
      state={event.state}
      data={{ ...event }}
      className="w-full h-full"
      display={content}
    />
  );
};
