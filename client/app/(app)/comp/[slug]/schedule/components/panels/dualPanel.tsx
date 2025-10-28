import { useScheduleState } from "../../hooks";
import { SidePanel } from "./SidePanel";
import { EventPanel } from "./EventPanel";



export const DualPanel = () => {
    const schedule = useScheduleState();

    console.log('DualPanel render - selectedItemID:', schedule.selectedItemID);

    return (
        <div className="w-64 bg-secondary flex flex-col h-full rounded-lg m-2">
            { schedule.selectedItemID !== null && schedule.selectedItemID !== undefined ? (
                <SidePanel />
            ) : (
                <EventPanel />
            )}
        </div>
    );
}