"use client";

import { useState, useEffect } from "react";
import { trpc } from "../../lib/trpc";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2 } from "lucide-react";

interface ProfileCompletionProps {
  onComplete?: () => void;
  missingFields?: string[];
  showCard?: boolean; // Whether to wrap in a Card component
}

export function ProfileCompletion({ onComplete, missingFields = [], showCard = true }: ProfileCompletionProps) {
  const [formData, setFormData] = useState({
    email: "",
    firstname: "",
    lastname: "",
  });
  const [error, setError] = useState<string | null>(null);

  const { data: currentProfile, isLoading: profileLoading } = trpc.user.getMyProfile.useQuery();
  
  const completeProfile = trpc.user.completeProfile.useMutation({
    onSuccess: () => {
      setError(null);
      if (onComplete) {
        onComplete();
      }
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  // Pre-populate form with existing data when profile loads
  useEffect(() => {
    if (currentProfile) {
      setFormData({
        email: currentProfile.email || "",
        firstname: currentProfile.firstname || "",
        lastname: currentProfile.lastname || "",
      });
    }
  }, [currentProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!formData.firstname.trim()) {
      setError("First name is required");
      return;
    }
    if (!formData.lastname.trim()) {
      setError("Last name is required");
      return;
    }

    try {
      await completeProfile.mutateAsync({
        email: formData.email.trim(),
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
      });
    } catch {
      // Error handling is done in onError callback
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const isFieldRequired = (field: string) => missingFields.includes(field);

  if (profileLoading) {
    const loadingContent = (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
    
    if (!showCard) return loadingContent;
    
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>{loadingContent}</CardHeader>
      </Card>
    );
  }

  const form = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">
          Email {isFieldRequired("email") && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange("email")}
          placeholder="your.email@example.com"
          required
          className={isFieldRequired("email") ? "border-red-300 focus:border-red-500" : ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="firstname">
          First Name {isFieldRequired("firstname") && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id="firstname"
          type="text"
          value={formData.firstname}
          onChange={handleInputChange("firstname")}
          placeholder="John"
          required
          className={isFieldRequired("firstname") ? "border-red-300 focus:border-red-500" : ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastname">
          Last Name {isFieldRequired("lastname") && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id="lastname"
          type="text"
          value={formData.lastname}
          onChange={handleInputChange("lastname")}
          placeholder="Doe"
          required
          className={isFieldRequired("lastname") ? "border-red-300 focus:border-red-500" : ""}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={completeProfile.isPending}
      >
        {completeProfile.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating Profile...
          </>
        ) : (
          "Complete Profile"
        )}
      </Button>
    </form>
  );

  if (!showCard) {
    return form;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Please complete your profile information to register for events.
          {missingFields.length > 0 && (
            <span className="block mt-1 text-orange-600">
              Missing: {missingFields.join(", ")}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {form}
      </CardContent>
    </Card>
  );
}