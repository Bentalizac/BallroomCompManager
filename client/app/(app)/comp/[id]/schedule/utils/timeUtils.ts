import { TIME_CONSTANTS } from '../constants';

/**
 * Format minutes from midnight to time string (e.g., 780 -> "1:00pm")
 */
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const ampm = hours < 12 ? 'am' : 'pm';
  return `${displayHours}:${mins.toString().padStart(2, '0')}${ampm}`;
}

/**
 * Format duration in minutes to human readable string (e.g., 90 -> "1h 30min")
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

/**
 * Parse time string to minutes from midnight (e.g., "1:30pm" -> 810)
 */
export function parseTime(timeStr: string): number | null {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
  if (!match) return null;
  
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3].toLowerCase();
  
  if (ampm === 'pm' && hours !== 12) hours += 12;
  if (ampm === 'am' && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
}

/**
 * Parse duration string to minutes (e.g., "1h 30min" -> 90)
 */
export function parseDuration(durationStr: string): number | null {
  const match = durationStr.match(/^(?:(\d+)h\s*)?(?:(\d+)min?)?$/i);
  if (!match) return null;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  
  return hours * 60 + minutes;
}

/**
 * Convert minutes to pixels based on timeline scale
 */
export function minutesToPixels(minutes: number): number {
  return (minutes / TIME_CONSTANTS.SLOT_INTERVAL) * TIME_CONSTANTS.PIXELS_PER_SLOT;
}

/**
 * Convert pixels to minutes based on timeline scale
 */
export function pixelsToMinutes(pixels: number): number {
  return (pixels / TIME_CONSTANTS.PIXELS_PER_SLOT) * TIME_CONSTANTS.SLOT_INTERVAL;
}

/**
 * Round time to nearest slot interval
 */
export function roundToNearestSlot(minutes: number): number {
  return Math.round(minutes / TIME_CONSTANTS.SLOT_INTERVAL) * TIME_CONSTANTS.SLOT_INTERVAL;
}

/**
 * Clamp time within schedule bounds
 */
export function clampTimeToSchedule(minutes: number): number {
  return Math.max(TIME_CONSTANTS.START_TIME, Math.min(TIME_CONSTANTS.END_TIME, minutes));
}

/**
 * Check if time is within schedule bounds
 */
export function isTimeInSchedule(minutes: number): boolean {
  return minutes >= TIME_CONSTANTS.START_TIME && minutes <= TIME_CONSTANTS.END_TIME;
}

/**
 * Get time position for timeline display (minutes from start of schedule)
 */
export function getTimePosition(minutes: number): number {
  return minutes - TIME_CONSTANTS.START_TIME;
}

/**
 * Convert relative position to absolute time
 */
export function positionToTime(position: number): number {
  return TIME_CONSTANTS.START_TIME + position;
}