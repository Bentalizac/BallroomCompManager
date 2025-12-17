"use client";

import { CompEvent } from "@ballroom/shared/data/types/event";
import {
  EventRegistrationParticipant,
  EventRegistrationApi,
} from "@ballroom/shared/dist";
import { EntryType } from "@ballroom/shared/dist/data/enums/eventTypes";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Users, UserPlus, X } from "lucide-react";
import { useState } from "react";

/**
 * Props for the EventRegistrationCard component.
 * @property {EntryType} entryType - The type of entry (solo, partner, team)
 * @property {CompEvent} event - The competition event details
 * @property {EventRegistrationParticipant[]} participants - List of participants in the registration
 * @property {EventRegistrationApi} registration - The registration entry details
 * @property {() => void} onAddParticipant - Callback when adding a participant
 * @property {(userId: string) => void} onRemoveParticipant - Callback when removing a participant
 * @property {() => void} onWithdraw - Callback when withdrawing from event
 */
interface EventRegistrationCardProps {
  entryType: EntryType;
  event: CompEvent;
  participants: EventRegistrationParticipant[];
  registration: EventRegistrationApi;
  onAddParticipant?: () => void;
  onRemoveParticipant?: (userId: string) => void;
  onWithdraw?: () => void;
}

const getRequiredParticipants = (entryType: EntryType): number => {
  switch (entryType) {
    case EntryType.Solo:
      return 1;
    case EntryType.Partner:
      return 2;
    case EntryType.Team:
      return 3; // or more, depending on your rules
    default:
      return 1;
  }
};

const getEntryTypeLabel = (entryType: EntryType): string => {
  switch (entryType) {
    case EntryType.Solo:
      return "Solo";
    case EntryType.Partner:
      return "Partner";
    case EntryType.Team:
      return "Team";
    default:
      return "Unknown";
  }
};

export function EventRegistrationCard(props: EventRegistrationCardProps) {
  const {
    entryType,
    event,
    participants,
    registration,
    onAddParticipant,
    onRemoveParticipant,
    onWithdraw,
  } = props;

  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);

  const requiredParticipants = getRequiredParticipants(entryType);
  const needsMoreParticipants = participants.length < requiredParticipants;

  return (
    <Card className="bg-white">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4 className="font-medium text-sm">{event.name}</h4>
            {registration.teamName && (
              <p className="text-xs text-gray-500 mt-1">
                Team: {registration.teamName}
              </p>
            )}
          </div>
          {onWithdraw && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onWithdraw}
              className="h-6 px-2 text-gray-500 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Entry Type Badge */}
        <div className="flex items-center gap-2 text-xs">
          <Users className="h-3 w-3 text-gray-400" />
          <span className="text-gray-600">
            {getEntryTypeLabel(entryType)} Entry
          </span>
          <span className="text-gray-400">•</span>
          <span
            className={`capitalize ${
              registration.status === "active"
                ? "text-green-600"
                : registration.status === "pending"
                  ? "text-yellow-600"
                  : "text-gray-500"
            }`}
          >
            {registration.status}
          </span>
        </div>

        {/* Participants List */}
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.userId}
              className="flex items-center justify-between text-xs bg-gray-50 rounded px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-500 capitalize">
                  {participant.role}:
                </span>
                <span className="font-medium">
                  {participant.userId.substring(0, 8)}...
                </span>
              </div>
              {onRemoveParticipant && participants.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveParticipant(participant.userId)}
                  className="h-5 px-1 text-gray-400 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Add Participant Button */}
        {needsMoreParticipants && onAddParticipant && (
          <Dialog open={isAddParticipantOpen} onOpenChange={setIsAddParticipantOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Add Participant ({participants.length}/{requiredParticipants})
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Participant</DialogTitle>
                <DialogDescription>
                  Add a participant to this {getEntryTypeLabel(entryType).toLowerCase()} registration for {event.name}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-gray-500">
                  TODO: Implement participant selection/search interface
                </p>
                {/* TODO: Add participant search/selection UI here */}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Warning if incomplete */}
        {needsMoreParticipants && (
          <p className="text-xs text-yellow-600">
            ⚠️ Add {requiredParticipants - participants.length} more participant
            {requiredParticipants - participants.length !== 1 ? "s" : ""} to
            complete this registration
          </p>
        )}
      </CardContent>
    </Card>
  );
}
