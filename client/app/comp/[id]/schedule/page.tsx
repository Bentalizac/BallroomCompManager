import { Button } from "@/components/ui/button"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function Schedule() {

    const fakeEvent = [
        {
            name: 'Event 1',
            heat: 1,
            time: '10:00 AM'
        },
        {
            name: 'Event 2',
            heat: 1,
            time: '11:00 AM'
        },
        {
            name: 'Event 3',
            heat: 1,
            time: '12:00 PM'
        }
    ]

    return (
        <>
            <main className="p-15">
                <div className="flex justify-between items-center py-1 px-2">
                    <span className='text-2xl'>Schedule</span>
                    <span className="flex items-center gap-2">
                        <Button>&lt;</Button>
                        <span className="text-2xl">10/9</span>
                        <Button>&gt;</Button>
                    </span>
                </div>
                <div>
                    {fakeEvent.map((event, index) => (
                        <Accordion type="single" className="border p-4 my-2 rounded" key={index} collapsible>
                            <AccordionItem value="item-1">
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
                        </Accordion>
                    ))}
                </div>
            </main>
        </>
    );
}