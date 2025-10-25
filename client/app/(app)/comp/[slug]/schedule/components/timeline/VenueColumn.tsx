import { Event, ScheduledEvent, VenueColumnProps, Block, ScheduledBlock} from '../../types';
import { useEventPositioning } from '../../hooks';
import { calculateEventRenderPosition } from '../../utils';
import { TimeGrid } from './TimeGrid';
import { ScheduledEventComponent } from './ScheduledEventComponent';
import { LAYOUT_CONSTANTS, TIME_CONSTANTS } from '../../constants';
import { ScheduleDropZone } from '../dnd/drop/ScheduleDropZone';

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
    <ScheduleDropZone
      day={day}
      venue={venue}
      onEventDrop={onEventDrop}
      onEventMove={onEventMove}
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
    </ScheduleDropZone>
  );
}