import { trpc } from "@/lib/trpc";

export function useCompetitionBySlug(slug?: string) {
  const { data: competition, isLoading, error } = trpc.competition.getBySlug.useQuery(
    { slug: slug! },
    { 
      enabled: !!slug,
      // Cache competition data for 10 minutes
      staleTime: 10 * 60 * 1000,
    }
  );

  return {
    competition,
    competitionId: competition?.id,
    isLoading: isLoading && !!slug,
    error,
  };
}