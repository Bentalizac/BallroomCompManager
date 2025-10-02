import { Event, ScheduledEvent } from '../../types';
import { VenueColumn } from './VenueColumn';

interface DayColumnProps {
  day: '10/9' | '10/10';
  onEventDrop: (event: Event, day: '10/9' | '10/10', venue: 'Wilk' | 'RB', timeSlot: number) => void;
  onEventMove: (eventId: string, newDay: '10/9' | '10/10', newVenue: 'Wilk' | 'RB', newTimeSlot: number) => void;
  scheduledEvents: ScheduledEvent[];
  onEventSelect: (event: ScheduledEvent | null) => void;
  selectedEvent: ScheduledEvent | null;
  onEventUpdate: (eventId: string, updates: Partial<ScheduledEvent>) => void;
}

export function DayColumn({
  day,
  onEventDrop,
  onEventMove,
  scheduledEvents,
  onEventSelect,
  selectedEvent,
  onEventUpdate
}: DayColumnProps) {
  return (
    <div className="flex-1 border-r border-gray-200 last:border-r-0">
      <div className="border-b border-gray-200 p-3 text-center font-medium sticky top-0 bg-white z-10">
        {day}
      </div>
      <div className="flex">
        {/* Wilk venue */}
        <div className="flex-1 border-r border-gray-200">
          <div className="border-b border-gray-200 p-2 text-center text-sm font-medium sticky top-[49px] bg-white z-10">
            Wilk
          </div>
          <div className={`relative ${day === '10/9' ? 'pl-16' : ''}`}>
            <VenueColumn
              day={day}
              venue="Wilk"
              onEventDrop={onEventDrop}
              onEventMove={onEventMove}
              scheduledEvents={scheduledEvents}
              onEventSelect={onEventSelect}
              selectedEvent={selectedEvent}
              onEventUpdate={onEventUpdate}
            />
          </div>
        </div>
        
        {/* RB venue */}
        <div className="flex-1">
          <div className="border-b border-gray-200 p-2 text-center text-sm font-medium sticky top-[49px] bg-white z-10">
            RB
          </div>
          <div className="relative">
            <VenueColumn
              day={day}
              venue="RB"
              onEventDrop={onEventDrop}
              onEventMove={onEventMove}
              scheduledEvents={scheduledEvents}
              onEventSelect={onEventSelect}
              selectedEvent={selectedEvent}
              onEventUpdate={onEventUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}