"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, CheckCircle, AlertCircle } from "lucide-react";
import { CompEvent } from "@ballroom/shared/dist";

interface EventCardProps {
  event: CompEvent;
  userRegistration?: {
    id: string;
    role: string;
    registrationStatus: string;
  } | null;
  onRegister?: (eventId: string) => void; // Simplified - always competitor role
  onCancel?: (registrationId: string) => void;
  isRegistering?: boolean;
  isCancelling?: boolean;
  showRegistration?: boolean;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  current: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-gray-100 text-gray-800 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<string, string> = {
  scheduled: "Scheduled",
  current: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function EventCard({
  event,
  userRegistration,
  onRegister,
  onCancel,
  isRegistering = false,
  isCancelling = false,
  showRegistration = true,
}: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getEventStatus = () => {
    if (!event.startDate || !event.endDate) {
      return "scheduled";
    }

    const now = Date.now();
    const start = new Date(event.startDate).getTime();
    const end = new Date(event.endDate).getTime();

    if (now < start) {
      return "scheduled";
    } else if (now >= start && now <= end) {
      return "current";
    } else {
      return "completed";
    }
  };

  const eventStatus = getEventStatus();
  const canRegister = eventStatus === "scheduled" && !userRegistration;

  const canCancel =
    userRegistration && userRegistration.registrationStatus === "active";
  console.log(event);
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {event.category.style} - {event.category.level}
            </CardTitle>
            <Badge className={statusColors[eventStatus]}>
              {statusLabels[eventStatus]}
            </Badge>
          </div>

          {userRegistration && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Registered as {userRegistration.role}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {event.startDate && formatDate(event.startDate.toString())}
              {event.endDate &&
                event.startDate !== event.endDate &&
                ` - ${formatDate(event.endDate.toString())}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              {event.startDate &&
                formatTime(formatDate(event.startDate.toString()))}
            </span>
          </div>
        </div>

        {/* Registration Section */}
        {showRegistration && (
          <div className="border-t pt-4">
            {canRegister && (
              <div className="space-y-3">
                <Button
                  onClick={() => onRegister?.(event.id)}
                  disabled={isRegistering}
                  className="w-full"
                >
                  {isRegistering ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Registering...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Register to Compete
                    </>
                  )}
                </Button>
              </div>
            )}

            {canCancel && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>You&apos;re registered for this event</span>
                </div>

                <Button
                  variant="outline"
                  onClick={() => onCancel?.(userRegistration.id)}
                  disabled={isCancelling}
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                >
                  {isCancelling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Registration"
                  )}
                </Button>
              </div>
            )}

            {!canRegister && !canCancel && eventStatus === "scheduled" && (
              <div className="text-center text-gray-500 text-sm">
                <AlertCircle className="h-4 w-4 mx-auto mb-1" />
                Registration not available
              </div>
            )}

            {eventStatus !== "scheduled" && (
              <div className="text-center text-gray-500 text-sm">
                <AlertCircle className="h-4 w-4 mx-auto mb-1" />
                Registration closed
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
