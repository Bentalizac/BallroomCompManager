import { useEffect } from 'react';
import { Event } from '../types';
import { useScheduleState } from './useScheduleState';

export const useKeyboardShortcuts = () => {

  const schedule = useScheduleState();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete key - delete selected event
      if (e.key === 'Delete' && schedule.selectedItemID) {
        schedule.handleEventDelete(schedule.selectedItemID);
      }
      
      // Escape key - clear selection
      if (e.key === 'Escape') {
        schedule.setSelectedItemID(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [schedule]);
}