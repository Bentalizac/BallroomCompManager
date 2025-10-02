import { mapCompetitionRowToDTO, mapEventRowToDTO, mapVenueRowToDTO } from './mappers';
import type { CompRow, EventRow, VenueRow } from './mappers';

describe('Mappers', () => {
  describe('mapVenueRowToDTO', () => {
    it('should map venue row to DTO', () => {
      const venueRow: VenueRow = {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Emerald Ballroom',
        city: 'San Francisco',
        state: 'CA',
      };

      const result = mapVenueRowToDTO(venueRow);

      expect(result).toEqual({
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Emerald Ballroom',
        city: 'San Francisco',
        state: 'CA',
      });
    });

    it('should handle null city and state', () => {
      const venueRow: VenueRow = {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Test Venue',
        city: null,
        state: null,
      };

      const result = mapVenueRowToDTO(venueRow);

      expect(result).toEqual({
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Test Venue',
        city: null,
        state: null,
      });
    });
  });

  describe('mapEventRowToDTO', () => {
    it('should map event row to DTO with valid status', () => {
      const eventRow: EventRow = {
        id: '80000000-8000-8000-8000-800000000001',
        name: 'Amateur Standard',
        start_date: '2024-11-15',
        end_date: '2024-11-15',
        event_status: 'scheduled',
      };

      const result = mapEventRowToDTO(eventRow);

      expect(result).toEqual({
        id: '80000000-8000-8000-8000-800000000001',
        name: 'Amateur Standard',
        startDate: '2024-11-15',
        endDate: '2024-11-15',
        status: 'scheduled',
      });
    });

    it('should throw error for unknown status', () => {
      const eventRow: EventRow = {
        id: '80000000-8000-8000-8000-800000000001',
        name: 'Amateur Standard',
        start_date: '2024-11-15',
        end_date: '2024-11-15',
        event_status: 'unknown_status' as any,
      };

      expect(() => mapEventRowToDTO(eventRow)).toThrow('Unknown event status: unknown_status');
    });
  });

  describe('mapCompetitionRowToDTO', () => {
    it('should map competition row to DTO with venue and events', () => {
      const compRow: CompRow = {
        id: '10000000-1000-1000-1000-100000000001',
        name: 'Bay Area Open Championship 2024',
        start_date: '2024-11-15',
        end_date: '2024-11-17',
        venue_id: '00000000-0000-0000-0000-000000000001',
        created_at: '2024-01-01T00:00:00Z',
        venue: {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Emerald Ballroom',
          city: 'San Francisco',
          state: 'CA',
        },
        events: [
          {
            id: '80000000-8000-8000-8000-800000000001',
            name: 'Amateur Standard',
            start_date: '2024-11-15',
            end_date: '2024-11-15',
            event_status: 'scheduled',
          },
          {
            id: '80000000-8000-8000-8000-800000000002',
            name: 'Amateur Latin',
            start_date: '2024-11-16',
            end_date: '2024-11-16',
            event_status: 'current',
          },
        ],
      };

      const result = mapCompetitionRowToDTO(compRow);

      expect(result).toEqual({
        id: '10000000-1000-1000-1000-100000000001',
        name: 'Bay Area Open Championship 2024',
        startDate: '2024-11-15',
        endDate: '2024-11-17',
        venue: {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Emerald Ballroom',
          city: 'San Francisco',
          state: 'CA',
        },
        events: [
          {
            id: '80000000-8000-8000-8000-800000000001',
            name: 'Amateur Standard',
            startDate: '2024-11-15',
            endDate: '2024-11-15',
            status: 'scheduled',
          },
          {
            id: '80000000-8000-8000-8000-800000000002',
            name: 'Amateur Latin',
            startDate: '2024-11-16',
            endDate: '2024-11-16',
            status: 'current',
          },
        ],
      });
    });

    it('should handle null venue and empty events', () => {
      const compRow: CompRow = {
        id: '10000000-1000-1000-1000-100000000001',
        name: 'Test Competition',
        start_date: '2024-11-15',
        end_date: '2024-11-17',
        venue_id: null,
        created_at: '2024-01-01T00:00:00Z',
        venue: null,
        events: null,
      };

      const result = mapCompetitionRowToDTO(compRow);

      expect(result).toEqual({
        id: '10000000-1000-1000-1000-100000000001',
        name: 'Test Competition',
        startDate: '2024-11-15',
        endDate: '2024-11-17',
        venue: null,
        events: [],
      });
    });
  });
});