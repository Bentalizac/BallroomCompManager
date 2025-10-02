import { useEffect } from 'react';
import { ScheduledEvent } from '../types';

export interface UseKeyboardShortcutsProps {
  selectedEvent: ScheduledEvent | null;
  onEventDelete: (event: ScheduledEvent) => void;
  setSelectedEvent: (event: ScheduledEvent | null) => void;
}

export function useKeyboardShortcuts({
  selectedEvent,
  onEventDelete,
  setSelectedEvent
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete key - delete selected event
      if (e.key === 'Delete' && selectedEvent) {
        onEventDelete(selectedEvent);
      }
      
      // Escape key - clear selection
      if (e.key === 'Escape') {
        setSelectedEvent(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedEvent, onEventDelete, setSelectedEvent]);
}