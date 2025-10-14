// Types for user-configurable settings
export type LayoutSettings = {
  GAP_PERCENTAGE: number; // gap percent between overlapping events
  DEFAULT_EVENT_DURATION: number; // in minutes
  MIN_EVENT_DURATION: number; // in minutes
  DRAG_PREVIEW_WIDTH: number; // Width in pixels of drag preview
  GRID_SLOT_HEIGHT: number; // Height in pixels of each grid line
};

export type TimeSettings = {
  START_TIME: number; // minutes from midnight
  END_TIME: number; // minutes from midnight
  TIME_GAP_INTERVAL: number; // gap in minutes per line
};

// Derived settings that are calculated from user settings
export type DerivedTimeSettings = {
  LINES_PER_HOUR: number;
  TOTAL_LINES: number;
};

export type TimelineConfig = TimeSettings & DerivedTimeSettings;

// Default configuration - can be overridden by user settings
export const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
  GAP_PERCENTAGE: 1,
  DEFAULT_EVENT_DURATION: 60,
  MIN_EVENT_DURATION: 15,
  DRAG_PREVIEW_WIDTH: 180,
  GRID_SLOT_HEIGHT: 36
};

export const DEFAULT_TIME_SETTINGS: TimeSettings = {
  START_TIME: 480, // 8:00 AM
  END_TIME: 1320,  // 10:00 PM
  TIME_GAP_INTERVAL: 15 // 15 minutes per line
};

// Function to calculate derived time settings
export function calculateDerivedTimeSettings(timeSettings: TimeSettings): DerivedTimeSettings {
  return {
    LINES_PER_HOUR: 60 / timeSettings.TIME_GAP_INTERVAL,
    TOTAL_LINES: Math.ceil((timeSettings.END_TIME - timeSettings.START_TIME) / timeSettings.TIME_GAP_INTERVAL)
  };
}

// Function to get complete time configuration
export function getTimelineConfig(timeSettings: TimeSettings = DEFAULT_TIME_SETTINGS): TimelineConfig {
  return {
    ...timeSettings,
    ...calculateDerivedTimeSettings(timeSettings)
  };
}

// Current active configuration (will be replaced by user settings system)
let currentLayoutSettings = { ...DEFAULT_LAYOUT_SETTINGS };
let currentTimeSettings = { ...DEFAULT_TIME_SETTINGS };

// Functions to update settings (will be used by settings UI)
export function updateLayoutSettings(newSettings: Partial<LayoutSettings>): void {
  currentLayoutSettings = { ...currentLayoutSettings, ...newSettings };
}

export function updateTimeSettings(newSettings: Partial<TimeSettings>): void {
  currentTimeSettings = { ...currentTimeSettings, ...newSettings };
}

// Getters for current settings
export function getCurrentLayoutSettings(): LayoutSettings {
  return { ...currentLayoutSettings };
}

export function getCurrentTimeSettings(): TimelineConfig {
  return getTimelineConfig(currentTimeSettings);
}

// Legacy constants for backward compatibility (these will use current settings)
export const LAYOUT_CONSTANTS = {
  get GAP_PERCENTAGE() { return getCurrentLayoutSettings().GAP_PERCENTAGE; },
  get DEFAULT_EVENT_DURATION() { return getCurrentLayoutSettings().DEFAULT_EVENT_DURATION; },
  get MIN_EVENT_DURATION() { return getCurrentLayoutSettings().MIN_EVENT_DURATION; },
  get DRAG_PREVIEW_WIDTH() { return getCurrentLayoutSettings().DRAG_PREVIEW_WIDTH; },
  get GRID_SLOT_HEIGHT() { return getCurrentLayoutSettings().GRID_SLOT_HEIGHT; }
};

export const TIME_CONSTANTS = {
  get START_TIME() { return getCurrentTimeSettings().START_TIME; },
  get END_TIME() { return getCurrentTimeSettings().END_TIME; },
  get LINE_INTERVAL() { return getCurrentTimeSettings().TIME_GAP_INTERVAL; },
  get LINES_PER_HOUR() { return getCurrentTimeSettings().LINES_PER_HOUR; },
  get TOTAL_LINES() { return getCurrentTimeSettings().TOTAL_LINES; },
  // Legacy aliases
  get SLOT_INTERVAL() { return getCurrentTimeSettings().TIME_GAP_INTERVAL; },
  get PIXELS_PER_SLOT() { return getCurrentLayoutSettings().GRID_SLOT_HEIGHT; },
  get SLOTS_PER_HOUR() { return getCurrentTimeSettings().LINES_PER_HOUR; },
  get TOTAL_SLOTS() { return getCurrentTimeSettings().TOTAL_LINES; }
};

// Generate time slots array (will update when settings change)
export function getTimeSlots(): number[] {
  const config = getCurrentTimeSettings();
  return Array.from(
    { length: config.TOTAL_LINES }, 
    (_, i) => config.START_TIME + i * config.TIME_GAP_INTERVAL
  );
}

// Legacy export for compatibility
export const TIME_SLOTS = getTimeSlots();