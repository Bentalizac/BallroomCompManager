"use client";

import {
  useCompetitionBySlug,
  useCompetitionDisplay,
  useUserRegistration,
  useCanRegister,
  useRegisterForCompetition,
} from "@/hooks/useCompetitions";
import { useAuth } from "@/providers/auth/authProvider";
import { CompRoles } from "@ballroomcompmanager/shared";

interface CompetitionCardProps {
  competitionSlug: string;
}

export function CompetitionCard({ competitionSlug }: CompetitionCardProps) {
  // Get authenticated user from auth context
  const { user } = useAuth();
  const userId = user?.id;
  // Fetch competition data
  const { data: competition, isLoading, error } = useCompetitionBySlug(competitionSlug);

  // Get computed display data
  const displayData = useCompetitionDisplay(competition || undefined);

  // Check user's registration status  
  const { data: userRegistration } = useUserRegistration(competition?.id, userId);

  // Check if user can register
  const { canRegister, reason } = useCanRegister(
    competition || undefined,
    userRegistration,
    !!user,
  );

  // Registration mutation
  const registerMutation = useRegisterForCompetition();

  const handleRegister = () => {
    if (canRegister && userId && competition?.id) {
      registerMutation.mutate({
        competitionId: competition.id,
        userId,
        roles: [CompRoles.Spectator], // Default to spectator role
      });
    }
  };

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
    <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Competition Title */}
      <h3 className="text-xl font-semibold mb-2">
        Competition {displayData.name}
      </h3>

      {/* Date & Time Info */}
      <div className="mb-4 text-gray-600">
        <p className="font-medium">{displayData.formattedStartDate}</p>
        <p>{displayData.formattedStartTime}</p>
        {displayData.daysUntilStart > 0 && (
          <p className="text-sm">
            {displayData.daysUntilStart} day
            {displayData.daysUntilStart !== 1 ? "s" : ""} until start
          </p>
        )}
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        {displayData.isUpcoming && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Upcoming
          </span>
        )}
        {displayData.isOngoing && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Ongoing
          </span>
        )}
        {displayData.isPast && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Past
          </span>
        )}
      </div>

      {/* Events Info */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {displayData.eventCount} event
          {displayData.eventCount !== 1 ? "s" : ""}
        </p>
        {displayData.events.length > 0 && (
          <div className="mt-2">
            {displayData.events.slice(0, 3).map((event) => (
              <span
                key={event.id}
                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-1 mb-1"
              >
                {event.name}
              </span>
            ))}
            {displayData.events.length > 3 && (
              <span className="text-xs text-gray-500">
                +{displayData.events.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Registration Status - Only show if user is authenticated */}
      {user && userRegistration && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm font-medium text-blue-800">
            Registration Status:{" "}
            {userRegistration.status.charAt(0).toUpperCase() +
              userRegistration.status.slice(1)}
          </p>
          <p className="text-xs text-blue-600">
            Registered on{" "}
            {new Date(userRegistration.registrationDate).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Registration Button */}
      {!user ? (
        // Anonymous user - show login prompt
        <div className="w-full bg-gray-100 text-gray-600 px-4 py-2 rounded text-center">
          <p className="text-sm mb-2">Sign in to register for competitions</p>
          <button
            onClick={() => (window.location.href = "/auth")}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Sign In
          </button>
        </div>
      ) : canRegister ? (
        // Authenticated user can register
        <button
          onClick={handleRegister}
          disabled={registerMutation.isPending}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {registerMutation.isPending ? "Registering..." : "Register"}
        </button>
      ) : (
        // Authenticated user cannot register (already registered, competition started, etc.)
        <div className="w-full bg-gray-100 text-gray-500 px-4 py-2 rounded text-center">
          {reason}
        </div>
      )}

      {/* Error Message */}
      {registerMutation.error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-600">
            Registration failed: {registerMutation.error.message}
          </p>
        </div>
      )}

      {/* Success Message */}
      {registerMutation.isSuccess && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-600">Successfully registered!</p>
        </div>
      )}
    </div>
  );
}
