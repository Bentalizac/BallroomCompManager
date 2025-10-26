import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { mockEvents } from '../../data/mockData';
import { EventType } from '@/../shared/data/enums/eventTypes';
import { Event, Block } from '../../types';
import { STATE_TYPES } from '../dnd/drag/draggableItem';
import { DraggableEvent } from '../dnd/drag/draggableEvent';
import { DraggableBlock } from '../dnd/drag/draggableBlock';
import { useScheduleState } from '../../hooks';

interface EventListProps {
  events?: Event[];
}

const EventList = ({ events }: EventListProps) => {
  return (
    <div>
      {events?.map((event) => (
        <DraggableEvent
          key={event.id}
          state={STATE_TYPES.AVAILABLE}
          event={event}
        />
      ))}
    </div>
  );
};


interface EventsCategoryProps {
  title: string;
  events?: Event[];
}

const EventsCategory = ({ title, events }: EventsCategoryProps) => {
  return (
    <div className="mb-6">
      <h3 className="font-medium mb-3 text-gray-700">{title}</h3>
      <div className="space-y-2">
        <EventList events={events} />
      </div>
    </div>
  );
}

export const EventPanel = () => {
  const events = useScheduleState().getAvailableEvents();
  const blocks = useScheduleState().getAvailableBlocks();

  const latinEvents = events.filter(e => e.category === EventType.Latin);
  const ballroomEvents = events.filter(e => e.category === EventType.Ballroom);
  const otherEvents = events.filter(e => e.category === EventType.Other);

  return (
    <div className="w-64 bg-secondary flex flex-col h-full rounded-lg m-2">
      <div className="p-4">
        {blocks.map((block) => (
            <div key={block.id} className="mb-2">
                <DraggableBlock state={STATE_TYPES.INFINITE} block={block} />
            </div>
        ))}
      </div>
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        <h2 className="font-medium text-gray-700">Events</h2>
        <Button size="sm" variant="ghost" className="p-1 h-auto">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 pt-0">
        <EventsCategory title="Latin" events={latinEvents} />
        <EventsCategory title="Ballroom" events={ballroomEvents} />
        <EventsCategory title="Other" events={otherEvents} />
      </div>
    </div>
  );
}