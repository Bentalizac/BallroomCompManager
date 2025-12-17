"use client";
import { Venue } from "@ballroom/shared/dist";

interface VenueSelectorProps {
  selectedVenueId: string;
  venues: Venue[] | undefined;
  isLoading: boolean;
  showCreateForm: boolean;
  onVenueSelect: (venueId: string) => void;
  onToggleCreateForm: () => void;
}

export function VenueSelector({
  selectedVenueId,
  venues,
  isLoading,
  showCreateForm,
  onVenueSelect,
  onToggleCreateForm,
}: VenueSelectorProps) {
  return (
    <div>
      <label
        htmlFor="venueId"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Venue (Optional)
      </label>
      <div className="flex gap-2">
        <select
          id="venueId"
          value={selectedVenueId}
          onChange={(e) => onVenueSelect(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        >
          <option value="">Select a venue</option>
          {venues?.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}{" "}
              {venue.address!.city && venue.address!.state
                ? `- ${venue.address!.city}, ${venue.address!.state}`
                : ""}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onToggleCreateForm}
          className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {showCreateForm ? "Cancel" : "Add New"}
        </button>
      </div>
    </div>
  );
}
