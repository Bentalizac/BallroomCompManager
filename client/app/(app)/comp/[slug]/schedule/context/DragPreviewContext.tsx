'use client';

import React, { createContext, useContext, useState } from 'react';
import type { Venue } from '../types';

interface DragPreviewContextValue {
  targetVenue: { venue: Venue; day: Date } | null;
  setTargetVenue: (target: { venue: Venue; day: Date } | null) => void;
}

const DragPreviewContext = createContext<DragPreviewContextValue | null>(null);

export function DragPreviewProvider({ children }: { children: React.ReactNode }) {
  const [targetVenue, setTargetVenue] = useState<{ venue: Venue; day: Date } | null>(null);

  return (
    <DragPreviewContext.Provider value={{ targetVenue, setTargetVenue }}>
      {children}
    </DragPreviewContext.Provider>
  );
}

export function useDragPreview() {
  const context = useContext(DragPreviewContext);
  if (!context) {
    throw new Error('useDragPreview must be used within DragPreviewProvider');
  }
  return context;
}
