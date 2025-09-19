"use client";
import { Banner } from "@/components/custom/banner";
import React from "react";

const ruleCategories = [
    {
        name: "General Competition Rules",
        rules: [
            "All competitors must check in at least 30 minutes before their first event.",
            "Proper attire is required for all participants.",
            "No coaching allowed on the competition floor.",
            "Respect judges, staff, and fellow competitors at all times.",
        ],
        ndca: "https://ndca.org/rules/"
    },
    {
        name: "Amateur Events",
        rules: [
            "Amateur couples must be registered with the NDCA.",
            "No lifts allowed in amateur events.",
            "Costumes must comply with NDCA guidelines.",
        ],
        ndca: "https://ndca.org/rules/amateur/"
    },
    {
        name: "Professional Events",
        rules: [
            "Professional couples must hold a current NDCA membership.",
            "Open choreography is permitted.",
            "Costume and conduct must meet NDCA standards.",
        ],
        ndca: "https://ndca.org/rules/professional/"
    },
    {
        name: "Pro-Am Events",
        rules: [
            "Pro-Am entries must be submitted before the registration deadline.",
            "Teachers may dance with multiple students, but not in the same event.",
            "NDCA rules for Pro-Am costuming apply.",
        ],
        ndca: "https://ndca.org/rules/pro-am/"
    },
    {
        name: "Youth & Junior Events",
        rules: [
            "Age categories are strictly enforced.",
            "Costume restrictions apply for all youth events.",
            "See NDCA youth rules for details.",
        ],
        ndca: "https://ndca.org/rules/youth/"
    },
];

export default function Rules() {
    return (
        <>
            <Banner name="Rules" />
            <main className="max-w-4xl mx-auto py-10 px-4">
                <div className="space-y-8">
                    {ruleCategories.map((cat, i) => (
                        <section key={cat.name} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">{cat.name}</h2>
                                <a href={cat.ndca} target="_blank" rel="noopener noreferrer" className="text-purple-700 underline text-sm font-semibold">NDCA Rules</a>
                            </div>
                            <ul className="list-disc pl-6 text-gray-700">
                                {cat.rules.map((rule, j) => (
                                    <li key={j}>{rule}</li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </main>
        </>
    );
}