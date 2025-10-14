import { useDrag } from 'react-dnd';
import { GripVertical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Event, DraggableEventProps, EventsCategoryProps, EventsListProps } from '../../types';
import { mockEvents } from '../../data/mockData';
import { EventType } from '@/../shared/data/enums/eventTypes';


function DraggableEvent({ event, onDragEnd }: DraggableEventProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'event',
    item: { ...event },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      // Only call onDragEnd if the item was successfully dropped
      // The drop handler will manage the actual removal from the list
      if (monitor.didDrop() && onDragEnd) {
        // We'll let the drop target handle the event management
        // onDragEnd(event.event.id);
      }
    },
  });

  return (
    <div
      ref={drag as any}
      className={`flex items-center gap-2 px-3 py-2 bg-white/50 rounded cursor-grab hover:bg-white/70 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <GripVertical className="w-4 h-4 text-gray-400" />
      <span className="text-sm">{event.event.name}</span>
    </div>
  );
}

function EventsCategory({ title, events, onDragEnd }: EventsCategoryProps) {
  return (
    <div className="mb-6">
      <h3 className="font-medium mb-3 text-gray-700">{title}</h3>
      <div className="space-y-2">
        {events.map((event) => (
          <DraggableEvent key={event.event.id} event={event} onDragEnd={onDragEnd} />
        ))}
      </div>
    </div>
  );
}


export function EventsList({ events = mockEvents, onEventDrop }: EventsListProps) {
  const [localEvents, setLocalEvents] = useState<Event[]>(events);

  // Update local events when props change
  useEffect(() => {
    setLocalEvents(events);
  }, [events]);

  const handleDragEnd = (eventId: string) => {
    const droppedEvent = localEvents.find(event => event.event.id === eventId);
    if (droppedEvent && onEventDrop) {
      onEventDrop(droppedEvent);
    }
    setLocalEvents(prevEvents => prevEvents.filter(event => event.event.id !== eventId));
  };

  const latinEvents = localEvents.filter(e => e.event.category === EventType.Latin);
  const ballroomEvents = localEvents.filter(e => e.event.category === EventType.Ballroom);
  const otherEvents = localEvents.filter(e => e.event.category === EventType.Other);

  return (
    <div className="w-64 bg-secondary flex flex-col h-full">
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        <h2 className="font-medium text-gray-700">Events</h2>
        <Button size="sm" variant="ghost" className="p-1 h-auto">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 pt-0">
        <EventsCategory title="Latin" events={latinEvents} onDragEnd={handleDragEnd} />
        <EventsCategory title="Ballroom" events={ballroomEvents} onDragEnd={handleDragEnd} />
        <EventsCategory title="Other" events={otherEvents} onDragEnd={handleDragEnd} />
      </div>
    </div>
  );
}