"use client";

import { useComp } from "@/providers/compProvider/compProvider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CreateEventForm } from "@/components/competitions/CreateEventForm";

export default function CreateEventPage() {
  const { competition } = useComp();
  const router = useRouter();
  
  if (!competition) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <span className="text-gray-600">Loading competition...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/comp/${competition.slug}/events`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>

      {/* Form */}
      <CreateEventForm
        competitionId={competition.id}
        competitionName={competition.name}
        competitionStartDate={competition.startDate}
        competitionEndDate={competition.endDate}
        competitionTimeZone={competition.venue?.timeZone || "America/Los_Angeles"}
        onSuccess={(eventId) => {
          router.push(`/comp/${competition.slug}/events`);
        }}
        onCancel={() => {
          router.push(`/comp/${competition.slug}/events`);
        }}
      />
    </div>
  );
}