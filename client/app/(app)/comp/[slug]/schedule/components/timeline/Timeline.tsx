import { CustomDragLayer } from './CustomDragLayer';
import { DayColumn } from './DayColumn';
import { Event, Block, Venue } from '../../types';
import { useScheduleState } from '../../hooks';
import { VenueLayoutProvider } from '../../context/VenueLayoutContext';
import { DragPreviewProvider } from '../../context/DragPreviewContext';


export const Timeline = () => {
    const { days, locations } = useScheduleState();

    return (
        <VenueLayoutProvider>
            <DragPreviewProvider>
                <div className="flex-1 bg-white flex flex-col h-full">
                
                { /* Provides previews for components that are being dragged */ }
                <CustomDragLayer />

                <div className="flex-1 p-2 overflow-auto">
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