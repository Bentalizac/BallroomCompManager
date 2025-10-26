import { useState, useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { ScheduledEventProps } from '../../types';
import { getDragItemHeight } from '../../utils';
import { LAYOUT_CONSTANTS, TIME_CONSTANTS } from '../../constants';

/**
 * Helper to extract minutes from midnight from a Date
 */
function dateToMinutes(date: Date | null): number {
  if (!date) return 0;
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Helper to compute duration in minutes from start/end dates
 */
function getDuration(startDate: Date | null, endDate: Date | null): number {
  if (!startDate || !endDate) return LAYOUT_CONSTANTS.DEFAULT_EVENT_DURATION;
  return Math.max(15, Math.round((endDate.getTime() - startDate.getTime()) / 60000));
}

export function ScheduledEventComponent({ 
  event, 
  onEventSelect, 
  selectedEvent, 
  onEventUpdate, 
  onEventMove 
}: ScheduledEventProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startDurationRef = useRef(0);

  const duration = getDuration(event.startDate, event.endDate);

  // Make the event draggable
  const [{ isDragState }, drag, preview] = useDrag({
    type: 'event',
    item: () => {
      console.log('Dragging scheduled event:', event.id, event.name);
      return { 
        ...event,
        dragType: 'event' as const,
        state: 'scheduled' as const,
      };
    },
    collect: (monitor) => ({
      isDragState: monitor.isDragging(),
    }),
  });

  // Use empty drag preview to hide the default preview
  useEffect(() => {
    preview(new Image(), { captureDraggingState: true });
  }, [preview]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startYRef.current = e.clientY;
    startDurationRef.current = duration;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startYRef.current;
      // Convert deltaY to minutes based on pixel scale
      const deltaMinutes = Math.round((deltaY / TIME_CONSTANTS.PIXELS_PER_SLOT) * TIME_CONSTANTS.LINE_INTERVAL);
      const newDuration = Math.max(TIME_CONSTANTS.LINE_INTERVAL, startDurationRef.current + deltaMinutes);
      
      // Update endDate based on new duration
      if (event.startDate) {
        const newEndDate = new Date(event.startDate.getTime() + newDuration * 60 * 1000);
        onEventUpdate(event.id, { endDate: newEndDate });
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

  const height = getDragItemHeight(duration);
  const displayColor = event.color || '#3b82f6';

  return (
    <div
      ref={drag as any}
      className={`absolute left-0 top-0 w-full h-full rounded shadow-sm border-2 transition-colors ${
        selectedEvent?.id === event.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'
      } ${isDragState || isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'} ${isResizing ? 'cursor-ns-resize' : ''}`}
      style={{ 
        backgroundColor: `${displayColor}80`,
        minHeight: '12px'
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isResizing && !isDragState) {
          onEventSelect(event);
        }
      }}
    >
      <div className="p-1 h-full overflow-hidden relative">
        <div className="text-xs font-medium text-gray-800 truncate">
          {event.name}
        </div>
        {selectedEvent?.id === event.id && (
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
}