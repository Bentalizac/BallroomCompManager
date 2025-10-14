'use client';

import React from "react";

export default function JudgePage() {
    // Fake event and competitors
    const eventName = "Amateur Latin";
    const totalCompetitors = 12;
    const callbacks = 8;
    const competitors = Array.from({ length: totalCompetitors }, (_, i) => 110 + i);
    const [checked, setChecked] = React.useState(Array(totalCompetitors).fill(false));

    const handleCheck = (idx: number) => {
        setChecked(prev => {
            const copy = [...prev];
            copy[idx] = !copy[idx];
            return copy;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Submit logic here
        alert(`Submitted: ${checked.filter(Boolean).length} callbacks`);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 py-8 px-2">
            <div className="w-full max-w-3xl bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="text-lg font-semibold">Current Event: <span className="font-bold">{eventName}</span></div>
                    </div>
                    <div className="text-md bg-purple-100 text-purple-700 px-4 py-2 rounded font-semibold">
                        Callbacks: <span className="font-bold">{callbacks}</span> / {totalCompetitors}
                    </div>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-4 gap-6 mb-8">
                        {competitors.map((num, idx) => (
                            <label key={num} className={`flex items-center justify-between bg-purple-200 rounded-lg px-4 py-6 shadow cursor-pointer transition-all ${checked[idx] ? 'opacity-100' : 'opacity-80'}`}>
                                <span className="font-mono text-xl font-bold text-gray-700">{num}</span>
                                <input
                                    type="checkbox"
                                    checked={checked[idx]}
                                    onChange={() => handleCheck(idx)}
                                    className="accent-purple-600 w-6 h-6"
                                />
                            </label>
                        ))}
                    </div>
                    <div className="flex justify-center">
                        <button type="submit" className="bg-purple-700 text-white px-8 py-3 rounded-lg shadow hover:bg-purple-800 text-lg font-semibold transition-all">Submit On Deck</button>
                    </div>
                </form>
            </div>
        </div>
    );
}