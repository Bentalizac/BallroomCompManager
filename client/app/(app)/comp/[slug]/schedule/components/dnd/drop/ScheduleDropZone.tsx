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
    
  };  // When a scheduled event is moved within the timeline
  const onEventMove = (eventId: string, newDay: Date, newVenue: Venue, newTimeSlot: number) => {
    const startDate = minutesToDate(newDay, newTimeSlot);
    const durationMinutes = LAYOUT_CONSTANTS.DEFAULT_EVENT_DURATION;
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

  const onBlockMove = (blockId: string, newDay: Date, newVenue: Venue, newTimeSlot: number) => {
    const startDate = minutesToDate(newDay, newTimeSlot);
    const durationMinutes = LAYOUT_CONSTANTS.DEFAULT_EVENT_DURATION;
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
        const timeSlot = calculateTimeSlotFromPosition(clientOffset.y, componentRect.top);
        
        console.log('Dropped item:', {
          dragType: item.dragType,
          state: item.state,
          id: item.id,
          timeSlot,
          day,
          venue,
          fullItem: item
        });

        if (item.dragType === 'event') {
          if (item.state === 'available' || item.state === 'infinite') {
            // New event from available list
            console.log('Dropping new event with ID:', item.id);
            onEventDrop(item.id, day, venue, timeSlot);
          } else if (item.state === 'scheduled') {
            // Existing scheduled event being moved
            console.log('Moving scheduled event:', item.id);
            onEventMove(item.id, day, venue, timeSlot);
          }
        } else if (item.dragType === 'block') {
          if (item.state === 'available' || item.state === 'infinite') {
            // New block from available list
            console.log('Dropping new block with ID:', item.id);
            onBlockDrop(item.id, day, venue, timeSlot);
          } else if (item.state === 'scheduled') {
            // Existing scheduled block being moved
            console.log('Moving scheduled block:', item.id);
            onBlockMove(item.id, day, venue, timeSlot);
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
