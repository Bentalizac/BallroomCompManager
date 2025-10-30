"use client";

import { useComp } from "@/providers/compProvider/compProvider";
import { useAuth } from "@/providers/auth/authProvider";
import { useEventRegistrationManager } from "@/hooks/useEventRegistration";
import { EventsList } from "@/components/events/EventsList";
import { EventRegistrationCard } from "@/components/registration/EventRegistrationCard";
import { Banner } from "@/components/custom/banner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, UserPlus } from "lucide-react";
import { ProfileCompletionDialog } from "@/components/auth/ProfileCompletionDialog";
import Link from "next/link";

export default function RegisterPage() {
  const { user } = useAuth();
  const { competition } = useComp();

  // Use the comprehensive hook for all registration functionality
  const {
    // Registration actions
    register,
    cancel,

    // State
    isEventRegistering,
    isRegistrationCancelling,
    profileMissingFields,
    showProfileDialog,
    handleProfileComplete,
    setShowProfileDialog,

    // Data
    events,
    userRegistrations,
    isLoadingEvents,
  } = useEventRegistrationManager(competition?.id);

  const handleRegister = async (eventId: string) => {
    if (!user) {
      alert("Please log in to register for events.");
      return;
    }

    try {
      // Always register as competitor for public registration
      await register(eventId, "competitor");
    } catch (error) {
      // Profile incomplete errors are handled by the hook
      // Show other errors to the user
      if (error && typeof error === "object" && "data" in error) {
        const trpcError = error as {
          data?: { code?: string };
          message?: string;
        };
        if (trpcError.data?.code !== "PRECONDITION_FAILED") {
          alert(`Registration failed: ${trpcError.message || "Unknown error"}`);
        }
      } else {
        alert(
          `Registration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }
  };

  const handleCancel = async (registrationId: string) => {
    try {
      await cancel(registrationId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Cancellation failed: ${message}`);
    }
  };

  const handleProfileCompleteAndRetry = () => {
    handleProfileComplete();
    // Note: With per-event loading states, the component should track
    // the current event ID if retry functionality is needed
  };

  const userRegistrationsList = () => {
    if (!user) return null;
    if (!userRegistrations || !events) return null;
    
    return (
      <div className="space-y-3">
        {userRegistrations.map((reg) => {
          const event = events.find((e) => e.id === reg.eventId);
          if (!event) return null;

          return (
            <EventRegistrationCard
              key={reg.id}
              entryType={event.entryType}
              event={event}
              participants={reg.participants || []}
              registration={{
                id: reg.id,
                eventId: reg.eventId,
                teamName: reg.teamName,
                status: reg.status || "active",
                createdAt: reg.createdAt?.toString() || new Date().toISOString(),
                participants: reg.participants?.map(p => ({
                  userId: p.userId,
                  role: p.role,
                  userInfo: undefined, // Add user info if available
                })) || [],
              }}
              onWithdraw={() => handleCancel(reg.id)}
            />
          );
        })}
      </div>
    );
  };

  const noRegistrationsFiller = () => {
    if (!user) return null;
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">
          <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
        </div>
        <p className="text-blue-700 text-sm">
          Your registrations will be listed here
        </p>
        <p className="text-blue-600 text-xs mt-1">
          Register for events to see them appear in this panel
        </p>
      </div>
    );
  };

  const registrationSummary = () => {
    if (!user) return null;

    return (
      <div className="w-full lg:w-96 lg:flex-shrink-0">
        <div className="bg-blue-50 rounded-lg p-6 sticky top-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Your Registrations
          </h3>

          {userRegistrations && userRegistrations.length > 0 ? (
            <>
              <p className="text-blue-800 mb-4">
                You are registered for {userRegistrations.length} event
                {userRegistrations.length !== 1 ? "s" : ""}:
              </p>
              <div>{userRegistrationsList()}</div>
            </>
          ) : (
            <>{noRegistrationsFiller()}</>
          )}
        </div>
      </div>
    );
  };

  if (isLoadingEvents) {
    return (
      <>
        <Banner name="Register" />
        <main className="max-w-6xl mx-auto py-10 px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading events...</span>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="max-w-6xl mx-auto py-10 px-4 space-y-8">
        {/* Welcome Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Registration
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Register to compete in events at {competition?.name}.
          </p>

          {!user && (
            <Alert className="max-w-2xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-left">
                <strong>Login Required:</strong> You must be logged in to
                register for events.
                <Link
                  href="/auth"
                  className="ml-2 text-blue-600 hover:underline"
                >
                  Click here to login
                </Link>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Events List and Registration Summary Side by Side */}
        {events && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Events List - Takes up more space on larger screens */}
            <div className="flex-1">
              <EventsList
                events={events.map((event) => ({
                  id: event.id,
                  name: event.name,
                  startDate: event.startAt,
                  endDate: event.endAt,
                  eventStatus: event.eventStatus,
                }))}
                userRegistrations={
                  userRegistrations?.map((reg) => ({
                    id: reg.id,
                    eventId: reg.eventId,
                    role: reg.participants?.[0]?.role || "member", // Get role from first participant
                    registrationStatus: reg.status || "active",
                  })) || []
                }
                onRegister={handleRegister}
                onCancel={handleCancel}
                isEventRegistering={isEventRegistering}
                isRegistrationCancelling={isRegistrationCancelling}
                showRegistration={true}
                title=" "
              />
            </div>

            {/* Registration Summary - Always shown when user is logged in */}
            {registrationSummary()}
          </div>
        )}

        {/* Profile Completion Dialog */}
        <ProfileCompletionDialog
          open={showProfileDialog}
          onOpenChange={setShowProfileDialog}
          missingFields={profileMissingFields}
          onComplete={handleProfileCompleteAndRetry}
        />
      </main>
    </>
  );
}
