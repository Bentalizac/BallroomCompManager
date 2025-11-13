import { useScheduleState } from "../../hooks";
import { SidePanel } from "./SidePanel";
import { EventPanel } from "./EventPanel";



export const DualPanel = () => {
    const schedule = useScheduleState();
    const isOpen = schedule.selectedItemID !== null && schedule.selectedItemID !== undefined;

    return (
        <div className="relative w-64 bg-secondary h-full rounded-lg m-2 overflow-hidden ">
            {/* Base list (always rendered) */}
            <div className="flex flex-col h-full">
                <EventPanel />
            </div>

            {/* Sliding details overlay */}
            <div
                className={`absolute inset-0 z-10 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                } ${!isOpen ? 'pointer-events-none' : ''} bg-secondary rounded-lg shadow-lg`}
            >
                {/* Keep panel visuals even during exit animation */}
                <div className="w-full h-full">
                    <SidePanel />
                </div>
            </div>
        </div>
    );
}