'use client';
  
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Timeline } from '../../comp/[slug]/schedule/components/timeline/Timeline';
import { ScheduleProvider } from '../../comp/[slug]/schedule/context/ScheduleContext';
import { DualPanel } from '../../comp/[slug]/schedule/components/panels/dualPanel';
import { useScheduleState } from '../../comp/[slug]/schedule/hooks';
import { useEffect } from 'react';
import { STATE_TYPES } from '../../comp/[slug]/schedule/components/dnd/drag/draggableItem';

function ScheduleContent() {
  const schedule = useScheduleState();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete key - move selected item back to event panel (set to AVAILABLE state)
      if (e.key === 'Delete' && schedule.selectedItemID) {
        const selectedEvent = schedule.events.find(ev => ev.id === schedule.selectedItemID);
        const selectedBlock = schedule.blocks.find(b => b.id === schedule.selectedItemID);
        const selectedItem = selectedEvent || selectedBlock;

        if (!selectedItem || selectedItem?.state === STATE_TYPES.INFINITE) {
          // Do nothing for infinite items or null selection
          return;
        }

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