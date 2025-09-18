"use client";
import React from "react";
import { Button } from "@/components/ui/button";

export default function Results() {
    // Configurable live feed variables
    const EVENTS_PER_FEED = 2; // Change to 2 or 3 as desired
    const FEED_INTERVAL_MS = 20000; // 20 seconds

    // Live state
    const [isLive, setIsLive] = React.useState(false);
    const [feedIndex, setFeedIndex] = React.useState(0);
    // Helper to generate random competitors
    function generateCompetitors(startNum: number, count: number) {
        return Array.from({ length: count }, (_, i) => ({
            number: startNum + i,
            checked: Math.random() > 0.5,
        }));
    }

    // Generate more fake events and competitors
    const eventNames = [
        "Waltz", "Tango", "Foxtrot", "Quickstep", "Viennese Waltz", "Cha Cha", "Rumba", "Samba", "Jive", "Paso Doble", "Bolero", "Mambo", "Peabody", "Polka", "Merengue", "Hustle", "Swing", "Salsa", "Bachata", "Argentine Tango"
    ];
    const fakeEvents = Array.from({ length: 20 }, (_, i) => {
        const name = eventNames[i % eventNames.length];
        const heat = i + 1;
        const time = `${8 + (i % 10)}:00 ${i % 2 === 0 ? "AM" : "PM"}`;
        const date = i % 2 === 0 ? "10/9" : "10/10";
        const competitors = generateCompetitors(100 + i * 50, 8 + (i % 23)); // 8-30 competitors
        return { name, heat, time, date, competitors };
    });

    const fakeDates = ["10/9", "10/10"];
    const [dateIndex, setDateIndex] = React.useState(0);
    const currentDate = fakeDates[dateIndex];
    const filteredEvents = fakeEvents.filter((event) => event.date === currentDate);

    // Live feed cycling effect
    React.useEffect(() => {
        if (!isLive || filteredEvents.length === 0) return;
        const interval = setInterval(() => {
            setFeedIndex((prev) => (prev + 1) % filteredEvents.length);
        }, FEED_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [isLive, filteredEvents.length]);

    // Get events to show in live mode
    const liveEvents = isLive
        ? Array.from({ length: EVENTS_PER_FEED }, (_, i) => {
            if (filteredEvents.length === 0) return null;
            // Reverse order: newest event at the bottom
            const idx = (feedIndex + EVENTS_PER_FEED - 1 - i + filteredEvents.length) % filteredEvents.length;
            return filteredEvents[idx];
        }).filter(Boolean)
        : filteredEvents;

    const handlePrev = () => {
        if (dateIndex > 0) setDateIndex(dateIndex - 1);
    };
    const handleNext = () => {
        if (dateIndex < fakeDates.length - 1) setDateIndex(dateIndex + 1);
    };

    return (
        <main className="p-8">
            <div className="flex justify-between items-center py-2 px-2">
                <span className="text-2xl font-bold">Results</span>
                <span className="flex items-center gap-2">
                    <Button onClick={handlePrev} disabled={dateIndex === 0} variant={dateIndex === 0 ? "secondary" : "default"}>&lt;</Button>
                    <span className="text-xl">{currentDate}</span>
                    <Button onClick={handleNext} disabled={dateIndex === fakeDates.length - 1} variant={dateIndex === fakeDates.length - 1 ? "secondary" : "default"}>&gt;</Button>
                </span>
                <span className="ml-6 flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="live-feed"
                        checked={isLive}
                        onChange={e => {
                            setIsLive(e.target.checked);
                            setFeedIndex(0);
                        }}
                        className="accent-blue-600 w-5 h-5"
                    />
                    <label htmlFor="live-feed" className="text-lg">Live</label>
                </span>
            </div>
            <div className="space-y-6 mt-4 transition-all duration-700" key={isLive ? feedIndex : undefined}>
                {liveEvents.filter(Boolean).map((event, idx) => (
                    <div key={event.heat + '-' + event.name} className="border rounded-lg p-4 shadow animate-slidein">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <span className="font-semibold text-lg">{event.name}</span>
                                <span className="ml-4 text-sm text-gray-500">Heat {event.heat}</span>
                            </div>
                            <span className="text-sm">{event.time}</span>
                        </div>
                        <div className="grid grid-cols-8 gap-4">
                            {event.competitors.map((comp, cidx) => (
                                <div key={cidx} className="flex items-center justify-center gap-2">
                                    <span className="font-mono text-lg">{comp.number}</span>
                                    <input
                                        type="checkbox"
                                        checked={comp.checked}
                                        readOnly
                                        className="accent-green-600 w-5 h-5"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <style jsx>{`
                @keyframes slidein {
                    from { opacity: 0; transform: translateY(-30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slidein {
                    animation: slidein 0.7s;
                }
            `}</style>
        </main>
    );
}