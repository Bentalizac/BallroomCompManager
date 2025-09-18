"use client";
import React from "react";

export default function Tickets() {
    const ticketTypes = [
        { name: "General Admission", price: 25 },
        { name: "VIP Admission", price: 60 },
        { name: "Student Admission", price: 15 },
    ];
    const [quantities, setQuantities] = React.useState([0, 0, 0]);

    const handleChange = (idx: number, value: number) => {
        setQuantities(q => q.map((qty, i) => (i === idx ? value : qty)));
    };

    const handlePurchase = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Tickets purchased!");
    };

    return (
        <main className="max-w-xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">Purchase Tickets</h1>
            <form className="bg-white rounded-lg shadow p-8 flex flex-col gap-6" onSubmit={handlePurchase}>
                {ticketTypes.map((type, idx) => (
                    <div key={type.name} className="flex items-center justify-between">
                        <div>
                            <span className="font-semibold text-lg">{type.name}</span>
                            <span className="ml-4 text-gray-500">${type.price}</span>
                        </div>
                        <input
                            type="number"
                            min={0}
                            value={quantities[idx]}
                            onChange={e => handleChange(idx, Number(e.target.value))}
                            className="border rounded px-3 py-1 w-20"
                        />
                    </div>
                ))}
                <button type="submit" className="bg-purple-700 text-white px-6 py-2 rounded hover:bg-purple-800 font-semibold">Purchase</button>
            </form>
        </main>
    );
}