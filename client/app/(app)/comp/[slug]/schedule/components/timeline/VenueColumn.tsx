import { Event, Block, Venue} from '../../types';
import { useEventPositioning, useScheduleState } from '../../hooks';
import { calculateEventRenderPosition } from '../../utils';
import { TimeGrid } from './TimeGrid';
import { LAYOUT_CONSTANTS, TIME_CONSTANTS } from '../../constants';
import { ScheduleDropZone } from '../dnd/drop/ScheduleDropZone';
import { STATE_TYPES } from '../dnd/drag/draggableItem';
import { DraggableTimelineBlock } from '../dnd/drag/draggableTimelineBlock';
import { DraggableTimelineEvent } from '../dnd/drag/draggableTimelineEvent';

export interface VenueColumnProps {
  day: Date;
  venue: Venue;
}

export const VenueColumn = ({ day, venue }: VenueColumnProps) => {
  const schedule = useScheduleState();

  // Filter events for this day/venue and calculate positions
  const venueEvents = schedule.getScheduledEvents().filter(event => {
    if (!event.startDate || !event.venue) return false;
    // Compare date strings (YYYY-MM-DD) to match the day
    const eventDateStr = event.startDate.toISOString().split('T')[0];
    const dayDateStr = day.toISOString().split('T')[0];
    return eventDateStr === dayDateStr && event.venue.name === venue.name;
  });
  
  const eventPositions = useEventPositioning(venueEvents);

  // Filter blocks for this day/venue
  const venueBlocks = schedule.getScheduledBlocks().filter(block => {
    if (!block.startDate || !block.venue) return false;
    const blockDateStr = block.startDate.toISOString().split('T')[0];
    const dayDateStr = day.toISOString().split('T')[0];
    return blockDateStr === dayDateStr && block.venue.name === venue.name;
  });

  // Helper reserved for future use (was used for date conversions here)
  // const minutesToDate = (baseDay: Date, minutes: number) => {
  //   const result = new Date(baseDay);
  //   result.setHours(0, 0, 0, 0);
  //   const hours = Math.floor(minutes / 60);
  //   const mins = minutes % 60;
  //   result.setHours(hours, mins, 0, 0);
  //   return result;
  // };

  return (
    <ScheduleDropZone
      day={day}
      venue={venue}
      style={{ minHeight: `${TIME_CONSTANTS.TOTAL_LINES * LAYOUT_CONSTANTS.GRID_SLOT_HEIGHT}px` }}
    >
      {/* Time grid lines */}
      <TimeGrid />
      
      {/* Render events */}
      {venueEvents.map((event) => {
          const position = eventPositions.get(event.id) || { column: 0, totalColumns: 1 };
          const startMinutes = event.startDate ? event.startDate.getHours() * 60 + event.startDate.getMinutes() : TIME_CONSTANTS.START_TIME;
          const { topPosition, leftPercentage, widthPercentage } = calculateEventRenderPosition(
            startMinutes,
            position.column,
            position.totalColumns
          );
          
          const rawEventDuration = event.startDate && event.endDate
            ? Math.round((event.endDate.getTime() - event.startDate.getTime()) / 60000)
            : LAYOUT_CONSTANTS.DEFAULT_EVENT_DURATION;
          const duration = rawEventDuration <= 0
            ? LAYOUT_CONSTANTS.DEFAULT_EVENT_DURATION
            : Math.max(LAYOUT_CONSTANTS.MIN_EVENT_DURATION, rawEventDuration);
          const eventHeight = (duration / TIME_CONSTANTS.LINE_INTERVAL) * TIME_CONSTANTS.PIXELS_PER_SLOT;
          
          return (
            <div
              key={event.id}
              className="absolute"
              style={{
                top: `${topPosition}px`,
                left: `${leftPercentage}%`,
                width: `${widthPercentage}%`,
                height: `${eventHeight}px`,
              }}
            >
              <DraggableTimelineEvent event={event} />
            </div>
          );
        })}

      {/* Render blocks */}
      {venueBlocks.map((block) => {
          const startMinutes = block.startDate ? block.startDate.getHours() * 60 + block.startDate.getMinutes() : TIME_CONSTANTS.START_TIME;
          const { topPosition } = calculateEventRenderPosition(
            startMinutes,
            0,
            1
          );
          
          const rawBlockDuration = block.startDate && block.endDate
            ? Math.round((block.endDate.getTime() - block.startDate.getTime()) / 60000)
            : LAYOUT_CONSTANTS.DEFAULT_EVENT_DURATION;
          const duration = rawBlockDuration <= 0
            ? LAYOUT_CONSTANTS.DEFAULT_EVENT_DURATION
            : Math.max(LAYOUT_CONSTANTS.MIN_EVENT_DURATION, rawBlockDuration);
          const blockHeight = (duration / TIME_CONSTANTS.LINE_INTERVAL) * TIME_CONSTANTS.PIXELS_PER_SLOT;
          
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
              <DraggableTimelineBlock block={block} />
            </div>
          );
        })}
    </ScheduleDropZone>
  );
}