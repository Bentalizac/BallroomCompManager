'use client';

import { useState, useEffect } from 'react';
import { useCreateEvent } from '@/hooks/useCompetitions';
import { useRulesets } from '@/hooks/useData';
import { localInputToUtcIso, getCurrentTimeInZone } from '@/lib/datetime';
import {
  DanceStyle,
  BallroomLevel,
  WCSLevel,
  CountrySwingLevel,
  OtherLevel,
  type EventCategory,
} from '@ballroomcompmanager/shared';

interface CreateEventFormProps {
  competitionId: string;
  competitionName?: string;
  competitionStartDate?: string;
  competitionEndDate?: string;
  competitionTimeZone: string; // IANA time zone identifier
  onSuccess?: (eventId: string) => void;
  onCancel?: () => void;
}

export function CreateEventForm({ 
  competitionId, 
  competitionName,
  competitionStartDate,
  competitionEndDate,
  competitionTimeZone,
  onSuccess, 
  onCancel 
}: CreateEventFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '', // datetime-local format in competition timezone
    endDate: '',   // datetime-local format in competition timezone
    style: '' as DanceStyle | '',
    level: '',
    rulesetId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: rulesets, isLoading: rulesetsLoading } = useRulesets();
  const createEvent = useCreateEvent();

  // Get available levels based on selected dance style
  const getAvailableLevels = (): string[] => {
    if (!formData.style) return [];
    
    switch (formData.style) {
      case DanceStyle.Ballroom:
      case DanceStyle.Latin:
      case DanceStyle.Smooth:
      case DanceStyle.Rhythm:
        return Object.values(BallroomLevel);
      case DanceStyle.WestCoast:
        return Object.values(WCSLevel);
      case DanceStyle.CountrySwing:
        return Object.values(CountrySwingLevel);
      case DanceStyle.Other:
        return Object.values(OtherLevel);
      default:
        return [];
    }
  };

  // Reset level when style changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, level: '' }));
  }, [formData.style]);

  // Initialize default times in competition timezone
  useEffect(() => {
    try {
      // Set default start time to current time in competition timezone
      const currentTime = getCurrentTimeInZone(competitionTimeZone);
      
      // If we have competition start date, use that as default, otherwise use current time
      let defaultStartDate = currentTime;
      if (competitionStartDate) {
        // Convert competition start date to datetime-local format at 9:00 AM in competition timezone
        defaultStartDate = `${competitionStartDate}T09:00`;
      }
      
      // Default end time is 3 hours after start time
      let defaultEndDate = currentTime;
      if (competitionStartDate) {
        defaultEndDate = `${competitionStartDate}T17:00`;
      }
      
      setFormData(prev => ({
        ...prev,
        startDate: defaultStartDate,
        endDate: defaultEndDate,
      }));
    } catch (error) {
      console.error('Failed to set default times:', error);
      // Fallback to basic datetime-local format
      const now = new Date();
      const isoString = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
      setFormData(prev => ({
        ...prev,
        startDate: isoString,
        endDate: isoString,
      }));
    }
  }, [competitionStartDate, competitionTimeZone]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start time is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End time is required';
    }
    
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate >= endDate) {
        newErrors.endDate = 'End time must be after start time';
      }
      
      // Check if dates are within competition date range
      if (competitionStartDate && competitionEndDate) {
        // Convert competition dates to datetime for comparison (using start of day and end of day)
        const compStart = new Date(`${competitionStartDate}T00:00`);
        const compEnd = new Date(`${competitionEndDate}T23:59`);
        
        if (startDate < compStart) {
          newErrors.startDate = 'Event start time cannot be before competition start date';
        }
        
        if (endDate > compEnd) {
          newErrors.endDate = 'Event end time cannot be after competition end date';
        }
      }
    }
    
    if (!formData.style) {
      newErrors.style = 'Dance style is required';
    }
    
    if (!formData.level) {
      newErrors.level = 'Level is required';
    }
    
    if (!formData.rulesetId) {
      newErrors.rulesetId = 'Ruleset is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Convert local datetime-local inputs to Date objects
      const startDate = new Date(localInputToUtcIso(formData.startDate, competitionTimeZone));
      const endDate = new Date(localInputToUtcIso(formData.endDate, competitionTimeZone));
      
      // Construct EventCategory from style and level
      const category: EventCategory = {
        style: formData.style as DanceStyle,
        level: formData.level as any, // Type will be validated by EventCategorySchema on server
      };
      
      const result = await createEvent.mutateAsync({
        competitionId,
        name: formData.name.trim(),
        startDate,
        endDate,
        category,
        rulesetId: formData.rulesetId,
      });

      if (onSuccess) {
        onSuccess(result.id);
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      // Handle timezone conversion errors specifically
      if (error instanceof Error && error.message.includes('Failed to convert')) {
        setErrors({ general: 'Invalid date/time format. Please check your entries.' });
      }
    }
  };

  // Generate event name suggestion based on style, level, and ruleset
  const generateEventName = () => {
    if (formData.style && formData.level && formData.rulesetId) {
      const ruleset = rulesets?.find(r => r.id === formData.rulesetId);
      
      if (ruleset) {
        // Format style and level for display
        const styleDisplay = formData.style.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        const levelDisplay = formData.level.charAt(0).toUpperCase() + formData.level.slice(1);
        
        const suggestedName = `${styleDisplay} ${levelDisplay} - ${ruleset.name}`;
        setFormData(prev => ({ ...prev, name: suggestedName }));
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
          {competitionName && (
            <p className="text-gray-600 mt-1">for {competitionName}</p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Name */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Event Name *
              </label>
              <button
                type="button"
                onClick={generateEventName}
                disabled={!formData.style || !formData.level || !formData.rulesetId}
                className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Auto-generate
              </button>
            </div>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Amateur Standard, Professional Latin"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Dance Style and Level (cascading) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-2">
                Dance Style *
              </label>
              <select
                id="style"
                value={formData.style}
                onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value as DanceStyle }))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.style ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select dance style</option>
                {Object.values(DanceStyle).map((style) => (
                  <option key={style} value={style}>
                    {style.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
              {errors.style && <p className="mt-1 text-sm text-red-600">{errors.style}</p>}
            </div>

            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                Level *
              </label>
              <select
                id="level"
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.level ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={!formData.style}
              >
                <option value="">Select level</option>
                {getAvailableLevels().map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
              {errors.level && <p className="mt-1 text-sm text-red-600">{errors.level}</p>}
            </div>
          </div>

          {/* Ruleset */}
          <div>
            <label htmlFor="rulesetId" className="block text-sm font-medium text-gray-700 mb-2">
              Ruleset *
            </label>
            <select
              id="rulesetId"
              value={formData.rulesetId}
              onChange={(e) => setFormData(prev => ({ ...prev, rulesetId: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                errors.rulesetId ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={rulesetsLoading}
            >
              <option value="">Select ruleset</option>
              {rulesets?.map((ruleset) => (
                <option key={ruleset.id} value={ruleset.id}>
                  {ruleset.name} 
                  {ruleset.scoring_methods && (
                    <span className="text-gray-500">
                      ({ruleset.scoring_methods.name})
                    </span>
                  )}
                </option>
              ))}
            </select>
            {errors.rulesetId && <p className="mt-1 text-sm text-red-600">{errors.rulesetId}</p>}
          </div>

          {/* Selected Ruleset Info */}
          {formData.rulesetId && rulesets && (
            (() => {
              const selectedRuleset = rulesets.find(r => r.id === formData.rulesetId);
              if (selectedRuleset?.scoring_methods) {
                return (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="text-sm font-medium text-blue-800 mb-1">
                      Scoring Method: {selectedRuleset.scoring_methods.name}
                    </h4>
                    {selectedRuleset.scoring_methods.description && (
                      <p className="text-sm text-blue-700">
                        {selectedRuleset.scoring_methods.description}
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            })()
          )}

          {/* Timezone Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-1">
              Competition Time Zone: {competitionTimeZone}
            </h4>
            <p className="text-sm text-blue-700">
              All event times will be converted to UTC for storage and displayed in the competition&apos;s local time.
            </p>
          </div>

          {/* DateTime Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Event Start Time *
              </label>
              <input
                type="datetime-local"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.startDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                Event End Time *
              </label>
              <input
                type="datetime-local"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.endDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
            </div>
          </div>

          {/* Competition Date Range Info */}
          {competitionStartDate && competitionEndDate && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <p>
                <strong>Competition dates:</strong> {' '}
                {new Date(competitionStartDate).toLocaleDateString()} to{' '}
                {new Date(competitionEndDate).toLocaleDateString()}
              </p>
              <p className="mt-1">
                Event dates must be within the competition date range.
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={createEvent.isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createEvent.isLoading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>

        {/* Error Messages */}
        {(createEvent.error || errors.general) && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">
              {errors.general || `Failed to create event: ${createEvent.error?.message}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}