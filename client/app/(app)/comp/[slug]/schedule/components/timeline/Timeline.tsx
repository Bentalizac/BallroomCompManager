import { TimelineProps } from '../../types';
import { useTimelineOperations } from '../../hooks';
import { CustomDragLayer } from './CustomDragLayer';
import { DayColumn } from './DayColumn';

export function Timeline({ onEventSelect, selectedEvent, scheduledEvents, scheduledBlocks, setScheduledEvents, setScheduledBlocks, setAvailableEvents, onEventMove, days, locations }: TimelineProps) {
    const { handleEventDrop, handleEventMove, handleEventUpdate } = useTimelineOperations({
        setScheduledEvents,
        setScheduledBlocks,
        setAvailableEvents,
        onEventUpdate: onEventMove, // Use onEventMove for updates too
        onEventMove
    });

    return (
        <div className="flex-1 bg-white flex flex-col h-full">
        
        { /* Provides previews for components that are being dragged */ }
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
                    scheduledBlocks={scheduledBlocks}
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