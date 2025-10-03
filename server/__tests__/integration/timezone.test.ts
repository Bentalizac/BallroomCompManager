/**
 * Integration tests for timezone and timestamp functionality
 * Tests tRPC endpoints to ensure correct API response format
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { CompetitionApi, EventApi } from '@ballroomcompmanager/shared';
import { mapCompetitionRowToDTO, mapEventRowToDTO } from '../../src/trpc/mappers';

describe('Timezone Integration Tests', () => {
  describe('API Schema Validation', () => {
    it('should validate CompetitionApi with timeZone field', () => {
      const mockCompetition = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Competition',
        startDate: '2024-03-15',
        endDate: '2024-03-16',
        timeZone: 'America/New_York',
        venue: null,
        events: [],
      };

      const result = CompetitionApi.safeParse(mockCompetition);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.timeZone).toBe('America/New_York');
      }
    });

    it('should validate EventApi with precise timestamps and timeZone', () => {
      const mockEvent = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Test Event',
        startAt: '2024-03-15T19:30:00.000Z', // UTC timestamp
        endAt: '2024-03-15T21:30:00.000Z',   // UTC timestamp
        competitionId: '123e4567-e89b-12d3-a456-426614174000',
        categoryRulesetId: '123e4567-e89b-12d3-a456-426614174002',
        eventStatus: 'scheduled' as const,
        timeZone: 'America/New_York',
      };

      const result = EventApi.safeParse(mockEvent);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.startAt).toBe('2024-03-15T19:30:00.000Z');
        expect(result.data.endAt).toBe('2024-03-15T21:30:00.000Z');
        expect(result.data.timeZone).toBe('America/New_York');
        expect(result.data.eventStatus).toBe('scheduled');
      }
    });

    it('should reject CompetitionApi without timeZone', () => {
      const mockCompetition = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Competition',
        startDate: '2024-03-15',
        endDate: '2024-03-16',
        // timeZone is missing
        venue: null,
        events: [],
      };

      const result = CompetitionApi.safeParse(mockCompetition);
      expect(result.success).toBe(false);
    });

    it('should reject EventApi with invalid timestamp format', () => {
      const mockEvent = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Test Event',
        startAt: '2024-03-15T14:30', // Not UTC ISO format
        endAt: '2024-03-15T16:30',   // Not UTC ISO format
        competitionId: '123e4567-e89b-12d3-a456-426614174000',
        categoryRulesetId: '123e4567-e89b-12d3-a456-426614174002',
        eventStatus: 'scheduled' as const,
        timeZone: 'America/New_York',
      };

      const result = EventApi.safeParse(mockEvent);
      expect(result.success).toBe(false);
    });
  });

  describe('Mapper Functions', () => {
    it('should map competition row with timezone to DTO', () => {
      const mockCompRow = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Competition',
        start_date: '2024-03-15',
        end_date: '2024-03-16',
        time_zone: 'America/New_York',
        venue: {
          id: '123e4567-e89b-12d3-a456-426614174003',
          name: 'Test Venue',
          city: 'New York',
          state: 'NY',
        },
        events: [
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Test Event',
            start_at: '2024-03-15T19:30:00.000Z',
            end_at: '2024-03-15T21:30:00.000Z',
            event_status: 'scheduled' as const,
            comp_id: '123e4567-e89b-12d3-a456-426614174000',
            category_ruleset_id: '123e4567-e89b-12d3-a456-426614174002',
          },
        ],
      };

      const result = mapCompetitionRowToDTO(mockCompRow);
      
      expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.name).toBe('Test Competition');
      expect(result.startDate).toBe('2024-03-15');
      expect(result.endDate).toBe('2024-03-16');
      expect(result.timeZone).toBe('America/New_York');
      expect(result.venue).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174003',
        name: 'Test Venue',
        city: 'New York',
        state: 'NY',
      });
      expect(result.events).toHaveLength(1);
      expect(result.events[0].timeZone).toBe('America/New_York');
    });

    it('should map event row with timestamps to DTO', () => {
      const mockEventRow = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Test Event',
        start_at: '2024-03-15T19:30:00.000Z',
        end_at: '2024-03-15T21:30:00.000Z',
        event_status: 'scheduled' as const,
        comp_id: '123e4567-e89b-12d3-a456-426614174000',
        category_ruleset_id: '123e4567-e89b-12d3-a456-426614174002',
      };

      const competitionTimeZone = 'America/New_York';
      const result = mapEventRowToDTO(mockEventRow, competitionTimeZone);

      expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(result.name).toBe('Test Event');
      expect(result.startAt).toBe('2024-03-15T19:30:00.000Z');
      expect(result.endAt).toBe('2024-03-15T21:30:00.000Z');
      expect(result.competitionId).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.categoryRulesetId).toBe('123e4567-e89b-12d3-a456-426614174002');
      expect(result.eventStatus).toBe('scheduled');
      expect(result.timeZone).toBe('America/New_York');
    });

    it('should handle unknown event status with error', () => {
      const mockEventRow = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Test Event',
        start_at: '2024-03-15T19:30:00.000Z',
        end_at: '2024-03-15T21:30:00.000Z',
        event_status: 'unknown_status' as any, // Invalid status
        comp_id: '123e4567-e89b-12d3-a456-426614174000',
        category_ruleset_id: '123e4567-e89b-12d3-a456-426614174002',
      };

      const competitionTimeZone = 'America/New_York';
      
      expect(() => {
        mapEventRowToDTO(mockEventRow, competitionTimeZone);
      }).toThrow('Unknown event status: unknown_status');
    });
  });

  describe('API Response Format', () => {
    it('should return camelCase fields without snake_case duplicates', () => {
      const mockCompRow = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Competition',
        start_date: '2024-03-15',
        end_date: '2024-03-16',
        time_zone: 'America/New_York',
        venue: null,
        events: [
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Test Event',
            start_at: '2024-03-15T19:30:00.000Z',
            end_at: '2024-03-15T21:30:00.000Z',
            event_status: 'scheduled' as const,
            comp_id: '123e4567-e89b-12d3-a456-426614174000',
            category_ruleset_id: '123e4567-e89b-12d3-a456-426614174002',
          },
        ],
      };

      const result = mapCompetitionRowToDTO(mockCompRow);
      const parsedResult = CompetitionApi.parse(result);

      // Check that all fields use camelCase
      expect(parsedResult.startDate).toBeDefined();
      expect(parsedResult.endDate).toBeDefined();
      expect(parsedResult.timeZone).toBeDefined();

      // Check that snake_case fields are not present
      expect((parsedResult as any).start_date).toBeUndefined();
      expect((parsedResult as any).end_date).toBeUndefined();
      expect((parsedResult as any).time_zone).toBeUndefined();

      // Check events use camelCase
      expect(parsedResult.events[0].startAt).toBeDefined();
      expect(parsedResult.events[0].endAt).toBeDefined();
      expect(parsedResult.events[0].eventStatus).toBeDefined();
      expect(parsedResult.events[0].competitionId).toBeDefined();
      expect(parsedResult.events[0].categoryRulesetId).toBeDefined();

      // Check that snake_case fields are not present in events
      expect((parsedResult.events[0] as any).start_at).toBeUndefined();
      expect((parsedResult.events[0] as any).end_at).toBeUndefined();
      expect((parsedResult.events[0] as any).event_status).toBeUndefined();
      expect((parsedResult.events[0] as any).comp_id).toBeUndefined();
      expect((parsedResult.events[0] as any).category_ruleset_id).toBeUndefined();
    });
  });

  describe('Timezone Handling', () => {
    it('should pass competition timezone to all nested events', () => {
      const mockCompRow = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Competition',
        start_date: '2024-03-15',
        end_date: '2024-03-16',
        time_zone: 'Europe/London',
        venue: null,
        events: [
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Event 1',
            start_at: '2024-03-15T10:30:00.000Z',
            end_at: '2024-03-15T12:30:00.000Z',
            event_status: 'scheduled' as const,
            comp_id: '123e4567-e89b-12d3-a456-426614174000',
            category_ruleset_id: '123e4567-e89b-12d3-a456-426614174002',
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174003',
            name: 'Event 2',
            start_at: '2024-03-15T14:30:00.000Z',
            end_at: '2024-03-15T16:30:00.000Z',
            event_status: 'current' as const,
            comp_id: '123e4567-e89b-12d3-a456-426614174000',
            category_ruleset_id: '123e4567-e89b-12d3-a456-426614174004',
          },
        ],
      };

      const result = mapCompetitionRowToDTO(mockCompRow);
      
      expect(result.timeZone).toBe('Europe/London');
      expect(result.events).toHaveLength(2);
      expect(result.events[0].timeZone).toBe('Europe/London');
      expect(result.events[1].timeZone).toBe('Europe/London');
    });

    it('should preserve UTC timestamps from database', () => {
      const utcTimestamp1 = '2024-03-15T19:30:00.123Z';
      const utcTimestamp2 = '2024-03-15T21:45:59.456Z';

      const mockEventRow = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Test Event',
        start_at: utcTimestamp1,
        end_at: utcTimestamp2,
        event_status: 'scheduled' as const,
        comp_id: '123e4567-e89b-12d3-a456-426614174000',
        category_ruleset_id: '123e4567-e89b-12d3-a456-426614174002',
      };

      const result = mapEventRowToDTO(mockEventRow, 'America/Los_Angeles');

      expect(result.startAt).toBe(utcTimestamp1);
      expect(result.endAt).toBe(utcTimestamp2);
    });
  });

  describe('Event Status Validation', () => {
    const validStatuses: Array<'scheduled' | 'current' | 'completed' | 'cancelled'> = [
      'scheduled',
      'current', 
      'completed',
      'cancelled'
    ];

    validStatuses.forEach(status => {
      it(`should handle valid event status: ${status}`, () => {
        const mockEventRow = {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Test Event',
          start_at: '2024-03-15T19:30:00.000Z',
          end_at: '2024-03-15T21:30:00.000Z',
          event_status: status,
          comp_id: '123e4567-e89b-12d3-a456-426614174000',
          category_ruleset_id: '123e4567-e89b-12d3-a456-426614174002',
        };

        const result = mapEventRowToDTO(mockEventRow, 'UTC');
        expect(result.eventStatus).toBe(status);
        
        // Validate with zod schema
        const validation = EventApi.safeParse(result);
        expect(validation.success).toBe(true);
      });
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity between competition and events', () => {
      const competitionId = '123e4567-e89b-12d3-a456-426614174000';
      
      const mockCompRow = {
        id: competitionId,
        name: 'Test Competition',
        start_date: '2024-03-15',
        end_date: '2024-03-16',
        time_zone: 'America/Chicago',
        venue: null,
        events: [
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Event 1',
            start_at: '2024-03-15T19:30:00.000Z',
            end_at: '2024-03-15T21:30:00.000Z',
            event_status: 'scheduled' as const,
            comp_id: competitionId, // Should match competition ID
            category_ruleset_id: '123e4567-e89b-12d3-a456-426614174002',
          },
        ],
      };

      const result = mapCompetitionRowToDTO(mockCompRow);
      
      expect(result.id).toBe(competitionId);
      expect(result.events[0].competitionId).toBe(competitionId);
    });
  });
});