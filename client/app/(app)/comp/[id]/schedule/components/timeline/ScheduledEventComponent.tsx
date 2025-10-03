import { useState, useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { ScheduledEventProps } from '../../types';
import { getDragItemHeight, getEventDisplayColor, calculateResizeDelta } from '../../utils';

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
  const startHeightRef = useRef(0);

  // Make the event draggable
  const [{ isDragState }, drag, preview] = useDrag({
    type: 'scheduled-event',
    item: () => {
      setIsDragging(true);
      return { ...event };
    },
    end: () => {
      setIsDragging(false);
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
    startHeightRef.current = event.duration;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startYRef.current;
      const newDuration = calculateResizeDelta(deltaY, startHeightRef.current);
      onEventUpdate(event.event.id, { duration: newDuration });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const height = getDragItemHeight(event.duration);

  return (
    <div
      ref={drag as any}
      className={`absolute left-0 top-0 w-full rounded shadow-sm border-2 transition-colors ${
        selectedEvent?.event.id === event.event.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'
      } ${isDragState || isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'} ${isResizing ? 'cursor-ns-resize' : ''}`}
      style={{ 
        backgroundColor: getEventDisplayColor(event, 0.5),
        height: `${height}px`,
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
          {event.event.name}
        </div>
        {selectedEvent?.event.id === event.event.id && (
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