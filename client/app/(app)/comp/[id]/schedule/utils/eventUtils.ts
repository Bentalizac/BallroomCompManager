import { ScheduledEvent, Event, Venue } from '../types';

/**
 * Check if two events overlap in time
 */
export function eventsOverlap(event1: ScheduledEvent, event2: ScheduledEvent): boolean {
  const event1End = event1.startTime + event1.duration;
  const event2End = event2.startTime + event2.duration;
  
  return event1.startTime < event2End && event1End > event2.startTime;
}

/**
 * Group events by venue and day
 */
export function groupEventsByVenueAndDay(events: ScheduledEvent[]): {
  [key: string]: ScheduledEvent[]
} {
  return events.reduce((groups, event) => {
    const key = `${event.day}-${event.venue}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(event);
    return groups;
  }, {} as { [key: string]: ScheduledEvent[] });
}

/**
 * Filter events for specific venue and day
 */
export function filterEventsByVenueAndDay(
  events: ScheduledEvent[], 
  day: Date, 
  venue: Venue
): ScheduledEvent[] {
  return events.filter(event => 
    event.day.toDateString() === day.toDateString() && 
    event.venue.name === venue.name
  );
}

/**
 * Validate event timing constraints
 */
export function validateEventTimes(event: ScheduledEvent): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check if start time is valid
  if (event.startTime < 480 || event.startTime > 1320) { // 8am to 10pm
    errors.push('Start time must be between 8:00am and 10:00pm');
  }
  
  // Check if duration is valid
  if (event.duration < 15) {
    errors.push('Duration must be at least 15 minutes');
  }
  
  // Check if event doesn't extend past schedule end
  if (event.startTime + event.duration > 1320) {
    errors.push('Event extends past 10:00pm schedule end');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sort events by start time, then by duration
 */
export function sortEventsByTime(events: ScheduledEvent[]): ScheduledEvent[] {
  return [...events].sort((a, b) => {
    if (a.startTime !== b.startTime) {
      return a.startTime - b.startTime;
    }
    return b.duration - a.duration; // Longer events first for same start time
  });
}

/**
 * Convert scheduled event back to basic event
 */
export function scheduledEventToBasicEvent(scheduledEvent: ScheduledEvent): Event {
  return {
    event: {
      id: scheduledEvent.event.id.startsWith('scheduled-') 
        ? `${Date.now()}` 
        : scheduledEvent.event.id,
      name: scheduledEvent.event.name,
      category: scheduledEvent.event.category,
      competitionId: scheduledEvent.event.competitionId,
      competitors: scheduledEvent.event.competitors,
      judges: scheduledEvent.event.judges,
      scoring: scheduledEvent.event.scoring,
      startDate: scheduledEvent.event.startDate,
      endDate: scheduledEvent.event.endDate
    },
    color: scheduledEvent.color
  };
}

/**
 * Create new scheduled event from basic event
 */
export function createScheduledEvent(
  event: Event,
  startTime: number,
  duration: number,
  day: Date,
  venue: Venue
): ScheduledEvent {
  return {
    ...event,
    startTime,
    duration,
    day,
    venue
  };
}

/**
 * Get event end time
 */
export function getEventEndTime(event: ScheduledEvent): number {
  return event.startTime + event.duration;
}

/**
 * Check if event is at given time slot
 */
export function isEventAtTime(event: ScheduledEvent, time: number): boolean {
  return event.startTime <= time && getEventEndTime(event) > time;
}

/**
 * Find events that conflict with a given event
 */
export function findConflictingEvents(
  targetEvent: ScheduledEvent,
  allEvents: ScheduledEvent[]
): ScheduledEvent[] {
  return allEvents.filter(event => 
    event.event.id !== targetEvent.event.id &&
    event.day === targetEvent.day &&
    event.venue === targetEvent.venue &&
    eventsOverlap(event, targetEvent)
  );
}

/**
 * Get event display color with opacity
 */
export function getEventDisplayColor(event: ScheduledEvent, opacity: number = 0.5): string {
  const opacityHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `${event.color}${opacityHex}`;
}