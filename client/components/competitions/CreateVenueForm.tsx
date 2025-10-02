'use client';

import { useState } from 'react';

interface VenueData {
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  googleMapsUrl: string;
}

interface CreateVenueFormProps {
  onSubmit: (venueData: VenueData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function CreateVenueForm({ onSubmit, onCancel, isLoading }: CreateVenueFormProps) {
  const [venueData, setVenueData] = useState<VenueData>({
    name: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    googleMapsUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!venueData.name.trim()) {
      return;
    }

    await onSubmit(venueData);
    
    // Reset form after successful submission
    setVenueData({
      name: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      googleMapsUrl: '',
    });
  };

  const updateField = (field: keyof VenueData, value: string) => {
    setVenueData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Venue</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue Name *
            </label>
            <input
              type="text"
              value={venueData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Emerald Ballroom"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              value={venueData.street}
              onChange={(e) => updateField('street', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 123 Dance Street"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={venueData.city}
              onChange={(e) => updateField('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., San Francisco"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State/Province
            </label>
            <input
              type="text"
              value={venueData.state}
              onChange={(e) => updateField('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., CA"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              value={venueData.postalCode}
              onChange={(e) => updateField('postalCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 94102"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              value={venueData.country}
              onChange={(e) => updateField('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., USA"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Maps URL
            </label>
            <input
              type="url"
              value={venueData.googleMapsUrl}
              onChange={(e) => updateField('googleMapsUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://maps.google.com/?q=..."
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!venueData.name.trim() || isLoading}
            className="px-4 py-2 text-sm text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Venue'}
          </button>
        </div>
      </form>
    </div>
  );
}