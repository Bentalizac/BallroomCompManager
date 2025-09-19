import { useDrag } from 'react-dnd';
import { GripVertical, Plus } from 'lucide-react';
import { Button } from './ui/button';

export interface Event {
  id: string;
  name: string;
  category: 'Latin' | 'Ballroom' | 'Other';
  division?: string;
  type?: string;
  color: string;
}

interface DraggableEventProps {
  event: Event;
}

function DraggableEvent({ event }: DraggableEventProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'event',
    item: { ...event },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`flex items-center gap-2 px-3 py-2 bg-white/50 rounded cursor-grab hover:bg-white/70 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <GripVertical className="w-4 h-4 text-gray-400" />
      <span className="text-sm">{event.name}</span>
    </div>
  );
}

interface EventsCategoryProps {
  title: string;
  events: Event[];
}

function EventsCategory({ title, events }: EventsCategoryProps) {
  return (
    <div className="mb-6">
      <h3 className="font-medium mb-3 text-gray-700">{title}</h3>
      <div className="space-y-2">
        {events.map((event) => (
          <DraggableEvent key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

const mockEvents: Event[] = [
  { id: '1', name: 'Pre Champ Latin', category: 'Latin', division: 'Pre Championship', type: 'Latin', color: '#b8a8d4' },
  { id: '2', name: 'Amateur Latin', category: 'Latin', division: 'Amateur', type: 'Latin', color: '#b8a8d4' },
  { id: '3', name: 'Novice Latin', category: 'Latin', division: 'Novice', type: 'Latin', color: '#b8a8d4' },
  { id: '4', name: 'Class 485', category: 'Latin', division: 'Class', type: 'Latin', color: '#b8a8d4' },
  { id: '5', name: 'Class 385', category: 'Latin', division: 'Class', type: 'Latin', color: '#b8a8d4' },
  { id: '6', name: 'Class 383', category: 'Latin', division: 'Class', type: 'Latin', color: '#b8a8d4' },
  { id: '7', name: 'Pre Champ Ballroom', category: 'Ballroom', division: 'Pre Championship', type: 'Ballroom', color: '#8fa4d4' },
  { id: '8', name: 'Amateur Ballroom', category: 'Ballroom', division: 'Amateur', type: 'Ballroom', color: '#8fa4d4' },
  { id: '9', name: 'Novice Ballroom', category: 'Ballroom', division: 'Novice', type: 'Ballroom', color: '#8fa4d4' },
  { id: '10', name: 'Class 484', category: 'Ballroom', division: 'Class', type: 'Ballroom', color: '#8fa4d4' },
  { id: '11', name: 'Class 384', category: 'Ballroom', division: 'Class', type: 'Ballroom', color: '#8fa4d4' },
  { id: '12', name: 'Class 382', category: 'Ballroom', division: 'Class', type: 'Ballroom', color: '#8fa4d4' },
  { id: '13', name: 'Formation Teams', category: 'Other', division: 'Formation', type: 'Teams', color: '#a8c4d4' },
  { id: '14', name: 'Cabaret', category: 'Other', division: 'Cabaret', type: 'Entertainment', color: '#a8c4d4' },
];

export function EventsList() {
  const latinEvents = mockEvents.filter(e => e.category === 'Latin');
  const ballroomEvents = mockEvents.filter(e => e.category === 'Ballroom');
  const otherEvents = mockEvents.filter(e => e.category === 'Other');

  return (
    <div className="w-64 bg-[#d4c8e4] p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium text-gray-700">Events</h2>
        <Button size="sm" variant="ghost" className="p-1 h-auto">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      <EventsCategory title="Latin" events={latinEvents} />
      <EventsCategory title="Ballroom" events={ballroomEvents} />
      <EventsCategory title="Other" events={otherEvents} />
    </div>
  );
}