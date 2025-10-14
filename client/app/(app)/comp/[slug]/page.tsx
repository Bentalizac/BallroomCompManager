"use client";

import { Hero } from "@/components/custom/hero";
import { useComp } from "@/providers/compProvider/compProvider";
import { useCompetitionDisplay } from "@/hooks/useCompetitions";

export default function CompetitionHomePage() {
  const { competition } = useComp();
  const displayData = useCompetitionDisplay(competition!);

  // Format the date range for display
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate + 'T00:00:00.000Z');
    const end = new Date(endDate + 'T00:00:00.000Z');
    
    const startFormatted = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    const endFormatted = end.toLocaleDateString('en-US', {
      month: 'short', 
      day: 'numeric'
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  const dateRange = competition ? formatDateRange(competition.startDate, competition.endDate) : "";
  
  return (
    <>
      <main>
        <Hero 
          title={competition?.name || "Competition"} 
          date={dateRange}
          imageUrl="/pexels-prime-cinematics-1005175-2057274.jpg" 
        />

        <div className="flex flex-col">
          {/* Competition Overview */}
          <div className="bg-accent px-20 py-13">
            <h1 className="text-4xl font-bold mb-2 text-accent-foreground">Competition Overview</h1>
            <div className="text-accent-foreground space-y-4">
              <p className="text-lg">
                Welcome to <strong>{competition?.name}</strong>!
              </p>
              
              {displayData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div className="bg-accent-foreground/10 p-4 rounded-lg">
                    <h3 className="font-semibold mb-1">Status</h3>
                    <p className="text-sm">
                      {displayData.isUpcoming ? "Upcoming" : 
                       displayData.isOngoing ? "Live Now" : 
                       displayData.isPast ? "Completed" : "Scheduled"}
                    </p>
                  </div>
                  
                  <div className="bg-accent-foreground/10 p-4 rounded-lg">
                    <h3 className="font-semibold mb-1">Events</h3>
                    <p className="text-sm">{displayData.eventCount} events</p>
                  </div>
                  
                  {competition?.venue && (
                    <div className="bg-accent-foreground/10 p-4 rounded-lg">
                      <h3 className="font-semibold mb-1">Venue</h3>
                      <p className="text-sm">{competition.venue.name}</p>
                      {competition.venue.city && competition.venue.state && (
                        <p className="text-xs opacity-75">
                          {competition.venue.city}, {competition.venue.state}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {displayData.isUpcoming && displayData.daysUntilStart > 0 && (
                    <div className="bg-accent-foreground/10 p-4 rounded-lg">
                      <h3 className="font-semibold mb-1">Countdown</h3>
                      <p className="text-sm">
                        {displayData.daysUntilStart} day{displayData.daysUntilStart !== 1 ? 's' : ''} to go
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Events Section */}
          <div className="bg-secondary px-20 py-13">
            <h1 className="text-4xl font-bold mb-2 text-secondary-foreground">Events</h1>
            <div className="text-secondary-foreground">
              {competition?.events && competition.events.length > 0 ? (
                <div className="grid gap-4">
                  {competition.events.map((event) => (
                    <div key={event.id} className="bg-secondary-foreground/10 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">{event.name}</h3>
                      <div className="text-sm opacity-75">
                        <p>Status: {event.eventStatus}</p>
                        {/* Add more event details as needed */}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No events scheduled yet. Check back later for updates!</p>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 {competition?.name || "Competition"}. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
