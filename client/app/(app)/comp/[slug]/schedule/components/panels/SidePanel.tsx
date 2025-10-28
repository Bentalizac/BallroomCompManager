import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock, Users, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useScheduleState } from '../../hooks';
import { STATE_TYPES } from '../../components/dnd/drag/draggableItem';

export function SidePanel() {
  const schedule = useScheduleState();
  
  console.log('SidePanel render - selectedItemID:', schedule.selectedItemID);
  console.log('SidePanel - events:', schedule.events.map(e => e.id));
  console.log('SidePanel - blocks:', schedule.blocks.map(b => b.id));
  
  // Find the selected item (event or block)
  const selectedEvent = schedule.events.find(e => e.id === schedule.selectedItemID);
  const selectedBlock = schedule.blocks.find(b => b.id === schedule.selectedItemID);
  const selectedItem = selectedEvent || selectedBlock;
  const isEvent = !!selectedEvent;

  console.log('SidePanel - selectedEvent:', selectedEvent);
  console.log('SidePanel - selectedBlock:', selectedBlock);
  console.log('SidePanel - selectedItem:', selectedItem);

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

  // Helper functions for time formatting
  const formatTime = (date: Date | null): string => {
    if (!date) return '--:--';
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours < 12 ? 'am' : 'pm';
    return `${displayHours}:${minutes.toString().padStart(2, '0')}${ampm}`;
  };

  const formatDuration = (startDate: Date | null, endDate: Date | null): string => {
    if (!startDate || !endDate) return '--';
    const durationMs = endDate.getTime() - startDate.getTime();
    const minutes = Math.round(durationMs / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  const parseTime = (timeStr: string): Date | null => {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
    if (!match || !selectedItem?.startDate) return null;
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toLowerCase();
    
    if (ampm === 'pm' && hours !== 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    
    const newDate = new Date(selectedItem.startDate);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  };

  const parseDuration = (durationStr: string): number | null => {
    const match = durationStr.match(/^(?:(\d+)h\s*)?(?:(\d+)min?)?$/i);
    if (!match) return null;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    
    return hours * 60 + minutes;
  };

  // Update edited values when selected item changes
  useEffect(() => {
    if (selectedItem && selectedItem.startDate && selectedItem.endDate) {
      const newValues = {
        startTime: formatTime(selectedItem.startDate),
        duration: formatDuration(selectedItem.startDate, selectedItem.endDate),
        endTime: formatTime(selectedItem.endDate),
      };
      
      // Only update values that aren't currently being edited
      setEditedValues(prev => ({
        startTime: isEditing.startTime ? prev.startTime : newValues.startTime,
        duration: isEditing.duration ? prev.duration : newValues.duration,
        endTime: isEditing.endTime ? prev.endTime : newValues.endTime,
      }));
    }
  }, [selectedItem, isEditing]);

  const handleStartTimeBlur = () => {
    setIsEditing(prev => ({ ...prev, startTime: false }));
    
    const newStartDate = parseTime(editedValues.startTime);
    if (newStartDate && selectedItem && selectedItem.endDate) {
      const duration = selectedItem.endDate.getTime() - selectedItem.startDate!.getTime();
      const newEndDate = new Date(newStartDate.getTime() + duration);
      
      if (isEvent) {
        schedule.handleEventUpdate(selectedItem.id, { startDate: newStartDate, endDate: newEndDate });
      } else {
        schedule.handleBlockUpdate(selectedItem.id, { startDate: newStartDate, endDate: newEndDate });
      }
      
      setEditedValues(prev => ({
        ...prev,
        endTime: formatTime(newEndDate)
      }));
    } else if (selectedItem?.startDate) {
      // Reset to original value if invalid
      setEditedValues(prev => ({
        ...prev,
        startTime: formatTime(selectedItem.startDate)
      }));
    }
  };

  const handleDurationBlur = () => {
    setIsEditing(prev => ({ ...prev, duration: false }));
    
    const newDurationMinutes = parseDuration(editedValues.duration);
    if (newDurationMinutes && newDurationMinutes > 0 && selectedItem?.startDate) {
      const newEndDate = new Date(selectedItem.startDate.getTime() + newDurationMinutes * 60000);
      
      if (isEvent) {
        schedule.handleEventUpdate(selectedItem.id, { endDate: newEndDate });
      } else {
        schedule.handleBlockUpdate(selectedItem.id, { endDate: newEndDate });
      }
      
      setEditedValues(prev => ({
        ...prev,
        endTime: formatTime(newEndDate)
      }));
    } else if (selectedItem?.startDate && selectedItem?.endDate) {
      // Reset to original value if invalid
      setEditedValues(prev => ({
        ...prev,
        duration: formatDuration(selectedItem.startDate, selectedItem.endDate)
      }));
    }
  };

  const handleEndTimeBlur = () => {
    setIsEditing(prev => ({ ...prev, endTime: false }));
    
    const newEndDate = parseTime(editedValues.endTime);
    if (newEndDate && selectedItem?.startDate) {
      if (newEndDate.getTime() > selectedItem.startDate.getTime()) {
        if (isEvent) {
          schedule.handleEventUpdate(selectedItem.id, { endDate: newEndDate });
        } else {
          schedule.handleBlockUpdate(selectedItem.id, { endDate: newEndDate });
        }
        
        setEditedValues(prev => ({
          ...prev,
          duration: formatDuration(selectedItem.startDate, newEndDate)
        }));
      } else {
        // Reset to original value if invalid duration
        setEditedValues(prev => ({
          ...prev,
          endTime: formatTime(selectedItem.endDate)
        }));
      }
    } else if (selectedItem?.endDate) {
      // Reset to original value if invalid
      setEditedValues(prev => ({
        ...prev,
        endTime: formatTime(selectedItem.endDate)
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, field: 'startTime' | 'duration' | 'endTime') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur(); // Trigger blur event
    }
  };

  const handleClose = () => {
    schedule.setSelectedItemID(null);
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    
    // Move item back to event panel by resetting its state
    if (isEvent) {
      schedule.handleEventUpdate(selectedItem.id, {
        state: STATE_TYPES.AVAILABLE,
        startDate: null,
        endDate: null,
        venue: null
      });
    } else {
      schedule.handleBlockDelete(selectedItem.id)
    }
    
    schedule.setSelectedItemID(null);
  };

  if (!selectedItem) {
    return null;
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
        <h2 className="font-medium text-gray-700">
          {isEvent ? 'Event Details' : 'Block Details'}
        </h2>
        <Button 
          size="sm" 
          variant="ghost" 
          className="p-1 h-auto"
          onClick={handleClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Conflicts Section - placeholder for future implementation */}
        {selectedItem.state === 'scheduled' && (
          <div>
            <h3 className="font-medium mb-3 text-gray-700">Conflicts</h3>
            <div className="space-y-2">
              {/* TODO: Implement conflict detection */}
              <div className="bg-white/50 rounded-lg p-3 text-center text-gray-500 text-xs">
                No conflicts detected
              </div>
            </div>
          </div>
        )}

        {/* Selected Item Details */}
        <div>
          <h3 className="font-medium mb-3 text-gray-700">Details</h3>
          
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div>
              <div className="font-medium text-gray-900">{selectedItem.name || 'Untitled'}</div>
              {isEvent && selectedEvent.category && (
                <div className="text-sm text-gray-600">{selectedEvent.category}</div>
              )}
            </div>
            
            {selectedItem.state === 'scheduled' && selectedItem.venue && (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Venue:</span>
                  <span className="font-medium">{selectedItem.venue.name}</span>
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
            )}

            {selectedItem.state !== 'scheduled' && (
              <div className="text-sm text-gray-500 text-center py-2">
                Drag this {isEvent ? 'event' : 'block'} to the timeline to schedule it
              </div>
            )}

            {/* Block Events List */}
            {!isEvent && selectedBlock && selectedBlock.eventIds && selectedBlock.eventIds.length > 0 && (
              <div className="pt-3 border-t">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Events in Block ({selectedBlock.eventIds.length})
                </div>
                <div className="space-y-1 text-xs">
                  {selectedBlock.eventIds.map(eventId => {
                    const event = schedule.events.find(e => e.id === eventId);
                    return event ? (
                      <div key={eventId} className="p-2 bg-gray-50 rounded">
                        {event.name}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div>
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full"
            onClick={handleDelete}
          >
            Delete {isEvent ? 'Event' : 'Block'}
          </Button>
        </div>
      </div>
    </>
  );
}