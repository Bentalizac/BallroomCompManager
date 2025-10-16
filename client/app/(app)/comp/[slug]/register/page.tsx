"use client";

import { useState } from "react";
import { useComp } from "@/providers/compProvider/compProvider";
import { useAuth } from "@/providers/auth/authProvider";
import { trpc } from "@/lib/trpc";
import { EventsList } from "@/components/events/EventsList";
import { Banner } from "@/components/custom/banner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, UserPlus } from "lucide-react";
import { ProfileCompletionDialog } from "@/components/auth/ProfileCompletionDialog";
import Link from "next/link";

export default function RegisterPage() {
  const { user } = useAuth();
  const { competition } = useComp();
  const [registeringEventId, setRegisteringEventId] = useState<string | null>(null);
  const [cancellingRegId, setCancellingRegId] = useState<string | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileMissingFields, setProfileMissingFields] = useState<string[]>([]);

  // Get competition events
  const { data: events, isLoading: eventsLoading, refetch: refetchEvents } = trpc.competition.getEvents.useQuery(
    { competitionId: competition?.id || "" },
    { enabled: !!competition?.id }
  );

  // Get user's current registrations
  const { data: userRegistrations, isLoading: registrationsLoading, refetch: refetchRegistrations } = 
    trpc.event.getUserEventRegistrations.useQuery(
      { competitionId: competition?.id || "" },
      { enabled: !!user && !!competition?.id }
    );

  // Register for event mutation
  const registerMutation = trpc.event.registerForEvent.useMutation({
    onSuccess: () => {
      refetchRegistrations();
      setRegisteringEventId(null);
    },
    onError: (error) => {
      console.error("Registration failed:", error);
      
      // Handle profile incomplete errors
      if (error.data?.code === "PRECONDITION_FAILED" && 
          (error as any).cause?.code === "PROFILE_INCOMPLETE") {
        setProfileMissingFields((error as any).cause?.missingFields || []);
        setShowProfileDialog(true);
      } else {
        alert(`Registration failed: ${error.message}`);
      }
      
      setRegisteringEventId(null);
    },
  });

  // Cancel registration mutation
  const cancelMutation = trpc.event.cancelEventRegistration.useMutation({
    onSuccess: () => {
      refetchRegistrations();
      setCancellingRegId(null);
    },
    onError: (error) => {
      console.error("Cancellation failed:", error);
      alert(`Cancellation failed: ${error.message}`);
      setCancellingRegId(null);
    },
  });

  const handleRegister = async (eventId: string) => {
    if (!user) {
      alert("Please log in to register for events.");
      return;
    }

    setRegisteringEventId(eventId);
    try {
      // Always register as competitor for public registration
      await registerMutation.mutateAsync({ eventId, role: 'competitor' });
    } catch (error) {
      // Error handled in onError callback
    }
  };

  const handleCancel = async (registrationId: string) => {
    setCancellingRegId(registrationId);
    try {
      await cancelMutation.mutateAsync({ registrationId });
    } catch (error) {
      // Error handled in onError callback
    }
  };

  const handleProfileComplete = () => {
    // Refetch registrations to ensure profile is updated
    refetchRegistrations();
    // Try the registration again if there was a pending event
    if (registeringEventId) {
      handleRegister(registeringEventId);
    }
  };

  if (eventsLoading) {
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
              role: reg.role,
              registrationStatus: reg.registrationStatus,
            })) || []}
            onRegister={handleRegister}
            onCancel={handleCancel}
            isRegistering={!!registeringEventId}
            isCancelling={!!cancellingRegId}
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
              {userRegistrations.map(reg => (
                <div key={reg.id} className="flex justify-between items-center bg-white rounded px-4 py-2">
                  <span className="font-medium">{reg.eventName}</span>
                  <span className="text-sm text-gray-600 capitalize">{reg.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Profile Completion Dialog */}
        <ProfileCompletionDialog
          open={showProfileDialog}
          onOpenChange={setShowProfileDialog}
          missingFields={profileMissingFields}
          onComplete={handleProfileComplete}
        />
      </main>
    </>
  );
}
