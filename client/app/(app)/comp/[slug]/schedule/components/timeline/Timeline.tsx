import { CustomDragLayer } from './CustomDragLayer';
import { DayColumn } from './DayColumn';
import { Event, Block, Venue } from '../../types';
import { useScheduleState } from '../../hooks';
import { VenueLayoutProvider } from '../../context/VenueLayoutContext';
import { DragPreviewProvider } from '../../context/DragPreviewContext';


export const Timeline = () => {
    const schedule = useScheduleState();
    const { days, locations } = schedule;

    const handleTimelineClick = (e: React.MouseEvent) => {
        // Only clear selection if clicking directly on the timeline background
        // (not on events/blocks which have stopPropagation)
        if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.timeline-background')) {
            schedule.setSelectedItemID(null);
        }
    };

    return (
        <VenueLayoutProvider>
            <DragPreviewProvider>
                <div className="flex-1 bg-white flex flex-col h-full" onClick={handleTimelineClick}>
                
                { /* Provides previews for components that are being dragged */ }
                <CustomDragLayer />

                <div className="flex-1 p-2 overflow-auto timeline-background">
                    <div className="flex h-full">
                    {days.map((day, index) => (
                        <DayColumn
                            key={day.toISOString()}
                            day={day}
                            locations={locations}
                        />
                    ))}
                    </div>
                </div>
                </div>
            </DragPreviewProvider>
        </VenueLayoutProvider>
    );
}