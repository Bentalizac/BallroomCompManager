import { ScheduledEvent } from './Timeline';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

interface SidePanelProps {
  selectedEvent: ScheduledEvent | null;
  onEventUpdate?: (eventId: string, updates: Partial<ScheduledEvent>) => void;
}

export function SidePanel({ selectedEvent, onEventUpdate }: SidePanelProps) {
  const [editedValues, setEditedValues] = useState<{
    startTime: string;
    duration: string;
    endTime: string;
  }>({ startTime: '', duration: '', endTime: '' });

  const [isEditing, setIsEditing] = useState<{
    startTime: boolean;
    duration: boolean;
    endTime: boolean;
  }>({ startTime: false, duration: false, endTime: false });

  // Update edited values when selected event changes
  useEffect(() => {
    if (selectedEvent) {
      const newValues = {
        startTime: formatTime(selectedEvent.startTime),
        duration: formatDuration(selectedEvent.duration),
        endTime: formatTime(selectedEvent.startTime + selectedEvent.duration),
      };
      
      // Only update values that aren't currently being edited
      setEditedValues(prev => ({
        startTime: isEditing.startTime ? prev.startTime : newValues.startTime,
        duration: isEditing.duration ? prev.duration : newValues.duration,
        endTime: isEditing.endTime ? prev.endTime : newValues.endTime,
      }));
    }
  }, [selectedEvent, isEditing]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const ampm = hours < 12 ? 'am' : 'pm';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${mins.toString().padStart(2, '0')}${ampm}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  const parseTime = (timeStr: string): number | null => {
    // Parse time in format "10:30am" or "2:15pm"
    const match = timeStr.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
    if (!match) return null;
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toLowerCase();
    
    if (ampm === 'pm' && hours !== 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  };

  const parseDuration = (durationStr: string): number | null => {
    // Parse duration in format "1h 30min", "90min", "2h"
    const match = durationStr.match(/^(?:(\d+)h\s*)?(?:(\d+)min?)?$/i);
    if (!match) return null;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    
    return hours * 60 + minutes;
  };

  const handleStartTimeBlur = () => {
    setIsEditing(prev => ({ ...prev, startTime: false }));
    
    const newStartTime = parseTime(editedValues.startTime);
    if (newStartTime !== null && selectedEvent && onEventUpdate) {
      onEventUpdate(selectedEvent.event.id, { startTime: newStartTime });
      // Update end time display
      setEditedValues(prev => ({
        ...prev,
        endTime: formatTime(newStartTime + selectedEvent.duration)
      }));
    } else if (selectedEvent) {
      // Reset to original value if invalid
      setEditedValues(prev => ({
        ...prev,
        startTime: formatTime(selectedEvent.startTime)
      }));
    }
  };

  const handleDurationBlur = () => {
    setIsEditing(prev => ({ ...prev, duration: false }));
    
    const newDuration = parseDuration(editedValues.duration);
    if (newDuration !== null && newDuration > 0 && selectedEvent && onEventUpdate) {
      onEventUpdate(selectedEvent.event.id, { duration: newDuration });
      // Update end time display
      setEditedValues(prev => ({
        ...prev,
        endTime: formatTime(selectedEvent.startTime + newDuration)
      }));
    } else if (selectedEvent) {
      // Reset to original value if invalid
      setEditedValues(prev => ({
        ...prev,
        duration: formatDuration(selectedEvent.duration)
      }));
    }
  };

  const handleEndTimeBlur = () => {
    setIsEditing(prev => ({ ...prev, endTime: false }));
    
    const newEndTime = parseTime(editedValues.endTime);
    if (newEndTime !== null && selectedEvent && onEventUpdate) {
      const newDuration = newEndTime - selectedEvent.startTime;
      if (newDuration > 0) {
        onEventUpdate(selectedEvent.event.id, { duration: newDuration });
        // Update duration display
        setEditedValues(prev => ({
          ...prev,
          duration: formatDuration(newDuration)
        }));
      } else {
        // Reset to original value if invalid duration
        setEditedValues(prev => ({
          ...prev,
          endTime: formatTime(selectedEvent.startTime + selectedEvent.duration)
        }));
      }
    } else if (selectedEvent) {
      // Reset to original value if invalid
      setEditedValues(prev => ({
        ...prev,
        endTime: formatTime(selectedEvent.startTime + selectedEvent.duration)
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, field: 'startTime' | 'duration' | 'endTime') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur(); // Trigger blur event
    }
  };

  return (
    <div className="w-80 bg-secondary flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Conflicts Section */}
        <div>
          <h3 className="font-medium mb-3 text-gray-700">Conflicts</h3>
          <div className="space-y-2">
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm text-red-700">
                Over Schedule at 10:15
              </AlertDescription>
            </Alert>
            
            <Alert className="bg-yellow-50 border-yellow-200">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm text-yellow-700">
                Small Gap between 385, 384
              </AlertDescription>
            </Alert>
            
            <Alert className="bg-blue-50 border-blue-200">
              <Users className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-700">
                Suggestion
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Selected Event Section */}
        <div>
          <h3 className="font-medium mb-3 text-gray-700">Selected Event</h3>
          
          {selectedEvent ? (
            <div className="bg-white rounded-lg p-4 space-y-3">
              <div>
                <div className="font-medium text-gray-900">{selectedEvent.event.name}</div>
                <div className="text-sm text-gray-600">{selectedEvent.event.division}</div>
                <div className="text-sm text-gray-600">{selectedEvent.event.type}</div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Day:</span>
                  <span className="font-medium">{selectedEvent.day}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Venue:</span>
                  <span className="font-medium">{selectedEvent.venue}</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-600">Start Time:</span>
                    <Input
                      type="text"
                      value={editedValues.startTime}
                      onChange={(e) => setEditedValues(prev => ({ ...prev, startTime: e.target.value }))}
                      onFocus={() => setIsEditing(prev => ({ ...prev, startTime: true }))}
                      onBlur={handleStartTimeBlur}
                      onKeyPress={(e) => handleKeyPress(e, 'startTime')}
                      className="w-24 h-7 text-xs text-right"
                      placeholder="10:30am"
                    />
                  </div>
                  <div className="text-xs text-gray-400 text-right">Format: 10:30am</div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-600">Duration:</span>
                    <Input
                      type="text"
                      value={editedValues.duration}
                      onChange={(e) => setEditedValues(prev => ({ ...prev, duration: e.target.value }))}
                      onFocus={() => setIsEditing(prev => ({ ...prev, duration: true }))}
                      onBlur={handleDurationBlur}
                      onKeyPress={(e) => handleKeyPress(e, 'duration')}
                      className="w-24 h-7 text-xs text-right"
                      placeholder="1h 30min"
                    />
                  </div>
                  <div className="text-xs text-gray-400 text-right">Format: 1h 30min</div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-600">End Time:</span>
                    <Input
                      type="text"
                      value={editedValues.endTime}
                      onChange={(e) => setEditedValues(prev => ({ ...prev, endTime: e.target.value }))}
                      onFocus={() => setIsEditing(prev => ({ ...prev, endTime: true }))}
                      onBlur={handleEndTimeBlur}
                      onKeyPress={(e) => handleKeyPress(e, 'endTime')}
                      className="w-24 h-7 text-xs text-right"
                      placeholder="12:00pm"
                    />
                  </div>
                  <div className="text-xs text-gray-400 text-right">Format: 12:00pm</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/50 rounded-lg p-4 text-center text-gray-500 text-sm">
              Click on an event in the timeline to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}