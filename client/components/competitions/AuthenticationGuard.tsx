'use client';

import { useRouter } from 'next/navigation';

interface AuthenticationGuardProps {
  title?: string;
  message?: string;
  redirectPath?: string;
}

export function AuthenticationGuard({ 
  title = "Authentication Required",
  message = "You need to be logged in to access this feature.",
  redirectPath = "/auth"
}: AuthenticationGuardProps) {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={() => router.push(redirectPath)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}