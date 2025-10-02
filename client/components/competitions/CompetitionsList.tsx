'use client';

import { useCompetitions } from '@/hooks/useCompetitions';
import { CompetitionCard } from './CompetitionCard';

export function CompetitionsList() {
  const { data: competitions, isLoading, error } = useCompetitions();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">Loading competitions...</div>
        {/* Loading skeletons */}
        {[1, 2, 3].map(i => (
          <div key={i} className="border rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <p className="text-red-600 mb-4">Error loading competitions: {error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!competitions || competitions.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-600 mb-4">No competitions found.</p>
        <p className="text-sm text-gray-500">Check back later for upcoming competitions!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Available Competitions</h2>
        <p className="text-gray-600 mt-2">
          {competitions.length} competition{competitions.length !== 1 ? 's' : ''} available
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {competitions.map(competition => (
          <CompetitionCard 
            key={competition.id} 
            competitionId={competition.id}
          />
        ))}
      </div>
    </div>
  );
}