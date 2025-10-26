import React, { useRef } from 'react';
import { useDroppable } from '../../../hooks/useDroppable';
import { DRAG_TYPES } from '../../../hooks/useDraggable';
import { calculateTimeSlotFromPosition } from '../../../utils';
import type { Event, Block, Venue } from '../../../types';
import type { DropTargetMonitor } from 'react-dnd';
import { LAYOUT_CONSTANTS } from '../../../constants';
import { STATE_TYPES } from '../../dnd/drag/draggableItem';
import { useScheduleState } from '../../../hooks';


// Helper to build a Date from day + minutes-from-midnight
const minutesToDate = (baseDay: Date, minutes: number) => {
  const result = new Date(baseDay);
  result.setHours(0, 0, 0, 0);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  result.setHours(hours, mins, 0, 0);
  return result;
};


type DropItem = {
  dragType: 'event' | 'block';
  state: 'available' | 'scheduled' | 'infinite' | 'in_block';
  id: string;
  [key: string]: any;
};

export interface ScheduleDropZoneProps {
  day: Date;
  venue: Venue;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function ScheduleDropZone({
  day,
  venue,
  children,
  className = '',
  style,
}: ScheduleDropZoneProps) {
  const schedule = useScheduleState();
  const dropZoneRef = useRef<HTMLDivElement>(null);



  // Helper to compute duration in minutes given start and end
  const getDurationMins = (start: Date | null | undefined, end: Date | null | undefined): number | null => {
    if (!start || !end) return null;
    return Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));
  };

  // When an available item (event or block) is dropped into this venue/day
  const onEventDrop = (eventID: string, dropDay: Date, dropVenue: Venue, timeSlot: number) => {
    const startDate = minutesToDate(dropDay, timeSlot);
    const durationMinutes = LAYOUT_CONSTANTS.DEFAULT_EVENT_DURATION;
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
    if (schedule.events.find(b => b.id === eventID && b.state === STATE_TYPES.INFINITE)) {
      schedule.handleEventCopy(eventID);
    }
    schedule.handleEventUpdate(eventID, {
      state: STATE_TYPES.SCHEDULED,
      venue: dropVenue,
      startDate,
      endDate,
    });
    
  };
  
  // When a scheduled event is moved within the timeline
  const onEventMove = (
    eventId: string,
    newDay: Date,
    newVenue: Venue,
    newTimeSlot: number,
    durationOverride?: number
  ) => {
    const startDate = minutesToDate(newDay, newTimeSlot);
    // Prefer passed duration, else compute from current event in state, else default
    let durationMinutes = typeof durationOverride === 'number'
      ? durationOverride
      : (() => {
          const ev = schedule.events.find(e => e.id === eventId);
          const d = getDurationMins(ev?.startDate ?? null, ev?.endDate ?? null);
          return d ?? LAYOUT_CONSTANTS.DEFAULT_EVENT_DURATION;
        })();
    // Guard against non-positive durations
    if (durationMinutes <= 0) durationMinutes = LAYOUT_CONSTANTS.DEFAULT_EVENT_DURATION;
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

    schedule.handleEventUpdate(eventId, {
      state: STATE_TYPES.SCHEDULED,
      venue: newVenue,
      startDate,
      endDate,
    });
  };

  const onBlockDrop = (blockID: string, dropDay: Date, dropVenue: Venue, timeSlot: number) => {
    const startDate = minutesToDate(dropDay, timeSlot);
    const durationMinutes = LAYOUT_CONSTANTS.DEFAULT_EVENT_DURATION;
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
    if (schedule.blocks.find(b => b.id === blockID && b.state === STATE_TYPES.INFINITE)) {
      schedule.handleBlockCopy(blockID);
    }
    schedule.handleBlockUpdate(blockID, {
      state: STATE_TYPES.SCHEDULED,
      venue: dropVenue,
      startDate,
      endDate,
    });
  };

  const onBlockMove = (
    blockId: string,
    newDay: Date,
    newVenue: Venue,
    newTimeSlot: number,
    durationOverride?: number
  ) => {
    const startDate = minutesToDate(newDay, newTimeSlot);
    // Prefer passed duration, else compute from current block in state, else default
    let durationMinutes = typeof durationOverride === 'number'
      ? durationOverride
      : (() => {
          const blk = schedule.blocks.find(b => b.id === blockId);
          const d = getDurationMins(blk?.startDate ?? null, blk?.endDate ?? null);
          return d ?? LAYOUT_CONSTANTS.DEFAULT_EVENT_DURATION;
        })();
    if (durationMinutes <= 0) durationMinutes = LAYOUT_CONSTANTS.DEFAULT_EVENT_DURATION;
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
    schedule.handleBlockUpdate(blockId, {
      state: STATE_TYPES.SCHEDULED,
      venue: newVenue,
      startDate,
      endDate,
    });
  }

  const { dropRef, isOver } = useDroppable<DropItem>({
    accept: [DRAG_TYPES.EVENT, DRAG_TYPES.BLOCK],
    onDrop: (item, monitor: DropTargetMonitor) => {
      const clientOffset = monitor.getClientOffset();
      const componentRect = dropZoneRef.current?.getBoundingClientRect();
      
      if (clientOffset && componentRect) {
        const effectiveClientY = clientOffset.y - (typeof item.grabOffsetY === 'number' ? item.grabOffsetY : 0);
        const timeSlot = calculateTimeSlotFromPosition(effectiveClientY, componentRect.top);
        
        if (item.dragType === 'event') {
          // If the event was previously inside a block, remove it from any block first
          const removeFromAllBlocks = (eventId: string) => {
            schedule.blocks
              .filter(b => Array.isArray(b.eventIds) && b.eventIds.includes(eventId))
              .forEach(b => {
                const cleaned = (b.eventIds || []).filter(eid => eid !== eventId);
                schedule.handleBlockUpdate(b.id, { eventIds: cleaned });
              });
          };
          if (item.state === 'available' || item.state === 'infinite') {
            // New event from available list
            onEventDrop(item.id, day, venue, timeSlot);
          } else if (item.state === 'in_block') {
            // Event leaving a block and moving into the schedule grid
            removeFromAllBlocks(item.id);
            const d = getDurationMins(item.startDate, item.endDate) ?? undefined;
            onEventMove(item.id, day, venue, timeSlot, d);
          } else if (item.state === 'scheduled') {
            // Existing scheduled event being moved
            // Compute duration from dragged item if possible
            const d = getDurationMins(item.startDate, item.endDate) ?? undefined;
            onEventMove(item.id, day, venue, timeSlot, d);
          }
        } else if (item.dragType === 'block') {
          if (item.state === 'available' || item.state === 'infinite') {
            // New block from available list
            onBlockDrop(item.id, day, venue, timeSlot);
          } else if (item.state === 'scheduled') {
            // Existing scheduled block being moved
            // Preserve resized duration if present on dragged item
            const d = getDurationMins(item.startDate, item.endDate) ?? undefined;
            onBlockMove(item.id, day, venue, timeSlot, d);
          }
        }
      }
    },
  });

  // Combine refs
  const combinedRef = (node: HTMLDivElement) => {
    dropRef(node);
    dropZoneRef.current = node;
  };

  return (
    <div
      ref={combinedRef as any}
      className={`relative ${className} ${isOver ? 'bg-blue-50' : ''}`}
      style={style}
    >
      {children}
    </div>
  );
}
