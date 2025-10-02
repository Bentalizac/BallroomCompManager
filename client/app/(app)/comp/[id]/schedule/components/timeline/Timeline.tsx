import { TimelineProps } from '../../types';
import { useTimelineOperations } from '../../hooks';
import { CustomDragLayer } from './CustomDragLayer';
import { DayColumn } from './DayColumn';

export function Timeline({ onEventSelect, selectedEvent, scheduledEvents, setScheduledEvents, setAvailableEvents, days, locations }: TimelineProps) {
    const { handleEventDrop, handleEventMove, handleEventUpdate } = useTimelineOperations({
        setScheduledEvents,
        setAvailableEvents,
        onEventUpdate: undefined // We don't need external update handler here
    });

    return (
        <div className="flex-1 bg-white flex flex-col h-full">
        <CustomDragLayer />      
        <div className="flex-1 p-2 overflow-auto">
            <div className="flex h-full">
            {days.map((day, index) => (
                <DayColumn
                    key={day.toISOString()}
                    day={day}
                    onEventDrop={handleEventDrop}
                    onEventMove={handleEventMove}
                    scheduledEvents={scheduledEvents}
                    locations={locations}
                    onEventSelect={onEventSelect}
                    selectedEvent={selectedEvent}
                    onEventUpdate={handleEventUpdate}
                />
            ))}
            </div>
        </div>
        </div>
    );
}