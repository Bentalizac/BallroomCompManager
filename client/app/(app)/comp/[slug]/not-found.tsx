"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="text-gray-400 text-8xl mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Competition Not Found</h1>
        <p className="text-gray-600 mb-6">
          The competition you&apos;re looking for could not be found. It may have been moved or deleted.
        </p>
        <div className="space-y-3">
          <button 
            onClick={() => window.history.back()}
            className="block w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Go Back
          </button>
          <Link
            href="/comp"
            className="block w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
          >
            Browse All Competitions
          </Link>
        </div>
      </div>
    </div>
  );
}
