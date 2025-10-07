import { TIME_SLOTS, LAYOUT_CONSTANTS } from '../../constants';
import { formatTime } from '../../utils';

export function TimeGrid() {
  return (
    <>
      {TIME_SLOTS.map((timeSlot) => (
        <div
          key={timeSlot}
          className="relative border-b border-gray-200"
          style={{ height: `${LAYOUT_CONSTANTS.GRID_SLOT_HEIGHT}px` }}
        >
          {timeSlot % 120 === 0 && ( // Show time labels every 2 hours
            <div className="absolute -left-16 top-0 text-xs text-gray-500 w-14 text-right">
              {formatTime(timeSlot)}
            </div>
          )}
        </div>
      ))}
    </>
  );
}