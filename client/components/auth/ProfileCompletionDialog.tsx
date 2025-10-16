"use client";

import { ProfileCompletion } from "./ProfileCompletion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

interface ProfileCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missingFields?: string[];
  onComplete?: () => void;
}

export function ProfileCompletionDialog({
  open,
  onOpenChange,
  missingFields = [],
  onComplete
}: ProfileCompletionDialogProps) {
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Please complete your profile information before registering for events.
          </DialogDescription>
        </DialogHeader>
        
        {/* Remove the card wrapper since dialog already provides container */}
        <div className="pt-4">
          <ProfileCompletion
            onComplete={handleComplete}
            missingFields={missingFields}
            showCard={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}