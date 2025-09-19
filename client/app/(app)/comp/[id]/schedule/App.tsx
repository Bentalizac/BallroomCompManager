import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Header } from './components/Header';
import { EventsList } from './components/EventsList';
import { Timeline, ScheduledEvent } from './components/Timeline';
import { SidePanel } from './components/SidePanel';

export default function App() {
  const [selectedEvent, setSelectedEvent] = useState<ScheduledEvent | null>(null);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col">
        <div className="flex flex-1 overflow-hidden">
          <EventsList />
          <Timeline 
            onEventSelect={setSelectedEvent} 
            selectedEvent={selectedEvent}
          />
          <SidePanel selectedEvent={selectedEvent} />
        </div>
      </div>
    </DndProvider>
  );
}