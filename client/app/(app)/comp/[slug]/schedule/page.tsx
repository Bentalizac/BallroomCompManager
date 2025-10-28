'use client';
  
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Timeline } from './components/timeline/Timeline';
import { ScheduleProvider } from './context/ScheduleContext';
import { DualPanel } from './components/panels/dualPanel';
import { useScheduleState } from './hooks';
import { useEffect } from 'react';
import { STATE_TYPES } from './components/dnd/drag/draggableItem';

function ScheduleContent() {
  const schedule = useScheduleState();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete key - move selected item back to event panel (set to AVAILABLE state)
      if (e.key === 'Delete' && schedule.selectedItemID) {
        const selectedEvent = schedule.events.find(ev => ev.id === schedule.selectedItemID);
        const selectedBlock = schedule.blocks.find(b => b.id === schedule.selectedItemID);
        
        if (selectedEvent) {
          schedule.handleEventUpdate(schedule.selectedItemID, { 
            state: STATE_TYPES.AVAILABLE,
            startDate: null,
            endDate: null,
            venue: null
          });
        } else if (selectedBlock) {
          schedule.handleBlockDelete(schedule.selectedItemID);
        }
        
        schedule.setSelectedItemID(null);
      }
      
      // Escape key - clear selection
      if (e.key === 'Escape') {
        schedule.setSelectedItemID(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [schedule]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <DualPanel />
        <Timeline />
      </div>
    </DndProvider>
  );
}

export default function Page() {
  return (
    <ScheduleProvider>
      <ScheduleContent />
    </ScheduleProvider>
  );
}