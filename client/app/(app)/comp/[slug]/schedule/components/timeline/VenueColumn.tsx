import { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { Event, ScheduledEvent, VenueColumnProps, Block, ScheduledBlock} from '../../types';
import { useEventPositioning } from '../../hooks';
import { calculateTimeSlotFromPosition, calculateEventRenderPosition } from '../../utils';
import { TimeGrid } from './TimeGrid';
import { ScheduledEventComponent } from './ScheduledEventComponent';
import { LAYOUT_CONSTANTS, TIME_CONSTANTS } from '../../constants';

export function VenueColumn({ 
  day, 
  venue, 
  onEventDrop,
  onEventMove,
  scheduledEvents,
  scheduledBlocks, 
  onEventSelect, 
  selectedEvent,
  onEventUpdate 
}: VenueColumnProps) {
  const dropRef = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop({
    accept: ['event', 'block'],
    drop: (item:any, monitor) => {
      const clientOffset = monitor.getClientOffset();
      const componentRect = dropRef.current?.getBoundingClientRect();
      
      if (clientOffset && componentRect) {
        const timeSlot = calculateTimeSlotFromPosition(clientOffset.y, componentRect.top);
        
        if (item.dragType === 'event') {
          if (item.state === 'available') {
            // New event from available list
            console.log('Dropping new event:', item);
            onEventDrop(item, day, venue, timeSlot);
          }
          else if (item.state === 'scheduled') {
            // Existing scheduled event being moved
            console.log('Moving scheduled event:', item);
            onEventMove(item.event.id, day, venue, timeSlot);
          }
        }
        else if (item.dragType === 'block') {
          if (item.state === 'available') {
            // New block from available list
          }
          else if (item.state === 'scheduled') {
            // Existing scheduled block being moved
          }
        }

        if ('event' in item && 'startTime' in item) {
          // This is a scheduled event being moved
          
          //// onEventMove(item.event.id, day, venue, timeSlot);
        } else if ('id' in item && 'startTime' in item) {
          // This is a scheduled block being moved (already has position)
          // For now, blocks don't support repositioning via onEventMove
          // Could add onBlockMove handler if needed
        } else {
          // This is a new event or block from the events list
          
          //// onEventDrop(item, day, venue, timeSlot);
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
  const venueEvents = scheduledEvents.filter(event => 
    event.day.toDateString() === day.toDateString() && 
    event.venue.name === venue.name
  );
  const eventPositions = useEventPositioning(venueEvents);

  // Filter blocks for this day/venue
  const venueBlocks = scheduledBlocks.filter(block => 
    block.day.toDateString() === day.toDateString() && 
    block.venue.name === venue.name
  );

  return (
    <div
      ref={combinedRef}
      className={`relative ${isOver ? 'bg-blue-50' : ''}`}
      style={{ minHeight: `${TIME_CONSTANTS.TOTAL_LINES * LAYOUT_CONSTANTS.GRID_SLOT_HEIGHT}px` }}
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
          
          const eventHeight = (event.duration / TIME_CONSTANTS.LINE_INTERVAL) * TIME_CONSTANTS.PIXELS_PER_SLOT;
          
          return (
            <div
              key={event.event.id}
              className="absolute"
              style={{
                top: `${topPosition}px`,
                left: `${leftPercentage}%`,
                width: `${widthPercentage}%`,
                height: `${eventHeight}px`,
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

      {/* Render blocks */}
      {venueBlocks.map((block) => {
          const { topPosition } = calculateEventRenderPosition(
            block.startTime,
            0,
            1
          );
          
          const blockHeight = (block.duration / TIME_CONSTANTS.LINE_INTERVAL) * TIME_CONSTANTS.PIXELS_PER_SLOT;
          
          return (
            <div
              key={block.id}
              className="absolute"
              style={{
                top: `${topPosition}px`,
                left: '0%',
                width: '100%',
                height: `${blockHeight}px`,
              }}
            >
              <div className="h-full w-full bg-gray-300 border-2 border-gray-400 rounded p-2 opacity-50 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">{block.name}</span>
              </div>
            </div>
          );
        })}
    </div>
  );
}