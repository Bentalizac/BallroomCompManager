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
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function BlockDropZone({
  block,
  children,
  className = '',
  style,
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
        const yWithin = clientOffset.y - rect.top; // px from top within block
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
      {children}
      {/* Basic inline display of events inside this block */}
      {Array.isArray(block.eventIds) && block.eventIds.length > 0 && (
        <div className="absolute left-1 bottom-1 right-1 bg-white/80 p-1 rounded space-y-1 overflow-auto max-h-full" style={{ zIndex: 5 }}>
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
