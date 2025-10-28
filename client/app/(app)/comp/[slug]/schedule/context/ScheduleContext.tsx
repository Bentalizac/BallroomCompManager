'use client';

import React, { createContext, useContext } from 'react';
import { useScheduleState as useScheduleStateHook, ScheduleState } from '../hooks/useScheduleState';

const ScheduleContext = createContext<ScheduleState | null>(null);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const scheduleState = useScheduleStateHook();
  
  return (
    <ScheduleContext.Provider value={scheduleState}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useScheduleState(): ScheduleState {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useScheduleState must be used within a ScheduleProvider');
  }
  return context;
}
