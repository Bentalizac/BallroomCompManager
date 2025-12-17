"use client";
import React from "react";

export default function ManageDashboard() {
    // Fake data for mockup
    const compInfo = {
        name: "Ballroom Spring Classic",
        date: "April 12-13, 2026",
        location: "Grand Ballroom, City Center",
        status: "Live",
    };
    const stats = {
        competitors: 120,
        judges: 8,
        heats: 45,
        events: 12,
    };
    const announcements = [
        "Welcome to the Ballroom Spring Classic!",
        "Lunch break at 1:00 PM in the main hall.",
        "Finals start at 5:00 PM.",
    ];
    const schedule = [
        { time: "9:00 AM", event: "Opening Ceremony" },
        { time: "9:30 AM", event: "Amateur Latin - Heat 1" },
        { time: "10:00 AM", event: "Pro Standard - Heat 2" },
        { time: "11:00 AM", event: "Junior Latin - Heat 3" },
    ];

    return (
        <main className="min-h-screen bg-gray-50 p-8 flex flex-col gap-8">
            {/* Competition Info & Stats */}
            <section className="flex flex-wrap gap-8 items-center justify-between bg-white rounded-lg shadow p-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{compInfo.name}</h1>
                    <div className="text-lg text-gray-600">{compInfo.date} | {compInfo.location}</div>
                    <span className={`inline-block mt-2 px-3 py-1 rounded text-white text-sm ${compInfo.status === "Live" ? "bg-green-500" : "bg-gray-400"}`}>{compInfo.status}</span>
                </div>
                <div className="flex gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold">{stats.competitors}</div>
                        <div className="text-gray-500">Competitors</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{stats.judges}</div>
                        <div className="text-gray-500">Judges</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{stats.heats}</div>
                        <div className="text-gray-500">Heats</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{stats.events}</div>
                        <div className="text-gray-500">Events</div>
                    </div>
                </div>
            </section>

            {/* Announcements */}
            <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Announcements</h2>
                <ul className="list-disc pl-6 text-gray-700">
                    {announcements.map((msg, i) => (
                        <li key={i}>{msg}</li>
                    ))}
                </ul>
            </section>

            {/* Schedule */}
            <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Today&apos;s Schedule</h2>
                <ul className="divide-y divide-gray-200">
                    {schedule.map((item, i) => (
                        <li key={i} className="py-2 flex justify-between">
                            <span className="font-semibold text-gray-800">{item.time}</span>
                            <span className="text-gray-600">{item.event}</span>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}