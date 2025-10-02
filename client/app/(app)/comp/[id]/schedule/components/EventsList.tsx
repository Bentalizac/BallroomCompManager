import { useDrag } from 'react-dnd';
import { GripVertical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export interface EventData {
  id: string;
  name: string;
  category: 'Latin' | 'Ballroom' | 'Other';
  division?: string;
  type?: string;
}

export interface Event {
  event: EventData;
  color: string;
}

interface DraggableEventProps {
  event: Event;
  onDragEnd?: (eventId: string) => void;
}

function DraggableEvent({ event, onDragEnd }: DraggableEventProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'event',
    item: { ...event },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      // If the item was dropped on a valid target, remove it from the list
      if (monitor.didDrop() && onDragEnd) {
        onDragEnd(event.event.id);
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

interface EventsCategoryProps {
  title: string;
  events: Event[];
  onDragEnd?: (eventId: string) => void;
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

const mockEvents: Event[] = [
  { 
    event: { id: '1', name: 'Pre Champ Latin', category: 'Latin', division: 'Pre Championship', type: 'Latin' }, 
    color: '#b8a8d4' 
  },
  { 
    event: { id: '2', name: 'Amateur Latin', category: 'Latin', division: 'Amateur', type: 'Latin' }, 
    color: '#b8a8d4' 
  },
  { 
    event: { id: '3', name: 'Novice Latin', category: 'Latin', division: 'Novice', type: 'Latin' }, 
    color: '#b8a8d4' 
  },
  { 
    event: { id: '4', name: 'Class 485', category: 'Latin', division: 'Class', type: 'Latin' }, 
    color: '#b8a8d4' 
  },
  { 
    event: { id: '5', name: 'Class 385', category: 'Latin', division: 'Class', type: 'Latin' }, 
    color: '#b8a8d4' 
  },
  { 
    event: { id: '6', name: 'Class 383', category: 'Latin', division: 'Class', type: 'Latin' }, 
    color: '#b8a8d4' 
  },
  { 
    event: { id: '7', name: 'Pre Champ Ballroom', category: 'Ballroom', division: 'Pre Championship', type: 'Ballroom' }, 
    color: '#8fa4d4' 
  },
  { 
    event: { id: '8', name: 'Amateur Ballroom', category: 'Ballroom', division: 'Amateur', type: 'Ballroom' }, 
    color: '#8fa4d4' 
  },
  { 
    event: { id: '9', name: 'Novice Ballroom', category: 'Ballroom', division: 'Novice', type: 'Ballroom' }, 
    color: '#8fa4d4' 
  },
  { 
    event: { id: '10', name: 'Class 484', category: 'Ballroom', division: 'Class', type: 'Ballroom' }, 
    color: '#8fa4d4' 
  },
  { 
    event: { id: '11', name: 'Class 384', category: 'Ballroom', division: 'Class', type: 'Ballroom' }, 
    color: '#8fa4d4' 
  },
  { 
    event: { id: '12', name: 'Class 382', category: 'Ballroom', division: 'Class', type: 'Ballroom' }, 
    color: '#8fa4d4' 
  },
  { 
    event: { id: '13', name: 'Formation Teams', category: 'Other', division: 'Formation', type: 'Teams' }, 
    color: '#a8c4d4' 
  },
  { 
    event: { id: '14', name: 'Cabaret', category: 'Other', division: 'Cabaret', type: 'Entertainment' }, 
    color: '#a8c4d4' 
  },
];

interface EventsListProps {
  events?: Event[];
  onEventDrop?: (event: Event) => void;
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

  const latinEvents = localEvents.filter(e => e.event.category === 'Latin');
  const ballroomEvents = localEvents.filter(e => e.event.category === 'Ballroom');
  const otherEvents = localEvents.filter(e => e.event.category === 'Other');

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