"use client";

import {
  useCompetitionBySlug,
  useCompetitionDisplay,
} from "@/hooks/useCompetitions";
import type { Competition } from "@ballroomcompmanager/shared";
import Link from "next/link";

interface CompetitionCardProps {
  competitionSlug: string;
}

export function CompetitionCard({ competitionSlug }: CompetitionCardProps) {
  // Fetch competition data
  const { data: competition, isLoading, error } = useCompetitionBySlug(competitionSlug);

  // Get computed display data
  // Note: competition from API has string dates, but useCompetitionDisplay handles the conversion
  const displayData = useCompetitionDisplay(competition as unknown as Competition);

  if (isLoading) {
    return (
      <div className="border rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-200 rounded-lg p-6 bg-red-50">
        <p className="text-red-600">
          Error loading competition: {error.message}
        </p>
      </div>
    );
  }

  if (!displayData) {
    return (
      <div className="border rounded-lg p-6">
        <p>Competition not found</p>
      </div>
    );
  }

  return (
    <Link 
      href={`/comp/${competitionSlug}`}
      className="block border rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer group"
    >
      {/* Competition Title */}
      <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-700 transition-colors">
        {displayData.name}
      </h3>

      {/* Date & Time Info */}
      <div className="mb-4 text-gray-600">
        <p className="font-medium text-gray-800">{displayData.formattedStartDate}</p>
        <p className="text-sm">{displayData.formattedStartTime}</p>
        {displayData.daysUntilStart > 0 && (
          <p className="text-sm text-blue-600 font-medium mt-1">
            {displayData.daysUntilStart} day{displayData.daysUntilStart !== 1 ? "s" : ""} until start
          </p>
        )}
      </div>

      {/* Status Badge & Venue */}
      <div className="flex items-center justify-between mb-4">
        <div>
          {displayData.isUpcoming && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Upcoming
            </span>
          )}
          {displayData.isOngoing && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Live Now
            </span>
          )}
          {displayData.isPast && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Completed
            </span>
          )}
        </div>
        
        {/* Venue Info */}
        {competition?.venue && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{competition.venue.name}</p>
            {competition.venue.address && competition.venue.address.city && competition.venue.address.state && (
              <p className="text-xs text-gray-500">
                {competition.venue.address.city}, {competition.venue.address.state}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Events Info */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">
            {displayData.eventCount} event{displayData.eventCount !== 1 ? "s" : ""}
          </p>
          <span className="text-xs text-blue-600 group-hover:text-blue-700 font-medium">
            View Details →
          </span>
        </div>
        
        {displayData.events.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {displayData.events.slice(0, 3).map((event) => (
              <span
                key={event.id}
                className="inline-block bg-gray-100 group-hover:bg-blue-100 text-gray-700 group-hover:text-blue-700 text-xs px-2 py-1 rounded transition-colors"
              >
                {event.name}
              </span>
            ))}
            {displayData.events.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{displayData.events.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
