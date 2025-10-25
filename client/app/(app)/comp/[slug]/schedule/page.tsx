'use client';
  
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { EventPanel } from './components/panels/EventPanel';
import { Timeline } from './components/timeline/Timeline';
import { ScheduledEvent } from './types';
import { useScheduleState, useKeyboardShortcuts } from './hooks';

export default function Page() {
  const {
    selectedEvent,
    availableEvents,
    scheduledEvents,
    scheduledBlocks,
    setSelectedEvent,
    setScheduledEvents,
    setScheduledBlocks,
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
        <EventPanel 
          events={availableEvents}
        />
        <Timeline 
          onEventSelect={setSelectedEvent} 
          selectedEvent={selectedEvent}
          scheduledEvents={scheduledEvents}
          scheduledBlocks={scheduledBlocks}
          setScheduledEvents={setScheduledEvents}
          setScheduledBlocks={setScheduledBlocks}
          setAvailableEvents={setAvailableEvents}
          onEventMove={handleEventMove}
          days={days}
          locations={locations}
        />
      </div>
    </DndProvider>
  );
}