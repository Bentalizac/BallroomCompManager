import { ScheduledEvent } from './Timeline';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle, Clock, Users } from 'lucide-react';

interface SidePanelProps {
  selectedEvent: ScheduledEvent | null;
}

export function SidePanel({ selectedEvent }: SidePanelProps) {
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

  return (
    <div className="w-80 bg-[#e8ddf0] p-4 space-y-6">
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
              <div className="font-medium text-gray-900">{selectedEvent.name}</div>
              <div className="text-sm text-gray-600">{selectedEvent.division}</div>
              <div className="text-sm text-gray-600">{selectedEvent.type}</div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Day:</span>
                <span className="font-medium">{selectedEvent.day}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Venue:</span>
                <span className="font-medium">{selectedEvent.venue}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Start Time:</span>
                <span className="font-medium">{formatTime(selectedEvent.startTime)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{formatDuration(selectedEvent.duration)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">End Time:</span>
                <span className="font-medium">{formatTime(selectedEvent.startTime + selectedEvent.duration)}</span>
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
  );
}