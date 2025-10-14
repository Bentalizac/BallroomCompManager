"use client";

import { trpc } from "@/lib/trpc";
import { useComp } from "@/providers/compProvider/compProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Calendar, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

interface EventFormData {
  name: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  categoryId: string;
  rulesetId: string;
  useCustomSchedule: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Ruleset {
  id: string;
  name: string;
  description?: string;
}

export default function CreateEventPage() {
  const { competition } = useComp();
  const router = useRouter();
  
  // Format dates for input fields (YYYY-MM-DD)
  const formatDateForInput = (date: Date | string | undefined | null): string => {
    if (!date) return "";
    
    try {
      // If it's already a string in YYYY-MM-DD format, return as is
      if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
      
      // Convert to Date object and format
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return "";
      }
      
      return dateObj.toISOString().split('T')[0];
    } catch (error) {
      console.warn("Error formatting date:", error);
      return "";
    }
  };
  
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    startDate: formatDateForInput(competition?.startDate), // Default to competition start date
    startTime: "09:00", // Default start time
    endDate: formatDateForInput(competition?.endDate), // Default to competition end date
    endTime: "17:00", // Default end time
    categoryId: "",
    rulesetId: "",
    useCustomSchedule: false,
  });
  
  const [errors, setErrors] = useState<Partial<EventFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load categories and rulesets
  const { data: categories, isLoading: categoriesLoading } = trpc.data.getEventCategories.useQuery();
  const { data: rulesets, isLoading: rulesetsLoading } = trpc.data.getRulesets.useQuery();
  
  const createEventMutation = trpc.event.create.useMutation({
    onSuccess: () => {
      router.push(`/comp/${competition?.slug}/events`);
    },
    onError: (error) => {
      console.error("Failed to create event:", error);
      alert(`Failed to create event: ${error.message}`);
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<EventFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Event name is required";
    }
    
    // Only validate dates and times if using custom schedule
    if (formData.useCustomSchedule) {
      if (!formData.startDate) {
        newErrors.startDate = "Start date is required when using custom schedule";
      }
      
      if (!formData.endDate) {
        newErrors.endDate = "End date is required when using custom schedule";
      }
      
      if (!formData.startTime) {
        newErrors.startTime = "Start time is required when using custom schedule";
      }
      
      if (!formData.endTime) {
        newErrors.endTime = "End time is required when using custom schedule";
      }
      
      // Validate date/time logic only when using custom schedule
      if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
        const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
        
        if (startDateTime >= endDateTime) {
          newErrors.endDate = "End date/time must be after start date/time";
          newErrors.endTime = "End date/time must be after start date/time";
        }
      }
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = "Event category is required";
    }
    
    if (!formData.rulesetId) {
      newErrors.rulesetId = "Ruleset is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !competition) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create ISO datetime strings - use competition dates/times if not using custom schedule
      let startAt: string;
      let endAt: string;
      
      if (formData.useCustomSchedule) {
        // Use the specific dates and times entered by the user
        const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
        
        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
          throw new Error("Invalid date or time values");
        }
        
        startAt = startDateTime.toISOString();
        endAt = endDateTime.toISOString();
      } else {
        // Use competition dates with default times (will be overridden by scheduling system)
        const compStartDate = formatDateForInput(competition?.startDate) || new Date().toISOString().split('T')[0];
        const compEndDate = formatDateForInput(competition?.endDate) || new Date().toISOString().split('T')[0];
        
        const startDateTime = new Date(`${compStartDate}T${formData.startTime}`);
        const endDateTime = new Date(`${compEndDate}T${formData.endTime}`);
        
        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
          throw new Error("Invalid competition dates");
        }
        
        startAt = startDateTime.toISOString();
        endAt = endDateTime.toISOString();
      }
      
      await createEventMutation.mutateAsync({
        competitionId: competition.id,
        name: formData.name.trim(),
        startAt,
        endAt,
        categoryId: formData.categoryId,
        rulesetId: formData.rulesetId,
      });
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof EventFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const isLoading = categoriesLoading || rulesetsLoading;

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading form data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/comp/${competition?.slug}/events`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600 mt-1">
            Add a new event to {competition?.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Event Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange("name")}
                placeholder="e.g., Amateur Standard"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Custom Schedule Toggle */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  id="useCustomSchedule"
                  type="checkbox"
                  checked={formData.useCustomSchedule}
                  onChange={(e) => setFormData(prev => ({ ...prev, useCustomSchedule: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="useCustomSchedule" className="text-sm font-medium">
                  Set custom schedule (optional)
                </Label>
              </div>
              <p className="text-sm text-gray-600">
                {formData.useCustomSchedule 
                  ? "Specify exact dates and times for this event" 
                  : "Schedule will be determined by the competition organizers"}
              </p>
            </div>

            {/* Date and Time Fields - Only show when custom schedule is enabled */}
            {formData.useCustomSchedule && (
              <div className="space-y-6">
                {/* Date Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleInputChange("startDate")}
                      className={errors.startDate ? "border-red-500" : ""}
                    />
                    {errors.startDate && (
                      <p className="text-sm text-red-600">{errors.startDate}</p>
                    )}
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleInputChange("endDate")}
                      className={errors.endDate ? "border-red-500" : ""}
                    />
                    {errors.endDate && (
                      <p className="text-sm text-red-600">{errors.endDate}</p>
                    )}
                  </div>
                </div>

                {/* Time Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Time */}
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={handleInputChange("startTime")}
                      className={errors.startTime ? "border-red-500" : ""}
                    />
                    {errors.startTime && (
                      <p className="text-sm text-red-600">{errors.startTime}</p>
                    )}
                  </div>

                  {/* End Time */}
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={handleInputChange("endTime")}
                      className={errors.endTime ? "border-red-500" : ""}
                    />
                    {errors.endTime && (
                      <p className="text-sm text-red-600">{errors.endTime}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Category and Ruleset */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="categoryId">Event Category *</Label>
                <select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange("categoryId")}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.categoryId ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select a category</option>
                  {(categories as Category[])?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-sm text-red-600">{errors.categoryId}</p>
                )}
              </div>

              {/* Ruleset */}
              <div className="space-y-2">
                <Label htmlFor="rulesetId">Ruleset *</Label>
                <select
                  id="rulesetId"
                  value={formData.rulesetId}
                  onChange={handleInputChange("rulesetId")}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.rulesetId ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select a ruleset</option>
                  {(rulesets as Ruleset[])?.map((ruleset) => (
                    <option key={ruleset.id} value={ruleset.id}>
                      {ruleset.name}
                    </option>
                  ))}
                </select>
                {errors.rulesetId && (
                  <p className="text-sm text-red-600">{errors.rulesetId}</p>
                )}
              </div>
            </div>

            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Once created, participants will be able to register for this event. 
                {!formData.useCustomSchedule 
                  ? "Event schedule will be determined by the competition organizers." 
                  : "A custom schedule has been set for this event."} 
                You can modify these details later if needed.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Create Event
                  </>
                )}
              </Button>
              
              <Link href={`/comp/${competition?.slug}/events`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}