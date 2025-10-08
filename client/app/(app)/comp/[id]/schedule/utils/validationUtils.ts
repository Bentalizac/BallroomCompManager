import { ScheduledEvent } from '../types';
import { TIME_CONSTANTS } from '../constants';
import { parseTime, parseDuration, isTimeInSchedule } from './timeUtils';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate time string format
 */
export function validateTimeString(timeStr: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!timeStr.trim()) {
    errors.push('Time is required');
    return { isValid: false, errors, warnings };
  }
  
  const parsedTime = parseTime(timeStr);
  if (parsedTime === null) {
    errors.push('Invalid time format. Use format like "10:30am" or "2:15pm"');
    return { isValid: false, errors, warnings };
  }
  
  if (!isTimeInSchedule(parsedTime)) {
    errors.push(`Time must be between ${formatScheduleTime(TIME_CONSTANTS.START_TIME)} and ${formatScheduleTime(TIME_CONSTANTS.END_TIME)}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate duration string format
 */
export function validateDurationString(durationStr: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!durationStr.trim()) {
    errors.push('Duration is required');
    return { isValid: false, errors, warnings };
  }
  
  const parsedDuration = parseDuration(durationStr);
  if (parsedDuration === null) {
    errors.push('Invalid duration format. Use format like "1h 30min", "90min", or "2h"');
    return { isValid: false, errors, warnings };
  }
  
  if (parsedDuration < TIME_CONSTANTS.LINE_INTERVAL) {
    errors.push(`Duration must be at least ${TIME_CONSTANTS.LINE_INTERVAL} minutes`);
  }
  
  if (parsedDuration > 480) { // 8 hours
    warnings.push('Duration is longer than 8 hours');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate complete scheduled event
 */
export function validateScheduledEvent(event: ScheduledEvent): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate start time
  if (!isTimeInSchedule(event.startTime)) {
    errors.push('Start time is outside schedule bounds');
  }
  
  // Validate duration
  if (event.duration < TIME_CONSTANTS.LINE_INTERVAL) {
    errors.push(`Duration must be at least ${TIME_CONSTANTS.LINE_INTERVAL} minutes`);
  }
  
  // Validate end time
  const endTime = event.startTime + event.duration;
  if (endTime > TIME_CONSTANTS.END_TIME) {
    errors.push('Event extends past schedule end time');
  }
  
  // Validate event data
  if (!event.event.name || event.event.name.trim().length === 0) {
    errors.push('Event name is required');
  }
  
  if (!event.event.category) {
    errors.push('Event category is required');
  }
  
  // Warnings
  if (event.duration > 240) { // 4 hours
    warnings.push('Event duration is longer than 4 hours');
  }
  
  if (event.startTime < TIME_CONSTANTS.START_TIME + 60) { // Before 9am
    warnings.push('Event starts very early in the schedule');
  }
  
  if (endTime > TIME_CONSTANTS.END_TIME - 60) { // After 9pm
    warnings.push('Event ends very late in the schedule');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate event doesn't conflict with existing events
 */
export function validateEventConflicts(
  targetEvent: ScheduledEvent,
  existingEvents: ScheduledEvent[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const conflicts = existingEvents.filter(event => 
    event.event.id !== targetEvent.event.id &&
    event.day === targetEvent.day &&
    event.venue === targetEvent.venue &&
    eventsOverlap(event, targetEvent)
  );
  
  if (conflicts.length > 0) {
    const conflictNames = conflicts.map(e => e.event.name).join(', ');
    errors.push(`Event conflicts with: ${conflictNames}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Check if two events overlap
 */
function eventsOverlap(event1: ScheduledEvent, event2: ScheduledEvent): boolean {
  const event1End = event1.startTime + event1.duration;
  const event2End = event2.startTime + event2.duration;
  
  return event1.startTime < event2End && event1End > event2.startTime;
}

/**
 * Format time for display in validation messages
 */
function formatScheduleTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const ampm = hours < 12 ? 'am' : 'pm';
  return `${displayHours}:${mins.toString().padStart(2, '0')}${ampm}`;
}