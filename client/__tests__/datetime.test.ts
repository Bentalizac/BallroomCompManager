/**
 * Unit tests for datetime utilities
 * Tests conversion functions including DST transition cases
 */

import {
  localInputToUtcIso,
  utcIsoToLocalInput,
  formatEventInZone,
  getCurrentTimeInZone,
  isValidTimeZone,
  getCommonTimeZones,
} from '../lib/datetime';

describe('DateTime Utilities', () => {
  describe('localInputToUtcIso', () => {
    it('should convert local datetime-local input to UTC ISO string', () => {
      // Test with Eastern Time (EST/EDT)
      const result = localInputToUtcIso('2024-01-15T14:30', 'America/New_York');
      expect(result).toBe('2024-01-15T19:30:00.000Z'); // EST is UTC-5
    });

    it('should handle DST transition - Spring Forward', () => {
      // DST begins March 10, 2024 in Eastern Time
      const result = localInputToUtcIso('2024-03-10T14:30', 'America/New_York');
      expect(result).toBe('2024-03-10T18:30:00.000Z'); // EDT is UTC-4
    });

    it('should handle DST transition - Fall Back', () => {
      // DST ends November 3, 2024 in Eastern Time
      const result = localInputToUtcIso('2024-11-03T14:30', 'America/New_York');
      expect(result).toBe('2024-11-03T19:30:00.000Z'); // EST is UTC-5
    });

    it('should handle UTC timezone', () => {
      const result = localInputToUtcIso('2024-06-15T14:30', 'UTC');
      expect(result).toBe('2024-06-15T14:30:00.000Z');
    });

    it('should handle Pacific Time during DST', () => {
      const result = localInputToUtcIso('2024-07-15T14:30', 'America/Los_Angeles');
      expect(result).toBe('2024-07-15T21:30:00.000Z'); // PDT is UTC-7
    });

    it('should throw error for invalid input', () => {
      expect(() => localInputToUtcIso('', 'America/New_York')).toThrow(
        'Both localInput and timeZone are required'
      );
      expect(() => localInputToUtcIso('2024-01-15T14:30', '')).toThrow(
        'Both localInput and timeZone are required'
      );
      expect(() => localInputToUtcIso('invalid-date', 'America/New_York')).toThrow(
        'Failed to convert local time to UTC'
      );
    });
  });

  describe('utcIsoToLocalInput', () => {
    it('should convert UTC ISO string to local datetime-local input format', () => {
      const result = utcIsoToLocalInput('2024-01-15T19:30:00.000Z', 'America/New_York');
      expect(result).toBe('2024-01-15T14:30'); // EST is UTC-5
    });

    it('should handle DST transition - Spring Forward', () => {
      const result = utcIsoToLocalInput('2024-03-10T18:30:00.000Z', 'America/New_York');
      expect(result).toBe('2024-03-10T14:30'); // EDT is UTC-4
    });

    it('should handle DST transition - Fall Back', () => {
      const result = utcIsoToLocalInput('2024-11-03T19:30:00.000Z', 'America/New_York');
      expect(result).toBe('2024-11-03T14:30'); // EST is UTC-5
    });

    it('should handle UTC timezone', () => {
      const result = utcIsoToLocalInput('2024-06-15T14:30:00.000Z', 'UTC');
      expect(result).toBe('2024-06-15T14:30');
    });

    it('should throw error for invalid input', () => {
      expect(() => utcIsoToLocalInput('', 'America/New_York')).toThrow(
        'Both utcIso and timeZone are required'
      );
      expect(() => utcIsoToLocalInput('2024-01-15T19:30:00.000Z', '')).toThrow(
        'Both utcIso and timeZone are required'
      );
      expect(() => utcIsoToLocalInput('invalid-date', 'America/New_York')).toThrow(
        'Failed to convert UTC to local time'
      );
    });
  });

  describe('formatEventInZone', () => {
    it('should format event time in specified timezone with default pattern', () => {
      const result = formatEventInZone('2024-01-15T19:30:00.000Z', 'America/New_York');
      expect(result).toMatch(/Jan 15, 2024 at 2:30 PM EST/);
    });

    it('should format event time during DST', () => {
      const result = formatEventInZone('2024-07-15T21:30:00.000Z', 'America/Los_Angeles');
      expect(result).toMatch(/Jul 15, 2024 at 2:30 PM PDT/);
    });

    it('should use custom format pattern', () => {
      const result = formatEventInZone(
        '2024-01-15T19:30:00.000Z',
        'America/New_York',
        'yyyy-MM-dd HH:mm'
      );
      expect(result).toMatch(/2024-01-15 14:30 EST/);
    });

    it('should throw error for invalid input', () => {
      expect(() => formatEventInZone('', 'America/New_York')).toThrow(
        'Both utcIso and timeZone are required'
      );
      expect(() => formatEventInZone('2024-01-15T19:30:00.000Z', '')).toThrow(
        'Both utcIso and timeZone are required'
      );
      expect(() => formatEventInZone('invalid-date', 'America/New_York')).toThrow(
        'Failed to format event time'
      );
    });
  });

  describe('getCurrentTimeInZone', () => {
    it('should return current time in datetime-local format for specified timezone', () => {
      const result = getCurrentTimeInZone('America/New_York');
      // Should match YYYY-MM-DDTHH:mm format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    it('should return current time in UTC', () => {
      const result = getCurrentTimeInZone('UTC');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    it('should throw error for invalid timezone', () => {
      expect(() => getCurrentTimeInZone('')).toThrow('timeZone is required');
    });
  });

  describe('isValidTimeZone', () => {
    it('should return true for valid IANA timezone identifiers', () => {
      expect(isValidTimeZone('America/New_York')).toBe(true);
      expect(isValidTimeZone('Europe/London')).toBe(true);
      expect(isValidTimeZone('Asia/Tokyo')).toBe(true);
      expect(isValidTimeZone('UTC')).toBe(true);
    });

    it('should return false for invalid timezone identifiers', () => {
      expect(isValidTimeZone('')).toBe(false);
      expect(isValidTimeZone('Invalid/Timezone')).toBe(false);
      expect(isValidTimeZone('EST')).toBe(false); // Abbreviation, not IANA
      expect(isValidTimeZone('GMT-5')).toBe(false); // Offset, not IANA
    });
  });

  describe('getCommonTimeZones', () => {
    it('should return array of common timezone options', () => {
      const result = getCommonTimeZones();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check structure of returned objects
      result.forEach(tz => {
        expect(tz).toHaveProperty('value');
        expect(tz).toHaveProperty('label');
        expect(typeof tz.value).toBe('string');
        expect(typeof tz.label).toBe('string');
      });
      
      // Check that UTC is included
      expect(result.some(tz => tz.value === 'UTC')).toBe(true);
      
      // Check that common US timezones are included
      expect(result.some(tz => tz.value === 'America/New_York')).toBe(true);
      expect(result.some(tz => tz.value === 'America/Los_Angeles')).toBe(true);
    });
  });

  describe('Round-trip conversion tests', () => {
    const testCases = [
      { local: '2024-01-15T14:30', tz: 'America/New_York' },
      { local: '2024-07-15T14:30', tz: 'America/Los_Angeles' },
      { local: '2024-03-10T14:30', tz: 'America/New_York' }, // DST transition
      { local: '2024-11-03T14:30', tz: 'America/New_York' }, // DST transition
      { local: '2024-06-15T14:30', tz: 'UTC' },
      { local: '2024-12-25T09:00', tz: 'Europe/London' },
    ];

    testCases.forEach(({ local, tz }) => {
      it(`should round-trip convert ${local} in ${tz}`, () => {
        // Convert local to UTC
        const utc = localInputToUtcIso(local, tz);
        expect(utc).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        
        // Convert back to local
        const roundTrip = utcIsoToLocalInput(utc, tz);
        expect(roundTrip).toBe(local);
      });
    });
  });

  describe('DST Transition Edge Cases', () => {
    it('should handle Spring Forward gap (2:00 AM - 3:00 AM does not exist)', () => {
      // DST begins March 10, 2024 at 2:00 AM in Eastern Time
      // 2:00 AM jumps to 3:00 AM, so 2:30 AM doesn't exist
      // date-fns-tz should handle this gracefully
      expect(() => {
        localInputToUtcIso('2024-03-10T02:30', 'America/New_York');
      }).not.toThrow();
    });

    it('should handle Fall Back overlap (1:00 AM - 2:00 AM happens twice)', () => {
      // DST ends November 3, 2024 at 2:00 AM in Eastern Time
      // 2:00 AM falls back to 1:00 AM, so 1:30 AM happens twice
      // date-fns-tz should handle this gracefully (typically uses the first occurrence)
      expect(() => {
        localInputToUtcIso('2024-11-03T01:30', 'America/New_York');
      }).not.toThrow();
    });

    it('should handle timezone with no DST (Arizona)', () => {
      const winter = localInputToUtcIso('2024-01-15T14:30', 'America/Phoenix');
      const summer = localInputToUtcIso('2024-07-15T14:30', 'America/Phoenix');
      
      // Arizona doesn't observe DST, so offset should be consistent (MST = UTC-7)
      expect(winter).toBe('2024-01-15T21:30:00.000Z');
      expect(summer).toBe('2024-07-15T21:30:00.000Z');
    });
  });
});