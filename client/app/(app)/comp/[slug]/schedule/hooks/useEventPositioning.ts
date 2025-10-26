import { useMemo } from 'react';
import { Event, EventPosition, Block } from '../types';

/**
 * Custom hook for calculating event positions to handle overlapping events
 */
export function useEventPositioning(events: Event[]): Map<string, EventPosition> {
  return useMemo(() => calculateTimelineItemPositions(events), [events]);
}

/**
 * Custom hook for calculating positions for both events and blocks together
 * to handle overlaps between events, blocks, and mixed overlaps
 */
export function useTimelineItemPositioning(
  events: Event[],
  blocks: Block[]
): Map<string, EventPosition> {
  return useMemo(() => {
    // Combine events and blocks into a unified list with a common interface
    type TimelineItem = {
      id: string;
      startDate: Date | null;
      endDate: Date | null;
      type: 'event' | 'block';
    };
    
    const items: TimelineItem[] = [
      ...events.map(e => ({ id: e.id, startDate: e.startDate, endDate: e.endDate, type: 'event' as const })),
      ...blocks.map(b => ({ id: b.id, startDate: b.startDate, endDate: b.endDate, type: 'block' as const }))
    ];
    
    return calculateTimelineItemPositions(items);
  }, [events, blocks]);
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
 * Generic algorithm to calculate overlapping timeline items and their positions
 */
function calculateTimelineItemPositions<T extends { id: string; startDate: Date | null; endDate: Date | null }>(
  items: T[]
): Map<string, EventPosition> {
  const itemPositions = new Map<string, EventPosition>();
  
  if (items.length === 0) return itemPositions;
  
  // Sort items by start time, then by duration (longer items first for same start time)
  const sortedItems = [...items].sort((a, b) => {
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
  const overlapGroups: T[][] = [];
  
  for (const item of sortedItems) {
    const itemStartTime = dateToMinutes(item.startDate);
    const itemDuration = getDuration(item.startDate, item.endDate);
    const itemEndTime = itemStartTime + itemDuration;
    let assignedToGroup = false;
    
    // Try to find an existing group where this item overlaps with any member
    for (const group of overlapGroups) {
      const overlapsWithGroup = group.some(groupItem => {
        const groupStartTime = dateToMinutes(groupItem.startDate);
        const groupDuration = getDuration(groupItem.startDate, groupItem.endDate);
        const groupItemEndTime = groupStartTime + groupDuration;
        return (
          itemStartTime < groupItemEndTime && itemEndTime > groupStartTime
        );
      });
      
      if (overlapsWithGroup) {
        group.push(item);
        assignedToGroup = true;
        break;
      }
    }
    
    // If no overlapping group found, create a new one
    if (!assignedToGroup) {
      overlapGroups.push([item]);
    }
  }
  
  // For each group, assign column positions using a sophisticated layout algorithm
  for (const group of overlapGroups) {
    if (group.length === 1) {
      // Single item, takes full width
      itemPositions.set(group[0].id, { column: 0, totalColumns: 1 });
      continue;
    }
    
    // For multiple items, find the optimal column assignment
    // Sort group by start time for column assignment
    const sortedGroup = [...group].sort((a, b) => {
      const aStart = dateToMinutes(a.startDate);
      const bStart = dateToMinutes(b.startDate);
      return aStart - bStart;
    });
    
    // Track which columns are occupied at each time point
    const columns: { item: T | null, endTime: number }[] = [];
    
    for (const item of sortedGroup) {
      const itemStartTime = dateToMinutes(item.startDate);
      const itemDuration = getDuration(item.startDate, item.endDate);
      const itemEndTime = itemStartTime + itemDuration;
      
      // Find the first available column
      let assignedColumn = -1;
      for (let i = 0; i < columns.length; i++) {
        if (columns[i].endTime <= itemStartTime) {
          // This column is free
          assignedColumn = i;
          break;
        }
      }
      
      // If no column is available, create a new one
      if (assignedColumn === -1) {
        assignedColumn = columns.length;
        columns.push({ item: null, endTime: 0 });
      }
      
      // Assign the item to this column
      columns[assignedColumn] = { item, endTime: itemEndTime };
      
      itemPositions.set(item.id, {
        column: assignedColumn,
        totalColumns: Math.max(columns.length, group.length)
      });
    }
    
    // Update all items in this group to have the same totalColumns
    const maxColumns = columns.length;
    for (const item of group) {
      const position = itemPositions.get(item.id)!;
      itemPositions.set(item.id, {
        ...position,
        totalColumns: maxColumns
      });
    }
  }
  
  return itemPositions;
}