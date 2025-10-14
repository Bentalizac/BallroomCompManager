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
    handleEventDelete,
    days,
    setDays,
    locations,
    setLocations
  } = useScheduleState();

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    selectedEvent,
    onEventDelete: handleEventDelete,
    setSelectedEvent
  });

  // Handle event moves and update selected event if needed
  const handleEventMove = (eventId: string, updates: Partial<ScheduledEvent>) => {
    // Update the selected event if it's the one being moved
    if (selectedEvent?.event.id === eventId) {
      setSelectedEvent(selectedEvent ? { ...selectedEvent, ...updates } : null);
    }
  };



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
          onEventMove={handleEventMove}
          days={days}
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