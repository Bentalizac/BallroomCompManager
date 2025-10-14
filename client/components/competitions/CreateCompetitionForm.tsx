'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth/authProvider';
import { useCreateCompetition } from '@/hooks/useCompetitions';
import { useVenues, useCreateVenue } from '@/hooks/useData';
import { CompetitionBasicInfoForm } from './CompetitionBasicInfoForm';
import { VenueSelector } from './VenueSelector';
import { CreateVenueForm } from './CreateVenueForm';
import { AuthenticationGuard } from './AuthenticationGuard';
import { ErrorDisplay } from './ErrorDisplay';

interface CreateCompetitionFormProps {
  onSuccess?: (competitionId: string) => void;
  onCancel?: () => void;
}

export function CreateCompetitionForm({ onSuccess, onCancel }: CreateCompetitionFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    venueId: '',
  });
  const [showCreateVenue, setShowCreateVenue] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: venues, isLoading: venuesLoading } = useVenues();
  const createCompetition = useCreateCompetition();
  const createVenue = useCreateVenue();

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <AuthenticationGuard 
        message="You need to be logged in to create a competition."
      />
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Competition name is required';
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
      if (startDate >= endDate) {
        newErrors.endDate = 'End date must be after start date';
      }
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
      const result = await createCompetition.mutateAsync({
        name: formData.name.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        venueId: formData.venueId || undefined,
      });

      if (onSuccess) {
        onSuccess(result.id);
      } else {
        // Use slug for navigation now that API returns it
        router.push(`/comp/${result.slug}`);
      }
    } catch (error) {
      console.error('Failed to create competition:', error);
    }
  };

  const handleCreateVenue = async (venueData: {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    googleMapsUrl: string;
  }) => {
    try {
      const venue = await createVenue.mutateAsync({
        name: venueData.name.trim(),
        street: venueData.street.trim() || undefined,
        city: venueData.city.trim() || undefined,
        state: venueData.state.trim() || undefined,
        postalCode: venueData.postalCode.trim() || undefined,
        country: venueData.country.trim() || undefined,
        googleMapsUrl: venueData.googleMapsUrl.trim() || undefined,
      });

      // Set the newly created venue as selected
      setFormData(prev => ({ ...prev, venueId: venue.id }));
      
      // Hide the create form
      setShowCreateVenue(false);
    } catch (error) {
      console.error('Failed to create venue:', error);
      throw error; // Let the component handle the error display
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Competition</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <CompetitionBasicInfoForm
            name={formData.name}
            startDate={formData.startDate}
            endDate={formData.endDate}
            errors={errors}
            onNameChange={(name) => setFormData(prev => ({ ...prev, name }))}
            onStartDateChange={(startDate) => setFormData(prev => ({ ...prev, startDate }))}
            onEndDateChange={(endDate) => setFormData(prev => ({ ...prev, endDate }))}
          />

          <VenueSelector
            selectedVenueId={formData.venueId}
            venues={venues}
            isLoading={venuesLoading}
            showCreateForm={showCreateVenue}
            onVenueSelect={(venueId) => setFormData(prev => ({ ...prev, venueId }))}
            onToggleCreateForm={() => setShowCreateVenue(!showCreateVenue)}
          />

          {/* New Venue Form */}
          {showCreateVenue && (
            <CreateVenueForm
              onSubmit={handleCreateVenue}
              onCancel={() => setShowCreateVenue(false)}
              isLoading={createVenue.isLoading}
            />
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onCancel ? onCancel() : router.push('/comp')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCompetition.isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createCompetition.isLoading ? 'Creating...' : 'Create Competition'}
            </button>
          </div>
        </form>

        {/* Error Messages */}
        <ErrorDisplay 
          title="Failed to create competition" 
          error={createCompetition.error}
        />
        
        <ErrorDisplay 
          title="Failed to create venue" 
          error={createVenue.error}
        />
      </div>
    </div>
  );
}