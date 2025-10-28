import { useDragLayer } from 'react-dnd';
import { useEffect } from 'react';
import { LAYOUT_CONSTANTS, TIME_CONSTANTS } from '../../constants';
import { DRAG_TYPES } from '../../hooks/useDraggable';
import { useVenueLayout } from '../../context/VenueLayoutContext';
import { useDragPreview } from '../../context/DragPreviewContext';
import { getContrastingTextColor } from '../../utils';

export function CustomDragLayer() {
  const { item, itemType, isDragging, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getClientOffset(),
  }));
  
  const { findVenueAtPosition } = useVenueLayout();
  const { setTargetVenue } = useDragPreview();

  // Calculate which venue the preview center is over and broadcast it
  useEffect(() => {
    if (!isDragging || !currentOffset || !item) {
      setTargetVenue(null);
      return;
    }

    // Only track for timeline items (events and blocks with schedule info)
    if (itemType !== DRAG_TYPES.EVENT && itemType !== DRAG_TYPES.BLOCK) {
      setTargetVenue(null);
      return;
    }

    // Calculate preview position
    const adjustedX = currentOffset.x - (item.grabOffsetX || 0);
    const estimatedPreviewWidth = 200;
    const previewCenterX = adjustedX + (estimatedPreviewWidth / 2);

    // Find target venue if item has day information
    if (item.day) {
      const venue = findVenueAtPosition(previewCenterX, item.day);
      if (venue) {
        setTargetVenue({ venue, day: item.day });
      } else {
        setTargetVenue(null);
      }
    } else {
      setTargetVenue(null);
    }
  }, [isDragging, currentOffset, item, itemType, findVenueAtPosition, setTargetVenue]);

  if (!isDragging || !currentOffset) {
    return null;
  }

  // Only show preview for our drag types
  if (itemType !== DRAG_TYPES.EVENT && itemType !== DRAG_TYPES.BLOCK) {
    return null;
  }

  // Calculate height based on duration if available
  let height = LAYOUT_CONSTANTS.DEFAULT_EVENT_DURATION;
  if (item.startDate && item.endDate) {
    const durationMinutes = Math.round((new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) / 60000);
    if (durationMinutes > 0) {
      height = (durationMinutes / TIME_CONSTANTS.LINE_INTERVAL) * TIME_CONSTANTS.PIXELS_PER_SLOT;
    }
  }

  // Adjust position based on grab offset
  const adjustedX = currentOffset.x - (item.grabOffsetX || 0);
  const adjustedY = currentOffset.y - (item.grabOffsetY || 0);

  // Use the same colors as timeline items
  const EVENT_COLOR = '#673d72ff';
  const BLOCK_COLOR = '#9970a3ff';
  const backgroundColor = itemType === DRAG_TYPES.EVENT ? EVENT_COLOR : BLOCK_COLOR;
  const textColor = getContrastingTextColor(backgroundColor);
  const displayName = item.name || item.id;

  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 100,
        left: adjustedX,
        top: adjustedY,
        width: '200px',
      }}
    >
      <div
        className="rounded shadow-lg border-2 border-purple-400"
        style={{ 
          backgroundColor,
          height: `${height}px`,
          minHeight: '20px',
          opacity: 1, // Fully opaque
        }}
      >
        <div className="p-1 h-full overflow-hidden relative">
          <div className="text-xs font-medium truncate" style={{ color: textColor }}>
            {displayName}
          </div>
        </div>
      </div>
    </div>
  );
}