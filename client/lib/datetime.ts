/**
 * Client-side datetime utilities for time zone conversions
 * Uses date-fns-tz for robust timezone handling including DST transitions
 */

import { format, formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';
import { parseISO, isValid } from 'date-fns';

/**
 * Convert a local datetime-local input string to UTC ISO string
 * @param localInput - datetime-local input value (e.g., "2024-03-15T14:30")
 * @param timeZone - IANA time zone identifier (e.g., "America/New_York")
 * @returns ISO UTC string (e.g., "2024-03-15T19:30:00.000Z")
 */
export function localInputToUtcIso(localInput: string, timeZone: string): string {
  if (!localInput || !timeZone) {
    throw new Error('Both localInput and timeZone are required');
  }

  try {
    // Parse the local input as if it's in the specified timezone
    // datetime-local format: "YYYY-MM-DDTHH:mm" or "YYYY-MM-DDTHH:mm:ss"
    const localDate = parseISO(localInput);
    
    if (!isValid(localDate)) {
      throw new Error('Invalid datetime format');
    }

    // Convert from the local timezone to UTC
    const utcDate = fromZonedTime(localDate, timeZone);
    
    return utcDate.toISOString();
  } catch (error) {
    throw new Error(`Failed to convert local time to UTC: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert a UTC ISO string to local datetime-local input format
 * @param utcIso - UTC ISO string (e.g., "2024-03-15T19:30:00.000Z")
 * @param timeZone - IANA time zone identifier (e.g., "America/New_York")
 * @returns datetime-local input value (e.g., "2024-03-15T14:30")
 */
export function utcIsoToLocalInput(utcIso: string, timeZone: string): string {
  if (!utcIso || !timeZone) {
    throw new Error('Both utcIso and timeZone are required');
  }

  try {
    const utcDate = parseISO(utcIso);
    
    if (!isValid(utcDate)) {
      throw new Error('Invalid ISO datetime format');
    }

    // Convert UTC to local timezone
    const localDate = toZonedTime(utcDate, timeZone);
    
    // Format for datetime-local input (YYYY-MM-DDTHH:mm)
    return format(localDate, "yyyy-MM-dd'T'HH:mm");
  } catch (error) {
    throw new Error(`Failed to convert UTC to local time: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Format an event timestamp in a specific time zone for display
 * @param utcIso - UTC ISO string (e.g., "2024-03-15T19:30:00.000Z")
 * @param timeZone - IANA time zone identifier (e.g., "America/New_York")
 * @param formatPattern - date-fns format pattern (default: "MMM d, yyyy 'at' h:mm a")
 * @returns Formatted datetime string with timezone (e.g., "Mar 15, 2024 at 2:30 PM EDT")
 */
export function formatEventInZone(
  utcIso: string, 
  timeZone: string, 
  formatPattern: string = "MMM d, yyyy 'at' h:mm a"
): string {
  if (!utcIso || !timeZone) {
    throw new Error('Both utcIso and timeZone are required');
  }

  try {
    const utcDate = parseISO(utcIso);
    
    if (!isValid(utcDate)) {
      throw new Error('Invalid ISO datetime format');
    }

    // Format in the specified timezone with timezone abbreviation
    const formatted = formatInTimeZone(utcDate, timeZone, formatPattern);
    const tzAbbr = formatInTimeZone(utcDate, timeZone, 'zzz');
    
    return `${formatted} ${tzAbbr}`;
  } catch (error) {
    throw new Error(`Failed to format event time: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get the current time in a specific timezone formatted for datetime-local input
 * @param timeZone - IANA time zone identifier (e.g., "America/New_York")
 * @returns datetime-local input value (e.g., "2024-03-15T14:30")
 */
export function getCurrentTimeInZone(timeZone: string): string {
  if (!timeZone) {
    throw new Error('timeZone is required');
  }

  try {
    const now = new Date();
    const localDate = toZonedTime(now, timeZone);
    
    // Format for datetime-local input (YYYY-MM-DDTHH:mm)
    return format(localDate, "yyyy-MM-dd'T'HH:mm");
  } catch (error) {
    throw new Error(`Failed to get current time in zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate if a string is a valid IANA time zone identifier
 * @param timeZone - Time zone identifier to validate
 * @returns boolean indicating if the time zone is valid
 */
export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone) return false;
  
  try {
    // Try to format a date in the timezone - this will throw if invalid
    formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd');
    return true;
  } catch {
    return false;
  }
}

/**
 * Get a list of common time zones with their display names
 * @returns Array of time zone options for dropdowns
 */
export function getCommonTimeZones(): Array<{ value: string; label: string }> {
  return [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
    { value: 'Europe/London', label: 'London Time (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
  ];
}