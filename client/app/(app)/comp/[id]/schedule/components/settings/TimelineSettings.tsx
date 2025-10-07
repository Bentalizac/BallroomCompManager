import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  LayoutSettings, 
  TimeSettings, 
  DEFAULT_LAYOUT_SETTINGS, 
  DEFAULT_TIME_SETTINGS,
  updateLayoutSettings,
  updateTimeSettings,
  getCurrentLayoutSettings,
  getCurrentTimeSettings
} from '../../constants';

interface TimelineSettingsProps {
  onSettingsChange?: () => void; // Callback when settings are updated
}

export function TimelineSettings({ onSettingsChange }: TimelineSettingsProps) {
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(getCurrentLayoutSettings());
  const [timeSettings, setTimeSettings] = useState<TimeSettings>({
    START_TIME: getCurrentTimeSettings().START_TIME,
    END_TIME: getCurrentTimeSettings().END_TIME,
    TIME_GAP_INTERVAL: getCurrentTimeSettings().TIME_GAP_INTERVAL
  });

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  const parseTime = (timeString: string): number | null => {
    const match = timeString.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  };

  const handleApplySettings = () => {
    updateLayoutSettings(layoutSettings);
    updateTimeSettings(timeSettings);
    onSettingsChange?.();
  };

  const handleResetToDefaults = () => {
    setLayoutSettings({ ...DEFAULT_LAYOUT_SETTINGS });
    setTimeSettings({ ...DEFAULT_TIME_SETTINGS });
  };

  const derivedValues = {
    totalHours: (timeSettings.END_TIME - timeSettings.START_TIME) / 60,
    linesPerHour: 60 / timeSettings.TIME_GAP_INTERVAL,
    totalLines: Math.ceil((timeSettings.END_TIME - timeSettings.START_TIME) / timeSettings.TIME_GAP_INTERVAL),
    timelineHeight: Math.ceil((timeSettings.END_TIME - timeSettings.START_TIME) / timeSettings.TIME_GAP_INTERVAL) * layoutSettings.GRID_SLOT_HEIGHT
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold">Timeline Settings</h2>
        <p className="text-gray-600">Customize the timeline layout and time range</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Range Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Time Range</CardTitle>
            <CardDescription>Set the visible time range for the schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium mb-1">Start Time</label>
              <Input
                id="startTime"
                value={formatTime(timeSettings.START_TIME)}
                onChange={(e) => {
                  const parsed = parseTime(e.target.value);
                  if (parsed !== null) {
                    setTimeSettings(prev => ({ ...prev, START_TIME: parsed }));
                  }
                }}
                placeholder="8:00 AM"
              />
            </div>
            
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium mb-1">End Time</label>
              <Input
                id="endTime"
                value={formatTime(timeSettings.END_TIME)}
                onChange={(e) => {
                  const parsed = parseTime(e.target.value);
                  if (parsed !== null) {
                    setTimeSettings(prev => ({ ...prev, END_TIME: parsed }));
                  }
                }}
                placeholder="10:00 PM"
              />
            </div>
            
            <div>
              <label htmlFor="lineInterval" className="block text-sm font-medium mb-1">Time Interval (minutes)</label>
              <Input
                id="lineInterval"
                type="number"
                min="5"
                max="60"
                step="5"
                value={timeSettings.TIME_GAP_INTERVAL}
                onChange={(e) => setTimeSettings(prev => ({ ...prev, TIME_GAP_INTERVAL: parseInt(e.target.value) || 15 }))}
              />
              <p className="text-xs text-gray-500 mt-1">How many minutes each grid line represents</p>
            </div>

            <div className="bg-gray-50 p-3 rounded text-sm">
              <p><strong>Total Duration:</strong> {derivedValues.totalHours} hours</p>
              <p><strong>Lines per Hour:</strong> {derivedValues.linesPerHour}</p>
              <p><strong>Total Grid Lines:</strong> {derivedValues.totalLines}</p>
            </div>
          </CardContent>
        </Card>

        {/* Layout Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Layout & Appearance</CardTitle>
            <CardDescription>Customize the visual layout of the timeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="gridHeight" className="block text-sm font-medium mb-1">Grid Line Height (px)</label>
              <Input
                id="gridHeight"
                type="number"
                min="12"
                max="100"
                value={layoutSettings.GRID_SLOT_HEIGHT}
                onChange={(e) => setLayoutSettings(prev => ({ ...prev, GRID_SLOT_HEIGHT: parseInt(e.target.value) || 36 }))}
              />
              <p className="text-xs text-gray-500 mt-1">Height of each time slot in pixels</p>
            </div>
            
            <div>
              <label htmlFor="gapPercentage" className="block text-sm font-medium mb-1">Gap Between Events (%)</label>
              <Input
                id="gapPercentage"
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={layoutSettings.GAP_PERCENTAGE}
                onChange={(e) => setLayoutSettings(prev => ({ ...prev, GAP_PERCENTAGE: parseFloat(e.target.value) || 1 }))}
              />
            </div>
            
            <div>
              <label htmlFor="defaultDuration" className="block text-sm font-medium mb-1">Default Event Duration (min)</label>
              <Input
                id="defaultDuration"
                type="number"
                min="15"
                max="480"
                step="15"
                value={layoutSettings.DEFAULT_EVENT_DURATION}
                onChange={(e) => setLayoutSettings(prev => ({ ...prev, DEFAULT_EVENT_DURATION: parseInt(e.target.value) || 60 }))}
              />
            </div>
            
            <div>
              <label htmlFor="minDuration" className="block text-sm font-medium mb-1">Minimum Event Duration (min)</label>
              <Input
                id="minDuration"
                type="number"
                min="5"
                max="60"
                step="5"
                value={layoutSettings.MIN_EVENT_DURATION}
                onChange={(e) => setLayoutSettings(prev => ({ ...prev, MIN_EVENT_DURATION: parseInt(e.target.value) || 15 }))}
              />
            </div>

            <div className="bg-gray-50 p-3 rounded text-sm">
              <p><strong>Timeline Height:</strong> {derivedValues.timelineHeight}px</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="border-t border-gray-200 my-6"></div>

      <div className="flex gap-4">
        <Button onClick={handleApplySettings} className="bg-blue-600 hover:bg-blue-700">
          Apply Settings
        </Button>
        <Button variant="outline" onClick={handleResetToDefaults}>
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}