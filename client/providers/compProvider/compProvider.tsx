"use client";

import React, { createContext, useContext } from "react";
import { useCompetitionBySlug } from "@/hooks/useCompetitions";
import { Competition } from "@ballroom/shared/dist";

type CompProviderContextType = {
  competition: Competition | null;
  isLoading: boolean;
  slug: string;
};

const CompContext = createContext<CompProviderContextType | null>(null);

type CompProviderProps = {
  slug: string;
  children: React.ReactNode;
};

export const CompProvider: React.FC<CompProviderProps> = ({
  slug,
  children,
}) => {
  const { data: rawCompetition, isLoading, error } = useCompetitionBySlug(slug);
  const competition = {
    ...rawCompetition,
    startDate: rawCompetition?.startDate ? new Date(rawCompetition.startDate) : undefined,
    endDate: rawCompetition?.endDate ? new Date(rawCompetition.endDate) : undefined,
  } as Competition | undefined;
  const contextValue: CompProviderContextType = {
    competition: competition || null,
    isLoading,
    slug,
  };

  return (
    <CompContext.Provider value={contextValue}>{children}</CompContext.Provider>
  );
};

// Custom hook to use the competition context
export const useComp = () => {
  const context = useContext(CompContext);

  if (!context) {
    throw new Error("useComp must be used within a CompProvider");
  }

  return context;
};

// Hook for components that need just the competition data (with loading/error handling)
export const useCompetition = () => {
  const { competition, isLoading } = useComp();

  return {
    competition,
    isLoading,
  };
};

// Hook for components that just need the slug
export const useCompSlug = () => {
  const { slug } = useComp();
  return slug;
};

// Hook for backward compatibility with the old IdProvider usage
export const useCompId = () => {
  const { slug } = useComp();
  return slug; // Return slug as the "id" for backward compatibility
};
