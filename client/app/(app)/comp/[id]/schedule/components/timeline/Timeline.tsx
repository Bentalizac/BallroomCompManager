import { useState, useRef, useEffect } from 'react';
import { useDrop, useDrag, useDragLayer } from 'react-dnd';
import { Event } from '../events/EventsList';
import { ScheduledEvent, TimelineProps, VenueColumnProps, ScheduledEventProps } from '../../types';
import { TIME_CONSTANTS, LAYOUT_CONSTANTS, TIME_SLOTS } from '../../constants';
import { useEventPositioning, useTimelineOperations } from '../../hooks';

// Custom drag layer for consistent drag preview
function CustomDragLayer() {
  const { item, itemType, isDragging, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  if (!isDragging || itemType !== 'scheduled-event' || !currentOffset) {
    return null;
  }

  const height = (item.duration / TIME_CONSTANTS.SLOT_INTERVAL) * TIME_CONSTANTS.PIXELS_PER_SLOT;

  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 100,
        left: currentOffset.x,
        top: currentOffset.y,
        width: `${LAYOUT_CONSTANTS.DRAG_PREVIEW_WIDTH}px`,
      }}
    >
      <div
        className="rounded shadow-lg border-2 border-blue-400 opacity-90"
        style={{ 
          backgroundColor: item.color + '80',
          height: `${height}px`,
          minHeight: '12px'
        }}
      >
        <div className="p-1 h-full overflow-hidden relative">
          <div className="text-xs font-medium text-gray-800 truncate">
            {item.event.name}
          </div>
          <div className="absolute top-1 right-1 text-xs text-blue-600 font-medium">
            MOVE
          </div>
        </div>
      </div>
    </div>
  );
}

function ResizableEvent({ event, onEventSelect, selectedEvent, onEventUpdate, onEventMove }: ScheduledEventProps) {
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
      const deltaMinutes = Math.round((deltaY / TIME_CONSTANTS.PIXELS_PER_SLOT) * TIME_CONSTANTS.SLOT_INTERVAL);
      const newDuration = Math.max(TIME_CONSTANTS.SLOT_INTERVAL, startHeightRef.current + deltaMinutes);
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

  const height = (event.duration / TIME_CONSTANTS.SLOT_INTERVAL) * TIME_CONSTANTS.PIXELS_PER_SLOT;

  return (
    <div
      ref={drag as any}
      className={`absolute left-0 top-0 w-full rounded shadow-sm border-2 transition-colors ${
        selectedEvent?.event.id === event.event.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'
      } ${isDragState || isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'} ${isResizing ? 'cursor-ns-resize' : ''}`}
      style={{ 
        backgroundColor: event.color + '80',
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

function DroppableVenueColumn({ 
  day, 
  venue, 
  onEventDrop,
  onEventMove,
  scheduledEvents, 
  onEventSelect, 
  selectedEvent,
  onEventUpdate 
}: VenueColumnProps) {
  const dropRef = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop({
    accept: ['event', 'scheduled-event'],
    drop: (item: Event | ScheduledEvent, monitor) => {
      const clientOffset = monitor.getClientOffset();
      const componentRect = dropRef.current?.getBoundingClientRect();
      
      if (clientOffset && componentRect) {
        // Calculate the relative position within the drop zone
        const relativeY = clientOffset.y - componentRect.top;
        
        // Debug logging
        console.log('Drop position:', {
          clientY: clientOffset.y,
          componentTop: componentRect.top,
          relativeY: relativeY,
        });
        
        // Convert pixel position to time slots
        // Each time slot is 15 minutes and takes up 12px
        // So: pixels / 12 = number of 15-minute slots from start
        const slotsFromStart = relativeY / 12;
        const minutesFromStart = slotsFromStart * 15;
        const calculatedTime = 480 + minutesFromStart; // 480 = 8:00am start
        
        // Round to nearest 15-minute increment
        const timeSlot = Math.round(calculatedTime / 15) * 15;
        const clampedTimeSlot = Math.max(480, Math.min(1200, timeSlot)); // Clamp between 8am and 8pm
        
        console.log('Time calculation:', {
          slotsFromStart,
          minutesFromStart,
          calculatedTime,
          timeSlot,
          clampedTimeSlot
        });
        
        if ('startTime' in item) {
          // This is a scheduled event being moved
          onEventMove(item.event.id, day, venue, clampedTimeSlot);
        } else {
          // This is a new event from the events list
          onEventDrop(item, day, venue, clampedTimeSlot);
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Combine refs
  const combinedRef = (node: HTMLDivElement) => {
    drop(node);
    dropRef.current = node;
  };

  // Filter events for this day/venue and calculate positions
  const venueEvents = scheduledEvents.filter(event => event.day === day && event.venue === venue);
  const eventPositions = useEventPositioning(venueEvents);

  return (
    <div
      ref={combinedRef}
      className={`relative ${isOver ? 'bg-blue-50' : ''}`}
      style={{ minHeight: `${56 * 12}px` }} // 56 time slots * 12px each
    >
      {/* Time grid lines */}
      {TIME_SLOTS.map((timeSlot) => (
        <div
          key={timeSlot}
          className="relative h-12 border-b border-gray-200"
        >
          {timeSlot % 120 === 0 && ( // Show time labels every 2 hours
            <div className="absolute -left-16 top-0 text-xs text-gray-500 w-14 text-right">
              {formatTimeString(timeSlot)}
            </div>
          )}
        </div>
      ))}
      
      {/* Render events */}
      {venueEvents.map((event) => {
          const topPosition = ((event.startTime - 480) / 15) * 12;
          const position = eventPositions.get(event.event.id) || { column: 0, totalColumns: 1 };
          
          // Calculate width and left offset based on overlap
          // Add small gaps between overlapping events for better visual separation
          const gapPercentage = position.totalColumns > 1 ? 1 : 0; // 1% gap between events
          const availableWidth = 100 - (gapPercentage * (position.totalColumns - 1));
          const widthPercentage = availableWidth / position.totalColumns;
          const leftPercentage = (position.column * (widthPercentage + gapPercentage));
          
          // Debug logging
          console.log('Event positioning:', {
            eventName: event.event.name,
            startTime: event.startTime,
            minutesFromStart: event.startTime - 480,
            slotsFromStart: (event.startTime - 480) / 15,
            topPosition: topPosition,
            column: position.column,
            totalColumns: position.totalColumns,
            widthPercentage,
            leftPercentage
          });
          
          return (
            <div
              key={event.event.id}
              className="absolute"
              style={{
                top: `${topPosition}px`, // Position based on start time
                left: `${leftPercentage}%`,
                width: `${widthPercentage}%`,
              }}
            >
              <ResizableEvent
                event={event}
                onEventSelect={onEventSelect}
                selectedEvent={selectedEvent}
                onEventUpdate={onEventUpdate}
                onEventMove={onEventMove}
              />
            </div>
          );
        })}
    </div>
  );
}

const formatTimeString = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const ampm = hours < 12 ? 'am' : 'pm';
  return `${displayHours}:${mins.toString().padStart(2, '0')}${ampm}`;
};

export function Timeline({ onEventSelect, selectedEvent, scheduledEvents, setScheduledEvents }: TimelineProps) {
  const { handleEventDrop, handleEventMove, handleEventUpdate } = useTimelineOperations({
    setScheduledEvents,
    onEventUpdate: undefined // We don't need external update handler here
  });

  return (
    <div className="flex-1 bg-white flex flex-col h-full">
      <CustomDragLayer />      
      <div className="flex-1 overflow-auto">
        <div className="flex h-full">
          {/* Day 1 - 10/9 */}
          <div className="flex-1 border-r border-gray-200">
            <div className="border-b border-gray-200 p-3 text-center font-medium sticky top-0 bg-white z-10">10/9</div>
            <div className="flex">
              {/* Wilk venue */}
              <div className="flex-1 border-r border-gray-200">
                <div className="border-b border-gray-200 p-2 text-center text-sm font-medium sticky top-[49px] bg-white z-10">Wilk</div>
                <div className="relative pl-16">
                  <DroppableVenueColumn
                    day="10/9"
                    venue="Wilk"
                    onEventDrop={handleEventDrop}
                    onEventMove={handleEventMove}
                    scheduledEvents={scheduledEvents}
                    onEventSelect={onEventSelect}
                    selectedEvent={selectedEvent}
                    onEventUpdate={handleEventUpdate}
                  />
                </div>
              </div>
              
              {/* RB venue */}
              <div className="flex-1">
                <div className="border-b border-gray-200 p-2 text-center text-sm font-medium sticky top-[49px] bg-white z-10">RB</div>
                <div className="relative">
                  <DroppableVenueColumn
                    day="10/9"
                    venue="RB"
                    onEventDrop={handleEventDrop}
                    onEventMove={handleEventMove}
                    scheduledEvents={scheduledEvents}
                    onEventSelect={onEventSelect}
                    selectedEvent={selectedEvent}
                    onEventUpdate={handleEventUpdate}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Day 2 - 10/10 */}
          <div className="flex-1">
            <div className="border-b border-gray-200 p-3 text-center font-medium sticky top-0 bg-white z-10">10/10</div>
            <div className="flex">
              {/* Wilk venue */}
              <div className="flex-1 border-r border-gray-200">
                <div className="border-b border-gray-200 p-2 text-center text-sm font-medium sticky top-[49px] bg-white z-10">Wilk</div>
                <div className="relative">
                  <DroppableVenueColumn
                    day="10/10"
                    venue="Wilk"
                    onEventDrop={handleEventDrop}
                    onEventMove={handleEventMove}
                    scheduledEvents={scheduledEvents}
                    onEventSelect={onEventSelect}
                    selectedEvent={selectedEvent}
                    onEventUpdate={handleEventUpdate}
                  />
                </div>
              </div>
              
              {/* RB venue */}
              <div className="flex-1">
                <div className="border-b border-gray-200 p-2 text-center text-sm font-medium sticky top-[49px] bg-white z-10">RB</div>
                <div className="relative">
                  <DroppableVenueColumn
                    day="10/10"
                    venue="RB"
                    onEventDrop={handleEventDrop}
                    onEventMove={handleEventMove}
                    scheduledEvents={scheduledEvents}
                    onEventSelect={onEventSelect}
                    selectedEvent={selectedEvent}
                    onEventUpdate={handleEventUpdate}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}