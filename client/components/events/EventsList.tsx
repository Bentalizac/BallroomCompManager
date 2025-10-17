"use client";

import { useState, useMemo } from "react";
import { EventCard } from "./EventCard";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Calendar } from "lucide-react";

interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  eventStatus: 'scheduled' | 'current' | 'completed' | 'cancelled';
}

interface UserRegistration {
  id: string;
  eventId: string;
  role: string;
  registrationStatus: string;
}

interface EventsListProps {
  events: Event[];
  userRegistrations?: UserRegistration[];
  onRegister?: (eventId: string) => void; // Simplified - always competitor role
  onCancel?: (registrationId: string) => void;
  isEventRegistering?: (eventId: string) => boolean; // Function to check if specific event is registering
  isRegistrationCancelling?: (registrationId: string) => boolean; // Function to check if specific registration is cancelling
  showRegistration?: boolean;
  title?: string;
  description?: string;
}

export function EventsList({
  events,
  userRegistrations = [],
  onRegister,
  onCancel,
  isEventRegistering = () => false,
  isRegistrationCancelling = () => false,
  showRegistration = true,
  title = "Events",
  description,
}: EventsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Create lookup map for user registrations
  const registrationMap = useMemo(() => {
    const map = new Map<string, UserRegistration>();
    userRegistrations.forEach(reg => {
      map.set(reg.eventId, reg);
    });
    return map;
  }, [userRegistrations]);

  // Filter events based on search and status
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || event.eventStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [events, searchTerm, statusFilter]);

  // Group events by status for better organization
  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: Event[] } = {
      scheduled: [],
      current: [],
      completed: [],
      cancelled: [],
    };

    filteredEvents.forEach(event => {
      groups[event.eventStatus].push(event);
    });

    // Sort events within each group by date
    Object.keys(groups).forEach(status => {
      groups[status].sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
    });

    return groups;
  }, [filteredEvents]);

  const totalEvents = events.length;
  const registeredCount = userRegistrations.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        {description && (
          <p className="text-gray-600 mb-4">{description}</p>
        )}
        <div className="flex justify-center gap-6 text-sm text-gray-500">
          <span>{totalEvents} event{totalEvents !== 1 ? 's' : ''} available</span>
          {showRegistration && (
            <span>{registeredCount} registration{registeredCount !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filter Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Events</option>
                <option value="scheduled">Scheduled</option>
                <option value="current">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="space-y-8">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search criteria"
                  : "No events have been scheduled for this competition yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Scheduled Events */}
            {groupedEvents.scheduled.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  Upcoming Events ({groupedEvents.scheduled.length})
                </h3>
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                  {groupedEvents.scheduled.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      userRegistration={registrationMap.get(event.id)}
                      onRegister={onRegister}
                      onCancel={onCancel}
                      isRegistering={isEventRegistering(event.id)}
                      isCancelling={isRegistrationCancelling(registrationMap.get(event.id)?.id || '')}
                      showRegistration={showRegistration}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Current Events */}
            {groupedEvents.current.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  In Progress ({groupedEvents.current.length})
                </h3>
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                  {groupedEvents.current.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      userRegistration={registrationMap.get(event.id)}
                      onRegister={onRegister}
                      onCancel={onCancel}
                      isRegistering={isEventRegistering(event.id)}
                      isCancelling={isRegistrationCancelling(registrationMap.get(event.id)?.id || '')}
                      showRegistration={showRegistration}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Events */}
            {groupedEvents.completed.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  Completed ({groupedEvents.completed.length})
                </h3>
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                  {groupedEvents.completed.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      userRegistration={registrationMap.get(event.id)}
                      onRegister={onRegister}
                      onCancel={onCancel}
                      isRegistering={isEventRegistering(event.id)}
                      isCancelling={isRegistrationCancelling(registrationMap.get(event.id)?.id || '')}
                      showRegistration={showRegistration}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Cancelled Events */}
            {groupedEvents.cancelled.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  Cancelled ({groupedEvents.cancelled.length})
                </h3>
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                  {groupedEvents.cancelled.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      userRegistration={registrationMap.get(event.id)}
                      onRegister={onRegister}
                      onCancel={onCancel}
                      isRegistering={isEventRegistering(event.id)}
                      isCancelling={isRegistrationCancelling(registrationMap.get(event.id)?.id || '')}
                      showRegistration={showRegistration}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}