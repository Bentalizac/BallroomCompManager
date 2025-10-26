'use client';
  
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { EventPanel } from './components/panels/EventPanel';
import { Timeline } from './components/timeline/Timeline';
import { ScheduleProvider } from './context/ScheduleContext';

export default function Page() {
  return (
    <ScheduleProvider>
      <DndProvider backend={HTML5Backend}>
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          <EventPanel />
          <Timeline />
        </div>
      </DndProvider>
    </ScheduleProvider>
  );
}