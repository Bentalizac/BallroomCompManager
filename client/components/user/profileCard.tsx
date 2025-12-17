"use client";

import { useUser } from "@/providers/user/userProvider";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProfileCardProps {
  className?: string;
}

export function ProfileCard({ className }: ProfileCardProps) {
  const { user, loading, profileLoading } = useUser();

  // Determine loading state
  const isLoading = loading || profileLoading;

  // Loading state
  const loadingContent = (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  );

  // Error state
  const errorContent = (
    <div className="text-red-600">
      <p className="font-medium">Unable to load profile</p>
      <p className="text-sm text-red-500 mt-1">
        {Error?.name || "Please try refreshing the page"}
      </p>
    </div>
  );

  // Profile incomplete state - missing names
  const incompleteProfileContent = (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Complete Your Profile
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Please add your name to complete your profile setup.
        </p>
        {user?.createdAt && (
          <p className="text-xs text-gray-500 mb-4">
            Registered:{" "}
            {new Date(user.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
      </div>

      <Link href="/profile/setup">
        <Button className="w-full" variant="default">
          Finish Profile Setup
        </Button>
      </Link>
    </div>
  );

  // Complete profile content
  const completeProfileContent = (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          {user?.displayName ||
            `${user?.firstname || ""} ${user?.lastname || ""}`}
        </h3>
        {user?.email && (
          <p className="text-sm text-gray-600 mt-1">{user.email}</p>
        )}
      </div>

      {user?.createdAt && (
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Member since{" "}
            {new Date(user.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      )}
    </div>
  );
  // Determine what content to show
  const getCardContent = () => {
    if (isLoading) return loadingContent;
    if (!user) return errorContent;

    // Use the ExtendedUser's isProfileComplete property
    return !user.isProfileComplete
      ? incompleteProfileContent
      : completeProfileContent;
  };

  const cardTitle = (() => {
    if (isLoading) return "Loading Profile...";
    if (!user) return "Profile";

    return !user.isProfileComplete ? "Welcome!" : "Your Profile";
  })();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
      </CardHeader>
      <CardContent>{getCardContent()}</CardContent>
    </Card>
  );
}
