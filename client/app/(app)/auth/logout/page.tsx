"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth/authProvider";

export default function LogoutPage() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleLogout = async () => {
      if (!user) {
        // User is already logged out, redirect to login
        router.push('/auth');
        return;
      }

      setError(null);

      try {
        await signOut();
        // Redirect to login page after successful logout
        router.push('/auth');
      } catch {
        setError('Failed to log out. Please try again.');
      }
    };

    handleLogout();
  }, [signOut, user, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Logout Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Logging out...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Please wait while we sign you out.</p>
        </div>
      </div>
    </div>
  );
}
