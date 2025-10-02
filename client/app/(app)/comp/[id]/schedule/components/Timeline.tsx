import { useState, useRef, useEffect } from 'react';
import { useDrop, useDrag, useDragLayer } from 'react-dnd';
import { Event } from './EventsList';

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

  const height = (item.duration / 15) * 12; // Same calculation as in ResizableEvent

  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 100,
        left: currentOffset.x,
        top: currentOffset.y,
        width: '200px', // Fixed width for the drag preview
      }}
    >
      <div
        className="rounded shadow-lg border-2 border-transparent opacity-80"
        style={{ 
          backgroundColor: item.color + '80',
          height: `${height}px`,
          minHeight: '12px'
        }}
      >
        <div className="p-1 h-full overflow-hidden relative">
          <div className="text-xs font-medium text-gray-800 truncate">
            {item.name}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface ScheduledEvent extends Event {
  startTime: number; // minutes from midnight
  duration: number; // minutes
  day: '10/9' | '10/10';
  venue: 'Wilk' | 'RB';
}

interface TimelineProps {
  onEventSelect: (event: ScheduledEvent | null) => void;
  selectedEvent: ScheduledEvent | null;
  scheduledEvents: ScheduledEvent[];
  setScheduledEvents: React.Dispatch<React.SetStateAction<ScheduledEvent[]>>;
}

interface ResizableEventProps {
  event: ScheduledEvent;
  onEventSelect: (event: ScheduledEvent | null) => void;
  selectedEvent: ScheduledEvent | null;
  onEventUpdate: (eventId: string, updates: Partial<ScheduledEvent>) => void;
  onEventMove: (eventId: string, newDay: '10/9' | '10/10', newVenue: 'Wilk' | 'RB', newTimeSlot: number) => void;
}

function ResizableEvent({ event, onEventSelect, selectedEvent, onEventUpdate, onEventMove }: ResizableEventProps) {
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
    // Always use the current event duration
    startHeightRef.current = event.duration;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startYRef.current;
      const deltaMinutes = Math.round((deltaY / 12) * 15); // 12px per 15-minute slot
      const newDuration = Math.max(15, startHeightRef.current + deltaMinutes); // Minimum 15 minutes
      onEventUpdate(event.id, { duration: newDuration });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const height = (event.duration / 15) * 12; // 12px per 15-minute slot

  return (
    <div
      ref={drag as any}
      className={`absolute left-0 top-0 w-full rounded shadow-sm border-2 transition-colors ${
        selectedEvent?.id === event.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'
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
          <div className="w-8 h-1 bg-gray-400 rounded-full opacity-50 hover:opacity-100" />
        </div>
      </div>
    </div>
  );
}

interface DroppableVenueColumnProps {
  day: '10/9' | '10/10';
  venue: 'Wilk' | 'RB';
  onEventDrop: (event: Event, day: '10/9' | '10/10', venue: 'Wilk' | 'RB', timeSlot: number) => void;
  onEventMove: (eventId: string, newDay: '10/9' | '10/10', newVenue: 'Wilk' | 'RB', newTimeSlot: number) => void;
  scheduledEvents: ScheduledEvent[];
  onEventSelect: (event: ScheduledEvent | null) => void;
  selectedEvent: ScheduledEvent | null;
  onEventUpdate: (eventId: string, updates: Partial<ScheduledEvent>) => void;
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
}: DroppableVenueColumnProps) {
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
          onEventMove(item.id, day, venue, clampedTimeSlot);
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

  return (
    <div
      ref={combinedRef}
      className={`relative ${isOver ? 'bg-blue-50' : ''}`}
      style={{ minHeight: `${56 * 12}px` }} // 56 time slots * 12px each
    >
      {/* Time grid lines */}
      {timeSlots.map((timeSlot) => (
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
      {scheduledEvents
        .filter(event => event.day === day && event.venue === venue)
        .map((event) => {
          const topPosition = ((event.startTime - 480) / 15) * 12;
          
          // Debug logging
          console.log('Event positioning:', {
            eventName: event.name,
            startTime: event.startTime,
            minutesFromStart: event.startTime - 480,
            slotsFromStart: (event.startTime - 480) / 15,
            topPosition: topPosition
          });
          
          return (
            <div
              key={event.id}
              className="absolute left-0 w-full"
              style={{
                top: `${topPosition}px`, // Position based on start time
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

const timeSlots = Array.from({ length: 56 }, (_, i) => 480 + i * 15); // 8:00am to 10:00pm in 15-min intervals

export function Timeline({ onEventSelect, selectedEvent, scheduledEvents, setScheduledEvents }: TimelineProps) {
  const handleEventDrop = (event: Event, day: '10/9' | '10/10', venue: 'Wilk' | 'RB', timeSlot: number) => {
    const newScheduledEvent: ScheduledEvent = {
      ...event,
      id: `scheduled-${Date.now()}`,
      startTime: timeSlot,
      duration: 60, // Default 1 hour
      day,
      venue
    };
    
    setScheduledEvents(prev => [...prev, newScheduledEvent]);
  };

  const handleEventMove = (eventId: string, newDay: '10/9' | '10/10', newVenue: 'Wilk' | 'RB', newTimeSlot: number) => {
    setScheduledEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, day: newDay, venue: newVenue, startTime: newTimeSlot }
          : event
      )
    );
  };

  const handleEventUpdate = (eventId: string, updates: Partial<ScheduledEvent>) => {
    setScheduledEvents(prev => 
      prev.map(event => 
        event.id === eventId ? { ...event, ...updates } : event
      )
    );
  };

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