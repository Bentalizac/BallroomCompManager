import React from 'react';
import { useDroppable } from '../../../hooks/useDroppable';
import type { DragType } from '../../../hooks/useDraggable';
import type { DropTargetMonitor } from 'react-dnd';

export interface DropItemProps<TItem> {
  accept: DragType | DragType[];
  onDrop?: (item: TItem, monitor: DropTargetMonitor) => void;
  canDrop?: (item: TItem) => boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function DropItem<TItem>({
  accept,
  onDrop,
  canDrop,
  children,
  className = '',
  style,
}: DropItemProps<TItem>) {
  const { dropRef, isOver, canDropHere } = useDroppable<TItem>({
    accept,
    onDrop,
    canDrop,
  });

  return (
    <div
      ref={dropRef as any}
      className={`${className} ${isOver && canDropHere ? 'ring-2 ring-blue-400' : ''}`}
      style={style}
    >
      {children}
    </div>
  );
}
