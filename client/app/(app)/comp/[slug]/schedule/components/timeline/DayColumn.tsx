import { Event, ScheduledEvent } from '../../types';
import { VenueColumn } from './VenueColumn';
import { DayColumnProps } from '../../types';

export function DayColumn({
  day,
  onEventDrop,
  onEventMove,
  scheduledEvents,
  scheduledBlocks,
  onEventSelect,
  selectedEvent,
  onEventUpdate,
  locations = []
}: DayColumnProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex-1 border-r border-gray-200 last:border-r-0">
      <div className="border-b border-gray-200 p-3 text-center font-medium sticky top-0 bg-white z-10">
        {formatDate(day)}
      </div>
      <div className="flex">

        {locations && locations.length > 0 && locations
          .map((location) => (
            <div key={location.name} className="flex-1">
              <div className="border-b border-gray-200 p-2 text-center text-sm font-medium sticky top-[49px] bg-white z-10">
                {location.name}
              </div>
              <div className={"relative"}>
                <VenueColumn
                  day={day}
                  venue={location}
                  onEventDrop={onEventDrop}
                  onEventMove={onEventMove}
                  scheduledEvents={scheduledEvents}
                  scheduledBlocks={scheduledBlocks}
                  onEventSelect={onEventSelect}
                  selectedEvent={selectedEvent}
                  onEventUpdate={onEventUpdate}
                />
              </div>
            </div>
          ))}        
      </div>
    </div>
  );
}