"use client";

import { ProfileCard } from "@/components/user/profileCard";
import { useAuth } from "@/providers/auth/authProvider";

export default function Profile() {
  const authUser = useAuth().user;
  if (!authUser) {
    return (
      <div className="text-center mt-20 text-gray-600">
        <p className="text-lg">You must be logged in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="text-gray-600">
      <ProfileCard className="max-w-md mx-auto mt-10" />
    </div>
  );
}
