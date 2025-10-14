import { useDragLayer } from 'react-dnd';
import { LAYOUT_CONSTANTS } from '../../constants';
import { getDragItemHeight, getEventDisplayColor } from '../../utils';

export function CustomDragLayer() {
  const { item, itemType, isDragging, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  if (!isDragging || itemType !== 'scheduled-event' || !currentOffset) {
    return null;
  }

  const height = getDragItemHeight(item.duration);

  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 100,
        left: currentOffset.x,
        top: currentOffset.y,
        width: `${LAYOUT_CONSTANTS.DRAG_PREVIEW_WIDTH}px`,
      }}
    >
      <div
        className="rounded shadow-lg border-2 border-blue-400 opacity-90"
        style={{ 
          backgroundColor: getEventDisplayColor(item, 0.8),
          height: `${height}px`,
          minHeight: '12px'
        }}
      >
        <div className="p-1 h-full overflow-hidden relative">
          <div className="text-xs font-medium text-gray-800 truncate">
            {item.event.name}
          </div>
          <div className="absolute top-1 right-1 text-xs text-blue-600 font-medium">
            MOVE
          </div>
        </div>
      </div>
    </div>
  );
}