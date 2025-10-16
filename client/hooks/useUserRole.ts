import { trpc } from "@/lib/trpc";
import { useAuth } from "@/providers/auth/authProvider";

export function useUserRole(competitionId?: string) {
  const { user } = useAuth();

  const { data: roleData, isLoading } = trpc.user.getUserRoleInCompetition.useQuery(
    { competitionId: competitionId! },
    { 
      enabled: !!user && !!competitionId,
      // Refetch when user or competition changes
      refetchOnMount: true,
      // Cache for 5 minutes since roles don't change frequently
      staleTime: 5 * 60 * 1000,
    }
  );

  return {
    role: roleData?.role || null,
    isAdmin: roleData?.isAdmin || false,
    isOrganizer: roleData?.isOrganizer || false, // Use API-provided isOrganizer field
    isJudge: roleData?.role === "judge", 
    isCompetitor: roleData?.role === "competitor",
    participantRoles: roleData?.participantRoles || [],
    hasAccess: roleData?.hasAccess || false,
    isLoading: isLoading && !!user && !!competitionId,
  };
}