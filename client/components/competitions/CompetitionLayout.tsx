"use client";

import React from "react";
import { CompProvider, useComp } from "@/providers/compProvider/compProvider";
import { notFound } from "next/navigation";

interface CompetitionLayoutProps {
  slug: string;
  children: React.ReactNode;
}

// Inner component that handles the loading/error states
function CompetitionLayoutInner({ children }: { children: React.ReactNode }) {
  const { competition, isLoading } = useComp();

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

  // Handle competition not found (404)
  if (!competition) {
    notFound();
  }

// Competition found - render children
  return <>{children}</>;
}

// Main wrapper that provides the context
export function CompetitionLayout({ slug, children }: CompetitionLayoutProps) {
  return (
    <CompProvider slug={slug}>
      <CompetitionLayoutInner>
        {children}
      </CompetitionLayoutInner>
    </CompProvider>
  );
}

export default CompetitionLayout;