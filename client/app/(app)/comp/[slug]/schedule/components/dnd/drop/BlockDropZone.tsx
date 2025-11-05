import React, { useRef } from 'react';
import { useDroppable } from '../../../hooks/useDroppable';
import { DRAG_TYPES } from '../../../hooks/useDraggable';
import type { Block } from '../../../types';
import type { DropTargetMonitor } from 'react-dnd';
import { useScheduleState } from '../../../hooks';
import { STATE_TYPES } from '../../dnd/drag/draggableItem';
import { DraggableEvent } from '../drag/draggableEvent';

type DropItem = {
  dragType: 'event' | 'block';
  state?: 'available' | 'scheduled' | 'infinite' | 'in_block';
  id: string;
  // We also carry startDate/endDate when dragging scheduled items via DraggableItem
  startDate?: Date | null;
  endDate?: Date | null;
  [key: string]: any;
};

export interface BlockDropZoneProps {
  block: Block;
  children?: React.ReactNode | ((ctx: { isOver: boolean }) => React.ReactNode);
  className?: string;
  style?: React.CSSProperties;
  // Constrain the internal events list between header and resize handle
  eventsAreaTopPx?: number;    // distance from top in pixels
  eventsAreaBottomPx?: number; // distance from bottom in pixels
}

export function BlockDropZone({
  block,
  children,
  className = '',
  style,
  eventsAreaTopPx = 20,    // ~top-5 (1.25rem)
  eventsAreaBottomPx = 16, // ~bottom-4 (1rem)
}: BlockDropZoneProps) {
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const schedule = useScheduleState();

  const getDurationMins = (start: Date | null | undefined, end: Date | null | undefined): number | null => {
    if (!start || !end) return null;
    return Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));
  };

  const { dropRef, isOver } = useDroppable<DropItem>({
    accept: [DRAG_TYPES.EVENT],
    onDrop: (item, monitor: DropTargetMonitor) => {
      const clientOffset = monitor.getClientOffset();
      const rect = dropZoneRef.current?.getBoundingClientRect();

      let relativeMinutes: number | undefined = undefined;
      if (clientOffset && rect) {
        const effectiveClientY = clientOffset.y - (typeof (item as any).grabOffsetY === 'number' ? (item as any).grabOffsetY : 0);
        const effectiveClientX = clientOffset.x - (typeof (item as any).grabOffsetX === 'number' ? (item as any).grabOffsetX : 0);
        const yWithin = effectiveClientY - rect.top; // px from top within block based on preview top
        // If block has a known duration, map pixel position to minutes within block
        const blockDuration = getDurationMins(block.startDate ?? null, block.endDate ?? null);
        if (blockDuration && rect.height > 0) {
          const ratio = Math.min(1, Math.max(0, yWithin / rect.height));
          relativeMinutes = Math.round(blockDuration * ratio);
        }
      }

      if (item.dragType === 'event') {
        // 1) Update the Event state to IN_BLOCK
        schedule.handleEventUpdate(item.id, { state: STATE_TYPES.IN_BLOCK });

        // 2) Remove this event from any other blocks it may belong to
        schedule.blocks
          .filter(b => b.id !== block.id && Array.isArray(b.eventIds) && b.eventIds.includes(item.id))
          .forEach(b => {
            const cleaned = (b.eventIds || []).filter(eid => eid !== item.id);
            schedule.handleBlockUpdate(b.id, { eventIds: cleaned });
          });

        // 3) Update the target Block to include this event's ID (ensure uniqueness)
        const existingIds = Array.isArray(block.eventIds) ? block.eventIds : [];
        const nextIds = existingIds.includes(item.id)
          ? existingIds
          : [...existingIds, item.id];
        schedule.handleBlockUpdate(block.id, { eventIds: nextIds });

        // Dev log: only for dragging an event into a block
        try {
          const blockInfo = {
            blockId: (block as any)?.id,
            blockName: (block as any)?.name,
            blockStart: block.startDate ? new Date(block.startDate).toISOString() : null,
            blockEnd: block.endDate ? new Date(block.endDate).toISOString() : null,
          };
          const dropMetrics = {
            relativeMinutes,
            blockHeight: rect?.height,
            pointerYWithin: clientOffset && rect ? clientOffset.y - rect.top : undefined,
          };
          // Note: item may or may not carry a name
          // eslint-disable-next-line no-console
          console.log('[BlockDropZone] Event dropped into block', {
            eventId: item.id,
            eventName: (item as any)?.name,
            ...blockInfo,
            ...dropMetrics,
          });
        } catch {
          // eslint-disable-next-line no-console
          console.log('[BlockDropZone] Event dropped into block', {
            eventId: item.id,
            relativeMinutes,
          });
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
      className={`relative h-full ${isOver ? 'ring-2 ring-blue-300' : ''} ${className}`}
      style={style}
    >
      {typeof children === 'function' ? (children as (ctx: { isOver: boolean }) => React.ReactNode)({ isOver }) : children}
      {/* Inline display of events constrained to the inner area (scrollable) */}
      {Array.isArray(block.eventIds) && block.eventIds.length > 0 && (
        <div
          className="absolute rounded space-y-1 overflow-auto text-white"
          style={{
            left: 4,
            right: 4,
            top: eventsAreaTopPx,
            bottom: eventsAreaBottomPx,
            padding: 4,
            zIndex: 2,
          }}
        >
          {block.eventIds.map((id) => {
            const ev = schedule.events.find(e => e.id === id);
            if (!ev) return null;
            return (
              <div key={id} className="shrink-0">
                <DraggableEvent event={ev} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
