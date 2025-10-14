"use client";

import React from "react";
import { useCompetitionBySlug } from "@/hooks/useCompetitions";
import { notFound } from "next/navigation";

interface CompetitionLayoutProps {
  slug: string;
  children: React.ReactNode;
}

export function CompetitionLayout({ slug, children }: CompetitionLayoutProps) {
  const { data: competition, isLoading, error } = useCompetitionBySlug(slug);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading competition...</p>
        </div>
      </div>
    );
  }

  // Handle API error
  if (error) {
    console.error("Error loading competition:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Competition</h1>
          <p className="text-gray-600 mb-6">
            There was an error loading the competition data. Please try again later.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Handle competition not found (404)
  if (!competition) {
    notFound();
  }

  // Competition found - render children
  return <>{children}</>;
}

export default CompetitionLayout;