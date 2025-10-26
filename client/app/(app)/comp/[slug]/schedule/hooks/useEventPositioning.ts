import { useMemo } from 'react';
import { Event, EventPosition } from '../types';

/**
 * Custom hook for calculating event positions to handle overlapping events
 */
export function useEventPositioning(events: Event[]): Map<string, EventPosition> {
  return useMemo(() => calculateEventPositions(events), [events]);
}

/**
 * Helper to extract minutes from midnight from a Date
 */
function dateToMinutes(date: Date | null): number {
  if (!date) return 0;
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Helper to compute duration in minutes from start/end dates
 */
function getDuration(startDate: Date | null, endDate: Date | null): number {
  if (!startDate || !endDate) return 60; // default
  return Math.max(15, Math.round((endDate.getTime() - startDate.getTime()) / 60000));
}

/**
 * Algorithm to calculate overlapping events and their positions
 */
function calculateEventPositions(events: Event[]): Map<string, EventPosition> {
  const eventPositions = new Map<string, EventPosition>();
  
  if (events.length === 0) return eventPositions;
  
  // Sort events by start time, then by duration (longer events first for same start time)
  const sortedEvents = [...events].sort((a, b) => {
    const aStart = dateToMinutes(a.startDate);
    const bStart = dateToMinutes(b.startDate);
    if (aStart !== bStart) {
      return aStart - bStart;
    }
    const aDuration = getDuration(a.startDate, a.endDate);
    const bDuration = getDuration(b.startDate, b.endDate);
    return bDuration - aDuration;
  });
  
  // Build overlap groups using a sophisticated algorithm
  const overlapGroups: Event[][] = [];
  
  for (const event of sortedEvents) {
    const eventStartTime = dateToMinutes(event.startDate);
    const eventDuration = getDuration(event.startDate, event.endDate);
    const eventEndTime = eventStartTime + eventDuration;
    let assignedToGroup = false;
    
    // Try to find an existing group where this event overlaps with any member
    for (const group of overlapGroups) {
      const overlapsWithGroup = group.some(groupEvent => {
        const groupStartTime = dateToMinutes(groupEvent.startDate);
        const groupDuration = getDuration(groupEvent.startDate, groupEvent.endDate);
        const groupEventEndTime = groupStartTime + groupDuration;
        return (
          eventStartTime < groupEventEndTime && eventEndTime > groupStartTime
        );
      });
      
      if (overlapsWithGroup) {
        group.push(event);
        assignedToGroup = true;
        break;
      }
    }
    
    // If no overlapping group found, create a new one
    if (!assignedToGroup) {
      overlapGroups.push([event]);
    }
  }
  
  // For each group, assign column positions using a sophisticated layout algorithm
  for (const group of overlapGroups) {
    if (group.length === 1) {
      // Single event, takes full width
      eventPositions.set(group[0].id, { column: 0, totalColumns: 1 });
      continue;
    }
    
    // For multiple events, find the optimal column assignment
    // Sort group by start time for column assignment
    const sortedGroup = [...group].sort((a, b) => {
      const aStart = dateToMinutes(a.startDate);
      const bStart = dateToMinutes(b.startDate);
      return aStart - bStart;
    });
    
    // Track which columns are occupied at each time point
    const columns: { event: Event | null, endTime: number }[] = [];
    
    for (const event of sortedGroup) {
      const eventStartTime = dateToMinutes(event.startDate);
      const eventDuration = getDuration(event.startDate, event.endDate);
      const eventEndTime = eventStartTime + eventDuration;
      
      // Find the first available column
      let assignedColumn = -1;
      for (let i = 0; i < columns.length; i++) {
        if (columns[i].endTime <= eventStartTime) {
          // This column is free
          assignedColumn = i;
          break;
        }
      }
      
      // If no column is available, create a new one
      if (assignedColumn === -1) {
        assignedColumn = columns.length;
        columns.push({ event: null, endTime: 0 });
      }
      
      // Assign the event to this column
      columns[assignedColumn] = { event, endTime: eventEndTime };
      
      eventPositions.set(event.id, {
        column: assignedColumn,
        totalColumns: Math.max(columns.length, group.length)
      });
    }
    
    // Update all events in this group to have the same totalColumns
    const maxColumns = columns.length;
    for (const event of group) {
      const position = eventPositions.get(event.id)!;
      eventPositions.set(event.id, {
        ...position,
        totalColumns: maxColumns
      });
    }
  }
  
  return eventPositions;
}