import React, { useRef } from 'react';
import { useDroppable } from '../../../hooks/useDroppable';
import { DRAG_TYPES } from '../../../hooks/useDraggable';
import { calculateTimeSlotFromPosition } from '../../../utils';
import type { Event, Block, Venue } from '../../../types';
import type { DropTargetMonitor } from 'react-dnd';

type DropItem = {
  dragType: 'event' | 'block';
  state: 'available' | 'scheduled';
  event?: any;
  [key: string]: any;
};

export interface ScheduleDropZoneProps {
  day: Date;
  venue: Venue;
  onEventDrop: (event: Event | Block, day: Date, venue: Venue, timeSlot: number) => void;
  onEventMove: (eventId: string, newDay: Date, newVenue: Venue, newTimeSlot: number) => void;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function ScheduleDropZone({
  day,
  venue,
  onEventDrop,
  onEventMove,
  children,
  className = '',
  style,
}: ScheduleDropZoneProps) {
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const { dropRef, isOver } = useDroppable<DropItem>({
    accept: [DRAG_TYPES.EVENT, DRAG_TYPES.BLOCK],
    onDrop: (item, monitor: DropTargetMonitor) => {
      const clientOffset = monitor.getClientOffset();
      const componentRect = dropZoneRef.current?.getBoundingClientRect();
      
      if (clientOffset && componentRect) {
        const timeSlot = calculateTimeSlotFromPosition(clientOffset.y, componentRect.top);
        
        console.log('Dropped item:', item.dragType, item.state, 'at time slot:', timeSlot);

        if (item.dragType === 'event') {
          if (item.state === 'available') {
            // New event from available list
            console.log('Dropping new event:', item);
            onEventDrop(item as unknown as Event, day, venue, timeSlot);
          } else if (item.state === 'scheduled') {
            // Existing scheduled event being moved
            console.log('Moving scheduled event:', item);
            onEventMove(item.event.event.id, day, venue, timeSlot);
          }
        } else if (item.dragType === 'block') {
          if (item.state === 'available') {
            // New block from available list
            onEventDrop(item as unknown as Block, day, venue, timeSlot);
          } else if (item.state === 'scheduled') {
            // Existing scheduled block being moved
            // Could add onBlockMove handler if needed
            console.log('Moving scheduled block:', item);
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
