'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import React from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function Schedule() {

    const fakeEvents = [
        {
            name: 'Event 1',
            heat: 1,
            time: '10:00 AM',
            date: '10/9'
        },
        {
            name: 'Event 2',
            heat: 1,
            time: '11:00 AM',
            date: '10/9'
        },
        {
            name: 'Event 3',
            heat: 1,
            time: '12:00 PM',
            date: '10/9'
        },
        {
            name: 'Event 4',
            heat: 1,
            time: '1:00 PM',
            date: '10/9'
        },
        {
            name: 'Event 5',
            heat: 1,
            time: '2:00 PM',
            date: '10/10'
        },
        {
            name: 'Event 6',
            heat: 1,
            time: '3:00 PM',
            date: '10/10'
        },
        {
            name: 'Event 7',
            heat: 1,
            time: '4:00 PM',
            date: '10/11'
        },
    ]

    const fakeDates = [
        '10/9',
        '10/10',
        '10/11'
    ]

    // Track the current date index
    const [dateIndex, setDateIndex] = React.useState(0);

    // Cycle to previous date
    const handlePrev = () => {
        if (dateIndex > 0) setDateIndex(dateIndex - 1);
    };
    // Cycle to next date
    const handleNext = () => {
        if (dateIndex < fakeDates.length - 1) setDateIndex(dateIndex + 1);
    };

    // Filter events by current date
    const currentDate = fakeDates[dateIndex];
    const filteredEvents = fakeEvents.filter(event => event.date === currentDate);

    return (
        <>
            <main className="p-15">
                <div className="flex justify-between items-center py-1 px-2">
                    <span className='text-2xl'>Schedule</span>
                    <span className="flex items-center gap-2">
                        <Button onClick={handlePrev} disabled={dateIndex === 0} variant={dateIndex === 0 ? "secondary" : "default"}>&lt;</Button>
                        <span className="text-2xl">{currentDate}</span>
                        <Button onClick={handleNext} disabled={dateIndex === fakeDates.length - 1} variant={dateIndex === fakeDates.length - 1 ? "secondary" : "default"}>&gt;</Button>
                    </span>
                </div>
                <div className="flex columns-2 gap-4">
                    <div className="w-3/4">
                        <Accordion type="single" className="border rounded" collapsible>
                            {filteredEvents.map((event, index) => (
                                <AccordionItem key={index} value={`item-${index}`} className="px-4 py-1">
                                    <AccordionTrigger>
                                        <div>
                                            <div className="text-xl font-bold">{event.time}</div>
                                        </div>
                                        <div className="flex gap-3">
                                            <span>{event.name}</span>
                                            <span>Heat {event.heat}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <ul>
                                            <li>Competitor 1</li>
                                            <li>Competitor 2</li>
                                            <li>Competitor 3</li>
                                            <li>Competitor 4</li>
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                    <div className="w-1/4 border rounded p-2">
                        <span>
                            Filters
                            <Input type="text" placeholder="Competitor Name" />
                            <Input type="text" placeholder="Event Name" />
                        </span>
                    </div>
                </div>
            </main>
        </>
    );
}