import { useState, useRef } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { Event } from './EventsList';

export interface ScheduledEvent extends Event {
  startTime: number; // minutes from midnight
  duration: number; // minutes
  day: '10/9' | '10/10';
  venue: 'Wilk' | 'RB';
}

interface TimelineProps {
  onEventSelect: (event: ScheduledEvent | null) => void;
  selectedEvent: ScheduledEvent | null;
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
  const [{ isDragState }, drag] = useDrag({
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

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startYRef.current = e.clientY;
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
      ref={drag}
      className={`absolute left-0 top-0 w-full rounded shadow-sm border-2 ${
        selectedEvent?.id === event.id ? 'border-blue-500' : 'border-transparent'
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
        {/* Resize handle */}
        <div
          className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-black/10"
          onMouseDown={handleResizeStart}
        />
      </div>
    </div>
  );
}

interface DroppableTimeSlotProps {
  day: '10/9' | '10/10';
  venue: 'Wilk' | 'RB';
  timeSlot: number;
  onEventDrop: (event: Event, day: '10/9' | '10/10', venue: 'Wilk' | 'RB', timeSlot: number) => void;
  onEventMove: (eventId: string, newDay: '10/9' | '10/10', newVenue: 'Wilk' | 'RB', newTimeSlot: number) => void;
  scheduledEvents: ScheduledEvent[];
  onEventSelect: (event: ScheduledEvent | null) => void;
  selectedEvent: ScheduledEvent | null;
  onEventUpdate: (eventId: string, updates: Partial<ScheduledEvent>) => void;
}

function DroppableTimeSlot({ 
  day, 
  venue, 
  timeSlot, 
  onEventDrop,
  onEventMove,
  scheduledEvents, 
  onEventSelect, 
  selectedEvent,
  onEventUpdate 
}: DroppableTimeSlotProps) {
  const [{ isOver }, drop] = useDrop({
    accept: ['event', 'scheduled-event'],
    drop: (item: Event | ScheduledEvent) => {
      if ('startTime' in item) {
        // This is a scheduled event being moved
        onEventMove(item.id, day, venue, timeSlot);
      } else {
        // This is a new event from the events list
        onEventDrop(item, day, venue, timeSlot);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const eventsAtSlot = scheduledEvents.filter(
    event => event.day === day && event.venue === venue && 
    timeSlot >= event.startTime && timeSlot < event.startTime + event.duration
  );

  const formatTimeString = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours < 12 ? 'am' : 'pm';
    return `${displayHours}:${mins.toString().padStart(2, '0')}${ampm}`;
  };

  return (
    <div
      ref={drop}
      className={`relative h-12 border-b border-gray-200 ${isOver ? 'bg-blue-50' : ''}`}
    >
      {timeSlot % 120 === 0 && ( // Show time labels every 2 hours
        <div className="absolute -left-16 top-0 text-xs text-gray-500 w-14 text-right">
          {formatTimeString(timeSlot)}
        </div>
      )}
      
      {eventsAtSlot.map((event) => {
        const isMainSlot = timeSlot === event.startTime;
        
        if (!isMainSlot) return null;
        
        return (
          <ResizableEvent
            key={event.id}
            event={event}
            onEventSelect={onEventSelect}
            selectedEvent={selectedEvent}
            onEventUpdate={onEventUpdate}
            onEventMove={onEventMove}
          />
        );
      })}
    </div>
  );
}

const timeSlots = Array.from({ length: 56 }, (_, i) => 480 + i * 15); // 8:00am to 10:00pm in 15-min intervals

export function Timeline({ onEventSelect, selectedEvent }: TimelineProps) {
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>([
    {
      id: 'scheduled-1',
      name: 'Amateur Latin',
      category: 'Latin',
      division: 'Amateur',
      type: 'Latin',
      color: '#b8a8d4',
      startTime: 660, // 11:00am
      duration: 90, // 1.5 hours
      day: '10/9',
      venue: 'Wilk'
    },
    {
      id: 'scheduled-2',
      name: 'Class 484',
      category: 'Ballroom',
      division: 'Class',
      type: 'Ballroom',
      color: '#8fa4d4',
      startTime: 840, // 2:00pm
      duration: 120, // 2 hours
      day: '10/9',
      venue: 'RB'
    }
  ]);

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
    <div className="flex-1 bg-white">
      <div className="border-b border-gray-200 p-4">
        <h2 className="font-medium text-center">Schedule</h2>
      </div>
      
      <div className="flex">
        {/* Day 1 - 10/9 */}
        <div className="flex-1 border-r border-gray-200">
          <div className="border-b border-gray-200 p-3 text-center font-medium">10/9</div>
          <div className="flex">
            {/* Wilk venue */}
            <div className="flex-1 border-r border-gray-200">
              <div className="border-b border-gray-200 p-2 text-center text-sm font-medium">Wilk</div>
              <div className="relative pl-16">
                {timeSlots.map((timeSlot) => (
                  <DroppableTimeSlot
                    key={`10/9-wilk-${timeSlot}`}
                    day="10/9"
                    venue="Wilk"
                    timeSlot={timeSlot}
                    onEventDrop={handleEventDrop}
                    onEventMove={handleEventMove}
                    scheduledEvents={scheduledEvents}
                    onEventSelect={onEventSelect}
                    selectedEvent={selectedEvent}
                    onEventUpdate={handleEventUpdate}
                  />
                ))}
              </div>
            </div>
            
            {/* RB venue */}
            <div className="flex-1">
              <div className="border-b border-gray-200 p-2 text-center text-sm font-medium">RB</div>
              <div className="relative">
                {timeSlots.map((timeSlot) => (
                  <DroppableTimeSlot
                    key={`10/9-rb-${timeSlot}`}
                    day="10/9"
                    venue="RB"
                    timeSlot={timeSlot}
                    onEventDrop={handleEventDrop}
                    onEventMove={handleEventMove}
                    scheduledEvents={scheduledEvents}
                    onEventSelect={onEventSelect}
                    selectedEvent={selectedEvent}
                    onEventUpdate={handleEventUpdate}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Day 2 - 10/10 */}
        <div className="flex-1">
          <div className="border-b border-gray-200 p-3 text-center font-medium">10/10</div>
          <div className="flex">
            {/* Wilk venue */}
            <div className="flex-1 border-r border-gray-200">
              <div className="border-b border-gray-200 p-2 text-center text-sm font-medium">Wilk</div>
              <div className="relative">
                {timeSlots.map((timeSlot) => (
                  <DroppableTimeSlot
                    key={`10/10-wilk-${timeSlot}`}
                    day="10/10"
                    venue="Wilk"
                    timeSlot={timeSlot}
                    onEventDrop={handleEventDrop}
                    onEventMove={handleEventMove}
                    scheduledEvents={scheduledEvents}
                    onEventSelect={onEventSelect}
                    selectedEvent={selectedEvent}
                    onEventUpdate={handleEventUpdate}
                  />
                ))}
              </div>
            </div>
            
            {/* RB venue */}
            <div className="flex-1">
              <div className="border-b border-gray-200 p-2 text-center text-sm font-medium">RB</div>
              <div className="relative">
                {timeSlots.map((timeSlot) => (
                  <DroppableTimeSlot
                    key={`10/10-rb-${timeSlot}`}
                    day="10/10"
                    venue="RB"
                    timeSlot={timeSlot}
                    onEventDrop={handleEventDrop}
                    onEventMove={handleEventMove}
                    scheduledEvents={scheduledEvents}
                    onEventSelect={onEventSelect}
                    selectedEvent={selectedEvent}
                    onEventUpdate={handleEventUpdate}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}