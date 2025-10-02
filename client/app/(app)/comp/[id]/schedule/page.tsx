'use client';
  
import { createRoot } from "react-dom/client";
import { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { EventsList } from './components/events/EventsList';
import { Timeline } from './components/timeline/Timeline';
import { SidePanel } from './components/panels/SidePanel';
import { ScheduledEvent } from './types';
import { useScheduleState, useKeyboardShortcuts } from './hooks';
import { Venue } from './types/index';

export default function Page() {
  const {
    selectedEvent,
    availableEvents,
    scheduledEvents,
    setSelectedEvent,
    setScheduledEvents,
    setAvailableEvents,
    handleEventDrop,
    handleEventReturnToList,
    handleEventUpdate,
    handleEventDelete
  } = useScheduleState();

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    selectedEvent,
    onEventDelete: handleEventDelete,
    setSelectedEvent
  });

  const today = new Date();
  const Days: Date[] = [new Date(today.getFullYear(), 9, 9), new Date(today.getFullYear(), 9, 10)];
  const locations: Venue[] = [{ name: 'Wilk' }, { name: 'RB' }];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <EventsList 
          events={availableEvents}
          onEventDrop={handleEventDrop}
        />
        <Timeline 
          onEventSelect={setSelectedEvent} 
          selectedEvent={selectedEvent}
          scheduledEvents={scheduledEvents}
          setScheduledEvents={setScheduledEvents}
          setAvailableEvents={setAvailableEvents}
          days={Days}
          locations={locations}
        />
        <SidePanel 
          selectedEvent={selectedEvent} 
          onEventUpdate={handleEventUpdate}
        />
      </div>
    </DndProvider>
  );
}