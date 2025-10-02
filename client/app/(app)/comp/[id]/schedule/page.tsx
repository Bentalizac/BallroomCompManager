'use client';
  
import { createRoot } from "react-dom/client";
import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { EventsList, Event } from './components/EventsList';
import { Timeline, ScheduledEvent } from './components/Timeline';
import { SidePanel } from './components/SidePanel';

// Mock events data
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

function App() {
  const [selectedEvent, setSelectedEvent] = useState<ScheduledEvent | null>(null);
  const [availableEvents, setAvailableEvents] = useState<Event[]>(mockEvents);
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>([
    {
      id: 'scheduled-1',
      name: 'Amateur Latin',
      category: 'Latin',
      division: 'Amateur',
      type: 'Latin',
      color: '#b8a8d4',
      startTime: 660, // 11:00am
      duration: 90, // 1.5 hours
      day: '10/9',
      venue: 'Wilk'
    },
    {
      id: 'scheduled-2',
      name: 'Class 484',
      category: 'Ballroom',
      division: 'Class',
      type: 'Ballroom',
      color: '#8fa4d4',
      startTime: 840, // 2:00pm
      duration: 120, // 2 hours
      day: '10/9',
      venue: 'RB'
    }
  ]);

  const handleEventDrop = (event: Event) => {
    // Remove from available events
    setAvailableEvents(prev => prev.filter(e => e.id !== event.id));
  };

  const handleEventReturnToList = (event: ScheduledEvent) => {
    // Convert back to basic Event and add to available events
    const basicEvent: Event = {
      id: event.id.startsWith('scheduled-') ? `${Date.now()}` : event.id,
      name: event.name,
      category: event.category,
      division: event.division,
      type: event.type,
      color: event.color
    };
    
    setAvailableEvents(prev => [...prev, basicEvent]);
    
    // Remove from scheduled events
    setScheduledEvents(prev => prev.filter(e => e.id !== event.id));
    
    // Clear selection if this was the selected event
    if (selectedEvent?.id === event.id) {
      setSelectedEvent(null);
    }
  };

  const handleEventUpdate = (eventId: string, updates: Partial<ScheduledEvent>) => {
    setScheduledEvents(prev => 
      prev.map(event => 
        event.id === eventId ? { ...event, ...updates } : event
      )
    );
    
    // Update selected event if it's the one being updated
    if (selectedEvent?.id === eventId) {
      setSelectedEvent(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  // Handle delete key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedEvent) {
        // Check if any input or textarea is currently focused
        const activeElement = document.activeElement;
        const isInputFocused = activeElement && (
          activeElement.tagName === 'INPUT' || 
          activeElement.tagName === 'TEXTAREA' ||
          (activeElement as HTMLElement).contentEditable === 'true'
        );
        
        // Only delete the event if no input field is focused
        if (!isInputFocused) {
          handleEventReturnToList(selectedEvent);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedEvent]);

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
        />
        <SidePanel 
          selectedEvent={selectedEvent} 
          onEventUpdate={handleEventUpdate}
        />
      </div>
    </DndProvider>
  );
}


export default function Page() {
  return (
    <App />
  );
}