import { TIME_CONSTANTS } from '../constants';
import { pixelsToMinutes, roundToNearestSlot, clampTimeToSchedule } from './timeUtils';

/**
 * Calculate time slot from drop position
 */
export function calculateTimeSlotFromPosition(
  clientY: number,
  componentTop: number
): number {
  const relativeY = clientY - componentTop;
  
  // Convert pixel position to minutes
  const minutesFromStart = pixelsToMinutes(relativeY);
  const calculatedTime = TIME_CONSTANTS.START_TIME + minutesFromStart;
  
  // Round to nearest slot and clamp to schedule bounds
  const timeSlot = roundToNearestSlot(calculatedTime);
  return clampTimeToSchedule(timeSlot);
}

/**
 * Check if drag item is a scheduled event
 */
export function isScheduledEvent(item: any): item is { startTime: number } {
  return item && typeof item.startTime === 'number';
}

/**
 * Calculate event position for rendering
 */
export function calculateEventRenderPosition(
  startTime: number,
  column: number,
  totalColumns: number
): {
  topPosition: number;
  leftPercentage: number;
  widthPercentage: number;
} {
  // Calculate top position based on start time
  const topPosition = ((startTime - TIME_CONSTANTS.START_TIME) / TIME_CONSTANTS.LINE_INTERVAL) * TIME_CONSTANTS.PIXELS_PER_SLOT;
  
  // Calculate width and left offset for overlapping events
  const gapPercentage = totalColumns > 1 ? 1 : 0; // 1% gap between events
  const availableWidth = 100 - (gapPercentage * (totalColumns - 1));
  const widthPercentage = availableWidth / totalColumns;
  const leftPercentage = column * (widthPercentage + gapPercentage);
  
  return {
    topPosition,
    leftPercentage,
    widthPercentage
  };
}

/**
 * Handle resize delta calculation
 */
export function calculateResizeDelta(
  deltaY: number,
  currentDuration: number,
  minDuration: number = TIME_CONSTANTS.LINE_INTERVAL
): number {
  const deltaMinutes = Math.round(pixelsToMinutes(deltaY));
  return Math.max(minDuration, currentDuration + deltaMinutes);
}

/**
 * Get drag item display height
 */
export function getDragItemHeight(duration: number): number {
  return Math.max(
    TIME_CONSTANTS.PIXELS_PER_SLOT, // Minimum height
    (duration / TIME_CONSTANTS.LINE_INTERVAL) * TIME_CONSTANTS.PIXELS_PER_SLOT
  );
}