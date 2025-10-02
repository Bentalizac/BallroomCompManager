'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/auth/authProvider';

export function CreateCompetitionButton() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return null; // Don't show anything while loading
  }

  if (!user) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-600 mb-4">Sign in to create and manage competitions</p>
        <Link
          href="/auth"
          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <Link
        href="/comp/create"
        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Create New Competition
      </Link>
      <p className="text-gray-600 text-sm mt-2">
        Set up a new ballroom dance competition
      </p>
    </div>
  );
}