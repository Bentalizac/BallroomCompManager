import { TimelineProps } from '../../types';
import { useTimelineOperations } from '../../hooks';
import { CustomDragLayer } from './CustomDragLayer';
import { DayColumn } from './DayColumn';

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
          <DayColumn
            day="10/9"
            onEventDrop={handleEventDrop}
            onEventMove={handleEventMove}
            scheduledEvents={scheduledEvents}
            onEventSelect={onEventSelect}
            selectedEvent={selectedEvent}
            onEventUpdate={handleEventUpdate}
          />
          
          {/* Day 2 - 10/10 */}
          <DayColumn
            day="10/10"
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
  );
}