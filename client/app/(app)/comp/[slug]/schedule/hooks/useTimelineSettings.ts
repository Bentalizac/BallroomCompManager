import { useState, useCallback } from 'react';
import { 
  LayoutSettings, 
  TimeSettings, 
  getCurrentLayoutSettings, 
  getCurrentTimeSettings,
  updateLayoutSettings,
  updateTimeSettings,
  getTimeSlots
} from '../constants';

// Custom hook to manage timeline settings with reactivity
export function useTimelineSettings() {
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(getCurrentLayoutSettings());
  const [timeSettings, setTimeSettings] = useState<TimeSettings>({
    START_TIME: getCurrentTimeSettings().START_TIME,
    END_TIME: getCurrentTimeSettings().END_TIME,
    TIME_GAP_INTERVAL: getCurrentTimeSettings().TIME_GAP_INTERVAL
  });
  const [timeSlots, setTimeSlots] = useState<number[]>(getTimeSlots());
  const [settingsVersion, setSettingsVersion] = useState(0);

  // Function to update layout settings and trigger re-render
  const updateLayout = useCallback((newSettings: Partial<LayoutSettings>) => {
    const updated = { ...layoutSettings, ...newSettings };
    setLayoutSettings(updated);
    updateLayoutSettings(newSettings);
    setSettingsVersion(prev => prev + 1);
  }, [layoutSettings]);

  // Function to update time settings and trigger re-render
  const updateTime = useCallback((newSettings: Partial<TimeSettings>) => {
    const updated = { ...timeSettings, ...newSettings };
    setTimeSettings(updated);
    updateTimeSettings(newSettings);
    setTimeSlots(getTimeSlots());
    setSettingsVersion(prev => prev + 1);
  }, [timeSettings]);

  // Function to apply both settings at once
  const applySettings = useCallback((
    newLayoutSettings: Partial<LayoutSettings>, 
    newTimeSettings: Partial<TimeSettings>
  ) => {
    const updatedLayout = { ...layoutSettings, ...newLayoutSettings };
    const updatedTime = { ...timeSettings, ...newTimeSettings };
    
    setLayoutSettings(updatedLayout);
    setTimeSettings(updatedTime);
    
    updateLayoutSettings(newLayoutSettings);
    updateTimeSettings(newTimeSettings);
    setTimeSlots(getTimeSlots());
    setSettingsVersion(prev => prev + 1);
  }, [layoutSettings, timeSettings]);

  // Get current complete time configuration
  const getCompleteTimeConfig = useCallback(() => {
    return getCurrentTimeSettings();
  }, [settingsVersion]);

  return {
    layoutSettings,
    timeSettings,
    timeSlots,
    settingsVersion, // Can be used as a dependency to trigger re-renders
    updateLayout,
    updateTime,
    applySettings,
    getCompleteTimeConfig
  };
}