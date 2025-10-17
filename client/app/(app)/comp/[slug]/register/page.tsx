"use client";

import { useComp } from "@/providers/compProvider/compProvider";
import { useAuth } from "@/providers/auth/authProvider";
import { useEventRegistrationManager } from "@/hooks/useEventRegistration";
import { EventsList } from "@/components/events/EventsList";
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
      await register(eventId, 'competitor');
    } catch (error) {
      // Profile incomplete errors are handled by the hook
      // Show other errors to the user
      if (error && typeof error === 'object' && 'data' in error) {
        const trpcError = error as { data?: { code?: string }; message?: string };
        if (trpcError.data?.code !== "PRECONDITION_FAILED") {
          alert(`Registration failed: ${trpcError.message || 'Unknown error'}`);
        }
      } else {
        alert(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleCancel = async (registrationId: string) => {
    try {
      await cancel(registrationId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Cancellation failed: ${message}`);
    }
  };

  const handleProfileCompleteAndRetry = () => {
    handleProfileComplete();
    // Note: With per-event loading states, the component should track
    // the current event ID if retry functionality is needed
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
      <Banner name="Register" />
      <main className="max-w-6xl mx-auto py-10 px-4 space-y-8">
        {/* Welcome Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Competitor Registration</h1>
          <p className="text-lg text-gray-600 mb-6">
            Register to compete in events at {competition?.name}. Select the events you want to participate in!
          </p>
          
          {!user && (
            <Alert className="max-w-2xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-left">
                <strong>Login Required:</strong> You must be logged in to register for events.
                <Link href="/auth" className="ml-2 text-blue-600 hover:underline">
                  Click here to login
                </Link>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Events List */}
        {events && (
          <EventsList
            events={events.map(event => ({
              id: event.id,
              name: event.name,
              startDate: event.startAt,
              endDate: event.endAt,
              eventStatus: event.eventStatus,
            }))}
            userRegistrations={userRegistrations?.map(reg => ({
              id: reg.id,
              eventId: reg.eventId,
              role: reg.participants?.[0]?.role || 'member', // Get role from first participant
              registrationStatus: reg.status || 'active',
            })) || []}
            onRegister={handleRegister}
            onCancel={handleCancel}
            isEventRegistering={isEventRegistering}
            isRegistrationCancelling={isRegistrationCancelling}
            showRegistration={true}
            title="Competition Events"
            description="Select the events you want to compete in"
          />
        )}

        {/* Registration Summary */}
        {user && userRegistrations && userRegistrations.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Your Registrations
            </h3>
            <p className="text-blue-800 mb-4">
              You are registered for {userRegistrations.length} event{userRegistrations.length !== 1 ? 's' : ''}:
            </p>
            <div className="space-y-2">
              {userRegistrations.map(reg => {
                const eventName = events?.find(e => e.id === reg.eventId)?.name || 'Unknown Event';
                const userRole = reg.participants?.find(p => p.userId === user?.id)?.role || 'member';
                
                return (
                  <div key={reg.id} className="flex justify-between items-center bg-white rounded px-4 py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">{eventName}</span>
                      {reg.teamName && (
                        <span className="text-sm text-gray-500">Team: {reg.teamName}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-600 capitalize">{userRole}</span>
                      <div className="text-xs text-gray-500">
                        {reg.participants?.length || 1} participant{(reg.participants?.length || 1) !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
