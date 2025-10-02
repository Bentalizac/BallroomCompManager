'use client';

import { useState } from 'react';
import { useCreateEvent } from '@/hooks/useCompetitions';
import { useEventCategories, useRulesets } from '@/hooks/useData';

interface CreateEventFormProps {
  competitionId: string;
  competitionName?: string;
  competitionStartDate?: string;
  competitionEndDate?: string;
  onSuccess?: (eventId: string) => void;
  onCancel?: () => void;
}

export function CreateEventForm({ 
  competitionId, 
  competitionName,
  competitionStartDate,
  competitionEndDate,
  onSuccess, 
  onCancel 
}: CreateEventFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    startDate: competitionStartDate || '',
    endDate: competitionStartDate || '',
    categoryId: '',
    rulesetId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categories, isLoading: categoriesLoading } = useEventCategories();
  const { data: rulesets, isLoading: rulesetsLoading } = useRulesets();
  const createEvent = useCreateEvent();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (startDate > endDate) {
        newErrors.endDate = 'End date must be after or equal to start date';
      }
      
      // Check if dates are within competition date range
      if (competitionStartDate && competitionEndDate) {
        const compStart = new Date(competitionStartDate);
        const compEnd = new Date(competitionEndDate);
        
        if (startDate < compStart) {
          newErrors.startDate = 'Event start date cannot be before competition start date';
        }
        
        if (endDate > compEnd) {
          newErrors.endDate = 'Event end date cannot be after competition end date';
        }
      }
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Event category is required';
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
      const result = await createEvent.mutateAsync({
        competitionId,
        name: formData.name.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        categoryId: formData.categoryId,
        rulesetId: formData.rulesetId,
      });

      if (onSuccess) {
        onSuccess(result.id);
      }
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  // Generate event name suggestion based on category and ruleset
  const generateEventName = () => {
    if (formData.categoryId && formData.rulesetId) {
      const category = categories?.find(c => c.id === formData.categoryId);
      const ruleset = rulesets?.find(r => r.id === formData.rulesetId);
      
      if (category && ruleset) {
        const suggestedName = `${category.name} ${ruleset.name}`;
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
                disabled={!formData.categoryId || !formData.rulesetId}
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

          {/* Event Category and Ruleset */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                Event Category *
              </label>
              <select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.categoryId ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={categoriesLoading}
              >
                <option value="">Select category</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
            </div>

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

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Event Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                min={competitionStartDate}
                max={competitionEndDate}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.startDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                Event End Date *
              </label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                min={formData.startDate || competitionStartDate}
                max={competitionEndDate}
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
        {createEvent.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">
              Failed to create event: {createEvent.error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}