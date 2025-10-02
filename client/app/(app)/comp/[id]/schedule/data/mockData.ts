import { Event, ScheduledEvent, EventCategory } from '../types';
import { EVENT_COLORS } from '../constants';

export const mockEvents: Event[] = [
  { 
    event: { id: '1', name: 'Pre Champ Latin', category: EventCategory.LATIN, division: 'Pre Championship', type: 'Latin' }, 
    color: EVENT_COLORS.Latin 
  },
  { 
    event: { id: '2', name: 'Amateur Latin', category: EventCategory.LATIN, division: 'Amateur', type: 'Latin' }, 
    color: EVENT_COLORS.Latin 
  },
  { 
    event: { id: '3', name: 'Novice Latin', category: EventCategory.LATIN, division: 'Novice', type: 'Latin' }, 
    color: EVENT_COLORS.Latin 
  },
  { 
    event: { id: '4', name: 'Class 485', category: EventCategory.LATIN, division: 'Class', type: 'Latin' }, 
    color: EVENT_COLORS.Latin 
  },
  { 
    event: { id: '5', name: 'Class 385', category: EventCategory.LATIN, division: 'Class', type: 'Latin' }, 
    color: EVENT_COLORS.Latin 
  },
  { 
    event: { id: '6', name: 'Class 383', category: EventCategory.LATIN, division: 'Class', type: 'Latin' }, 
    color: EVENT_COLORS.Latin 
  },
  { 
    event: { id: '7', name: 'Pre Champ Ballroom', category: EventCategory.BALLROOM, division: 'Pre Championship', type: 'Ballroom' }, 
    color: EVENT_COLORS.Ballroom 
  },
  { 
    event: { id: '8', name: 'Amateur Ballroom', category: EventCategory.BALLROOM, division: 'Amateur', type: 'Ballroom' }, 
    color: EVENT_COLORS.Ballroom 
  },
  { 
    event: { id: '9', name: 'Novice Ballroom', category: EventCategory.BALLROOM, division: 'Novice', type: 'Ballroom' }, 
    color: EVENT_COLORS.Ballroom 
  },
  { 
    event: { id: '10', name: 'Class 484', category: EventCategory.BALLROOM, division: 'Class', type: 'Ballroom' }, 
    color: EVENT_COLORS.Ballroom 
  },
  { 
    event: { id: '11', name: 'Class 384', category: EventCategory.BALLROOM, division: 'Class', type: 'Ballroom' }, 
    color: EVENT_COLORS.Ballroom 
  },
  { 
    event: { id: '12', name: 'Class 382', category: EventCategory.BALLROOM, division: 'Class', type: 'Ballroom' }, 
    color: EVENT_COLORS.Ballroom 
  },
  { 
    event: { id: '13', name: 'Formation Teams', category: EventCategory.OTHER, division: 'Formation', type: 'Teams' }, 
    color: EVENT_COLORS.Other 
  },
  { 
    event: { id: '14', name: 'Cabaret', category: EventCategory.OTHER, division: 'Cabaret', type: 'Entertainment' }, 
    color: EVENT_COLORS.Other 
  },
];

export const mockScheduledEvents: ScheduledEvent[] = [
  {
    event: {
      id: 'scheduled-1',
      name: 'Amateur Latin',
      category: EventCategory.LATIN,
      division: 'Amateur',
      type: 'Latin'
    },
    color: EVENT_COLORS.Latin,
    startTime: 660, // 11:00am
    duration: 90, // 1.5 hours
    day: '10/9',
    venue: 'Wilk'
  },
  {
    event: {
      id: 'scheduled-2',
      name: 'Class 484',
      category: EventCategory.BALLROOM,
      division: 'Class',
      type: 'Ballroom'
    },
    color: EVENT_COLORS.Ballroom,
    startTime: 840, // 2:00pm
    duration: 120, // 2 hours
    day: '10/9',
    venue: 'RB'
  }
];