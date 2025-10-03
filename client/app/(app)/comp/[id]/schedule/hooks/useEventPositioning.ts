import { useMemo } from 'react';
import { ScheduledEvent, EventPosition } from '../types';

/**
 * Custom hook for calculating event positions to handle overlapping events
 */
export function useEventPositioning(events: ScheduledEvent[]): Map<string, EventPosition> {
  return useMemo(() => calculateEventPositions(events), [events]);
}

/**
 * Algorithm to calculate overlapping events and their positions
 */
function calculateEventPositions(events: ScheduledEvent[]): Map<string, EventPosition> {
  const eventPositions = new Map<string, EventPosition>();
  
  if (events.length === 0) return eventPositions;
  
  // Sort events by start time, then by duration (longer events first for same start time)
  const sortedEvents = [...events].sort((a, b) => {
    if (a.startTime !== b.startTime) {
      return a.startTime - b.startTime;
    }
    return b.duration - a.duration;
  });
  
  // Build overlap groups using a sophisticated algorithm
  const overlapGroups: ScheduledEvent[][] = [];
  
  for (const event of sortedEvents) {
    const eventEndTime = event.startTime + event.duration;
    let assignedToGroup = false;
    
    // Try to find an existing group where this event overlaps with any member
    for (const group of overlapGroups) {
      const overlapsWithGroup = group.some(groupEvent => {
        const groupEventEndTime = groupEvent.startTime + groupEvent.duration;
        return (
          event.startTime < groupEventEndTime && eventEndTime > groupEvent.startTime
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
      eventPositions.set(group[0].event.id, { column: 0, totalColumns: 1 });
      continue;
    }
    
    // For multiple events, find the optimal column assignment
    // Sort group by start time for column assignment
    const sortedGroup = [...group].sort((a, b) => a.startTime - b.startTime);
    
    // Track which columns are occupied at each time point
    const columns: { event: ScheduledEvent | null, endTime: number }[] = [];
    
    for (const event of sortedGroup) {
      const eventEndTime = event.startTime + event.duration;
      
      // Find the first available column
      let assignedColumn = -1;
      for (let i = 0; i < columns.length; i++) {
        if (columns[i].endTime <= event.startTime) {
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
      
      eventPositions.set(event.event.id, {
        column: assignedColumn,
        totalColumns: Math.max(columns.length, group.length)
      });
    }
    
    // Update all events in this group to have the same totalColumns
    const maxColumns = columns.length;
    for (const event of group) {
      const position = eventPositions.get(event.event.id)!;
      eventPositions.set(event.event.id, {
        ...position,
        totalColumns: maxColumns
      });
    }
  }
  
  return eventPositions;
}