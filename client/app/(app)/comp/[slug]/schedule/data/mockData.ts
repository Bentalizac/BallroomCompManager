import { Event, ScheduledEvent } from '../types';
import { EventType } from '@/../shared/data/enums/eventTypes';
import { ScoringMethods } from '@/../shared/data/enums/scoringMethods';

const color = '#4f165d'; // Default color for mock events


export const mockEvents: Event[] = [
  { 
    event: { 
      id: '1',
      competitionId: '12',
      category: EventType.Latin,
      name: 'Pre Champ Latin',
      competitors: [],
      judges: [],
      scoring: ScoringMethods.Ballroom,
      startDate: null,
      endDate: null,
    }, 
    color: color
  },
  { 
    event: { 
      id: '2',
      competitionId: '12',
      name: 'Amateur Latin',
      category: EventType.Latin,
      competitors: [],
      judges: [],
      scoring: ScoringMethods.Ballroom,
      startDate: null,
      endDate: null,
    },
    color: color
  },
  { 
    event: {
      id: '3',
      competitionId: '12',
      name: 'Novice Latin',
      category: EventType.Latin,
      competitors: [],
      judges: [],
      scoring: ScoringMethods.Ballroom,
      startDate: null,
      endDate: null,
    },
    color: color
  },
  { 
    event: {
      id: '4',
      competitionId: '12',
      name: 'Class 485',
      category: EventType.Latin,
      competitors: [],
      judges: [],
      scoring: ScoringMethods.Ballroom,
      startDate: null,
      endDate: null,
    },
    color: color
  },
  { 
    event: {
      id: '5',
      competitionId: '12',
      name: 'Class 385',
      category: EventType.Latin,
      competitors: [],
      judges: [],
      scoring: ScoringMethods.Ballroom,
      startDate: null,
      endDate: null,
    },
    color: color
  },
  { 
    event: {
      id: '6',
      competitionId: '12',
      name: 'Class 383',
      category: EventType.Latin,
      competitors: [],
      judges: [],
      scoring: ScoringMethods.Ballroom,
      startDate: null,
      endDate: null,
    },
    color: color
  },
  { 
    event: {
      id: '7',
      competitionId: '12',
      name: 'Pre Champ Ballroom',
      category: EventType.Ballroom,
      competitors: [],
      judges: [],
      scoring: ScoringMethods.Ballroom,
      startDate: null,
      endDate: null,
    },
    color: color
  },
  { 
    event: {
      id: '8',
      competitionId: '12',
      name: 'Amateur Ballroom',
      category: EventType.Ballroom,
      competitors: [],
      judges: [],
      scoring: ScoringMethods.Ballroom,
      startDate: null,
      endDate: null,
    },
    color: color
  },
  { 
    event: {
      id: '9',
      competitionId: '12',
      name: 'Novice Ballroom',
      category: EventType.Ballroom,
      competitors: [],
      judges: [],
      scoring: ScoringMethods.Ballroom,
      startDate: null,
      endDate: null,
    },
    color: color
  },
  { 
    event: {
      id: '10',
      competitionId: '12',
      name: 'Class 484',
      category: EventType.Ballroom,
      competitors: [],
      judges: [],
      scoring: ScoringMethods.Ballroom,
      startDate: null,
      endDate: null,
    },
    color: color
  },
  { 
    event: {
      id: '11',
      competitionId: '12',
      name: 'Class 384',
      category: EventType.Ballroom,
      competitors: [],
      judges: [],
      scoring: ScoringMethods.Ballroom,
      startDate: null,
      endDate: null,
    },
    color: color
  },
  { 
    event: {
      id: '12',
      competitionId: '12',
      name: 'Class 382',
      category: EventType.Ballroom,
      competitors: [],
      judges: [],
      scoring: ScoringMethods.Ballroom,
      startDate: null,
      endDate: null,
    },
    color: color
  },
  { 
    event: {
      id: '13',
      competitionId: '12',
      name: 'Formation Teams',
      category: EventType.Other,
      competitors: [],
      judges: [],
      scoring: ScoringMethods.Ballroom,
      startDate: null,
      endDate: null,
    },
    color: color
  },
  {
    event: {
      id: '14',
      competitionId: '12',
      name: 'Cabaret',
      category: EventType.Other,
      competitors: [],
      judges: [],
      scoring: ScoringMethods.Ballroom,
      startDate: null,
      endDate: null,
    },
    color: color
  },
];