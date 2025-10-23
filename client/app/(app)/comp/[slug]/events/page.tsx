"use client";

import { trpc } from "@/lib/trpc";
import { useComp } from "@/providers/compProvider/compProvider";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Edit2, 
  Trash2,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface EventData {
  id: string;
  name: string;
  startAt: string; // ISO 8601 UTC timestamp
  endAt: string;   // ISO 8601 UTC timestamp
  eventStatus: 'scheduled' | 'current' | 'completed' | 'cancelled';
}

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  current: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-gray-100 text-gray-800 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
} as const;

const statusLabels = {
  scheduled: "Scheduled",
  current: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
} as const;

export default function EventsPage() {
  const { competition } = useComp();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: events, isLoading, error, refetch } = trpc.competition.getEvents.useQuery(
    { competitionId: competition?.id || "" },
    { enabled: !!competition?.id }
  );

  const deleteEventMutation = trpc.event.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      try {
        await deleteEventMutation.mutateAsync({ id: eventId });
      } catch (error) {
        console.error("Failed to delete event:", error);
        alert("Failed to delete event. Please try again.");
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading events...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Error Loading Events</h2>
            <p className="text-gray-600">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typedEvents = (events || []) as EventData[];

  // Filter events based on search term and status
  const filteredEvents = typedEvents.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.eventStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get stats
  const totalEvents = typedEvents.length;
  const scheduledEvents = typedEvents.filter(e => e.eventStatus === 'scheduled').length;
  const currentEvents = typedEvents.filter(e => e.eventStatus === 'current').length;
  const completedEvents = typedEvents.filter(e => e.eventStatus === 'completed').length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-600 mt-1">
            Manage events for {competition?.name}
          </p>
        </div>
        <Link href={`/comp/${competition?.slug}/events/create`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{totalEvents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Scheduled</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-600">{scheduledEvents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-600">{currentEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-600">{completedEvents}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
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
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
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
      <Card>
        <CardHeader>
          <CardTitle>
            Events ({filteredEvents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search criteria"
                  : "Create your first event to get started"}
              </p>
              {(!searchTerm && statusFilter === "all") && (
                <Link href={`/comp/${competition?.slug}/events/create`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Event
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {event.name}
                          </h4>
                          <Badge className={statusColors[event.eventStatus]}>
                            {statusLabels[event.eventStatus]}
                          </Badge>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit Event
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="h-4 w-4 mr-2" />
                              View Registrations
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Event
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(event.startAt)} - {formatDate(event.endAt)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatTime(event.startAt)} - {formatTime(event.endAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}