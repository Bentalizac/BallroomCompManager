import { trpc } from '@/lib/trpc';

// Hook to get all venues
export function useVenues() {
  const result = trpc.data.getVenues.useQuery(undefined, {
    staleTime: 1000 * 60 * 30, // 30 minutes - venues don't change often
  });
  
  console.log('🏢 useVenues result:', result);
  return result;
}

// Hook to get all event categories
export function useEventCategories() {
  return trpc.data.getEventCategories.useQuery(undefined, {
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Hook to get all rulesets with scoring methods
export function useRulesets() {
  return trpc.data.getRulesets.useQuery(undefined, {
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Hook to get all scoring methods
export function useScoringMethods() {
  return trpc.data.getScoringMethods.useQuery(undefined, {
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Hook to create a new venue
export function useCreateVenue() {
  const utils = trpc.useContext();
  
  return trpc.data.createVenue.useMutation({
    onSuccess: () => {
      // Invalidate venues list to show new venue
      utils.data.getVenues.invalidate();
    },
    onError: (error) => {
      console.error('Failed to create venue:', error.message);
    }
  });
}