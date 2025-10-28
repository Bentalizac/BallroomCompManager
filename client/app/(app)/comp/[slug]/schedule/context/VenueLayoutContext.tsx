'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Venue } from '../types';

interface VenueColumnBounds {
  venue: Venue;
  day: Date;
  left: number;
  right: number;
  width: number;
}

interface VenueLayoutContextValue {
  registerVenueColumn: (venue: Venue, day: Date, bounds: { left: number; right: number; width: number }) => void;
  unregisterVenueColumn: (venue: Venue, day: Date) => void;
  findVenueAtPosition: (x: number, day: Date) => Venue | null;
}

const VenueLayoutContext = createContext<VenueLayoutContextValue | null>(null);

export function VenueLayoutProvider({ children }: { children: React.ReactNode }) {
  const [venueColumns, setVenueColumns] = useState<Map<string, VenueColumnBounds>>(new Map());

  const getKey = (venue: Venue, day: Date) => `${day.toISOString()}-${venue.name}`;

  const registerVenueColumn = useCallback((venue: Venue, day: Date, bounds: { left: number; right: number; width: number }) => {
    setVenueColumns(prev => {
      const next = new Map(prev);
      next.set(getKey(venue, day), {
        venue,
        day,
        left: bounds.left,
        right: bounds.right,
        width: bounds.width,
      });
      return next;
    });
  }, []);

  const unregisterVenueColumn = useCallback((venue: Venue, day: Date) => {
    setVenueColumns(prev => {
      const next = new Map(prev);
      next.delete(getKey(venue, day));
      return next;
    });
  }, []);

  const findVenueAtPosition = useCallback((x: number, day: Date): Venue | null => {
    const dayStr = day.toISOString();
    
    for (const column of Array.from(venueColumns.values())) {
      if (column.day.toISOString() === dayStr && x >= column.left && x <= column.right) {
        return column.venue;
      }
    }

    return null;
  }, [venueColumns]);

  return (
    <VenueLayoutContext.Provider value={{ registerVenueColumn, unregisterVenueColumn, findVenueAtPosition }}>
      {children}
    </VenueLayoutContext.Provider>
  );
}

export function useVenueLayout() {
  const context = useContext(VenueLayoutContext);
  if (!context) {
    throw new Error('useVenueLayout must be used within VenueLayoutProvider');
  }
  return context;
}
