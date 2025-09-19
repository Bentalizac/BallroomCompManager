'use client';

import { useAuth } from '@/providers/auth/authProvider';

export function AuthExample() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <div className="p-4">Loading auth state...</div>;
  }

  if (user) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Welcome!</h3>
        <p className="text-gray-600 mb-4">
          Logged in as: {user.email}
        </p>
        <button
          onClick={signOut}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Not Authenticated</h3>
      <p className="text-gray-600">Please log in to continue.</p>
    </div>
  );
}