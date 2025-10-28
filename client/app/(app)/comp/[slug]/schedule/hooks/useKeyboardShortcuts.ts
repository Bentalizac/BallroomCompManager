import { useEffect } from 'react';
import { Event } from '../types';

export interface UseKeyboardShortcutsProps {
  selectedEvent: Event | null;
  onEventDelete: (event: Event) => void;
  setSelectedEvent: (event: Event | null) => void;
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