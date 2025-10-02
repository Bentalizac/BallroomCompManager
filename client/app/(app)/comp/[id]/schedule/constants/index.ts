import { Venue, Day, EventCategory } from '../types';

// Time constants
export const TIME_CONSTANTS = {
  START_TIME: 480, // 8:00 AM in minutes from midnight
  END_TIME: 1320,  // 10:00 PM in minutes from midnight
  SLOT_INTERVAL: 15, // 15 minutes per slot
  PIXELS_PER_SLOT: 12, // 12px per 15-minute slot
  SLOTS_PER_HOUR: 4, // 4 slots per hour (15min each)
  TOTAL_SLOTS: 56 // Total number of time slots (8am-10pm)
} as const;

// Layout constants
export const LAYOUT_CONSTANTS = {
  GAP_PERCENTAGE: 1, // 1% gap between overlapping events
  DEFAULT_EVENT_DURATION: 60, // 1 hour default duration
  MIN_EVENT_DURATION: 15, // 15 minutes minimum duration
  DRAG_PREVIEW_WIDTH: 180 // Width of drag preview in pixels
} as const;

// Available venues
export const VENUES = [Venue.WILK, Venue.RB] as const;

// Available days
export const DAYS = [Day.DAY_1, Day.DAY_2] as const;

// Event colors by category
export const EVENT_COLORS = {
  [EventCategory.LATIN]: '#b8a8d4',
  [EventCategory.BALLROOM]: '#8fa4d4',
  [EventCategory.OTHER]: '#d4a8b8'
} as const;

// Generate time slots array
export const TIME_SLOTS = Array.from(
  { length: TIME_CONSTANTS.TOTAL_SLOTS }, 
  (_, i) => TIME_CONSTANTS.START_TIME + i * TIME_CONSTANTS.SLOT_INTERVAL
);

// Day labels
export const DAY_LABELS = {
  [Day.DAY_1]: '10/9',
  [Day.DAY_2]: '10/10'
} as const;

// Venue labels
export const VENUE_LABELS = {
  [Venue.WILK]: 'Wilk',
  [Venue.RB]: 'RB'
} as const;