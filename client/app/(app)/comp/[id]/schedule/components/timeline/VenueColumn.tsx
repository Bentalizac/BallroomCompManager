import { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { Event, ScheduledEvent, VenueColumnProps } from '../../types';
import { useEventPositioning } from '../../hooks';
import { calculateTimeSlotFromPosition, calculateEventRenderPosition } from '../../utils';
import { TimeGrid } from './TimeGrid';
import { ScheduledEventComponent } from './ScheduledEventComponent';

export function VenueColumn({ 
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
        const timeSlot = calculateTimeSlotFromPosition(clientOffset.y, componentRect.top);
        
        if ('startTime' in item) {
          // This is a scheduled event being moved
          onEventMove(item.event.id, day, venue, timeSlot);
        } else {
          // This is a new event from the events list
          onEventDrop(item, day, venue, timeSlot);
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
      <TimeGrid />
      
      {/* Render events */}
      {venueEvents.map((event) => {
          const position = eventPositions.get(event.event.id) || { column: 0, totalColumns: 1 };
          const { topPosition, leftPercentage, widthPercentage } = calculateEventRenderPosition(
            event.startTime,
            position.column,
            position.totalColumns
          );
          
          return (
            <div
              key={event.event.id}
              className="absolute"
              style={{
                top: `${topPosition}px`,
                left: `${leftPercentage}%`,
                width: `${widthPercentage}%`,
              }}
            >
              <ScheduledEventComponent
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