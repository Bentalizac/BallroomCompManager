"use client";

import { trpc } from "@/lib/trpc";
import { useComp } from "@/providers/compProvider/compProvider";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Mail, User, Calendar, Filter } from "lucide-react";

interface RegistrantData {
  id: string;
  role: 'competitor' | 'judge' | 'scrutineer';
  registration_status: 'pending' | 'confirmed' | 'cancelled';
  event_info?: {
    id: string;
    name: string;
    comp_id: string;
  } | null;
  comp_participant?: {
    id: string;
    user_info?: {
      id: string;
      firstname: string;
      lastname: string;
      email: string;
    } | null;
  } | null;
}

const roleColors = {
  competitor: "bg-blue-100 text-blue-800 border-blue-200",
  judge: "bg-purple-100 text-purple-800 border-purple-200",
  scrutineer: "bg-green-100 text-green-800 border-green-200",
} as const;

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
} as const;

export default function RegistrantsPage() {
  const { competition } = useComp();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: registrations, isLoading, error } = trpc.competition.getEventRegistrations.useQuery(
    { competitionId: competition?.id || "" },
    { enabled: !!competition?.id }
  );

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading registrants...</span>
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
            <h2 className="text-xl font-semibold mb-2">Error Loading Registrants</h2>
            <p className="text-gray-600">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typedRegistrations = (registrations || []) as RegistrantData[];

  // Filter registrations based on search term and filters
  const filteredRegistrations = typedRegistrations.filter((registration) => {
    const user = registration.comp_participant?.user_info;
    const name = user ? `${user.firstname} ${user.lastname}`.toLowerCase() : "";
    const email = user?.email?.toLowerCase() || "";
    
    const matchesSearch = 
      name.includes(searchTerm.toLowerCase()) || 
      email.includes(searchTerm.toLowerCase()) ||
      registration.event_info?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;

    const matchesRole = roleFilter === "all" || registration.role === roleFilter;
    const matchesStatus = statusFilter === "all" || registration.registration_status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get stats
  const totalRegistrants = typedRegistrations.length;
  const confirmedRegistrants = typedRegistrations.filter(r => r.registration_status === 'confirmed').length;
  const pendingRegistrants = typedRegistrations.filter(r => r.registration_status === 'pending').length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Competition Registrants</h1>
          <p className="text-gray-600 mt-1">
            Manage registrations for {competition?.name}
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Registrants</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{totalRegistrants}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Confirmed</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-600">{confirmedRegistrants}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-yellow-600">{pendingRegistrants}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Registrants
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or event..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="competitor">Competitors</option>
                <option value="judge">Judges</option>
                <option value="scrutineer">Scrutineers</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registrants List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Registrants ({filteredRegistrations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No registrants found</h3>
              <p className="text-gray-600">
                {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search criteria"
                  : "No one has registered for this competition yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRegistrations.map((registration) => {
                const user = registration.comp_participant?.user_info;
                const event = registration.event_info;
                
                return (
                  <div
                    key={registration.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {user ? `${user.firstname} ${user.lastname}` : "Unknown User"}
                            </h4>
                            <p className="text-sm text-gray-600">{user?.email}</p>
                          </div>
                        </div>
                        
                        {event && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Event: {event.name}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <Badge className={roleColors[registration.role]}>
                          {registration.role}
                        </Badge>
                        <Badge className={statusColors[registration.registration_status]}>
                          {registration.registration_status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}