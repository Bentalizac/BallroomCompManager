import { DraggableItem } from '../../dnd/drag/draggableItem';
import type { Block } from '../../../types';
import { useRef, useState } from 'react';
import { TIME_CONSTANTS } from '../../../constants';
import { useScheduleState } from '../../../hooks';
import { DRAG_TYPES } from '../../../hooks/useDraggable';
import { BlockDropZone } from '../drop/BlockDropZone';
import { getContrastingTextColor } from '../../../utils';


function getDuration(startDate: Date | null, endDate: Date | null): number {
    if (!startDate || !endDate) return 0;
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)); // duration in minutes
}


export interface DraggableTimelineBlockProps {
    block: Block;
    day?: Date;
}

export const DraggableTimelineBlock = ({ block, day }: DraggableTimelineBlockProps) => {

    const schedule = useScheduleState();
    const [isResizing, setIsResizing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const startYRef = useRef(0);
    const startDurationRef = useRef(0);

    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        startYRef.current = e.clientY;
        startDurationRef.current = getDuration(block.startDate, block.endDate);
    
        const handleMouseMove = (e: MouseEvent) => {
          const deltaY = e.clientY - startYRef.current;
          // Convert deltaY to minutes based on pixel scale
          const deltaMinutes = Math.round((deltaY / TIME_CONSTANTS.PIXELS_PER_SLOT) * TIME_CONSTANTS.LINE_INTERVAL);
          const newDuration = Math.max(TIME_CONSTANTS.LINE_INTERVAL, startDurationRef.current + deltaMinutes);
          
          // Update endDate based on new duration
                    if (block.startDate) {
                        const newEndDate = new Date(block.startDate.getTime() + newDuration * 60 * 1000);
                        schedule.handleBlockUpdate(block.id, { endDate: newEndDate });
                    }
        };
    
        const handleMouseUp = () => {
          setIsResizing(false);
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
    
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const LIGHT_PURPLE = '#9970a3ff'; // static light purple for timeline items
    const textColor = getContrastingTextColor(LIGHT_PURPLE);
        const hasEvents = Array.isArray(block.eventIds) && block.eventIds.length > 0;
        // Layout insets for inner body area
        const HEADER_GAP = 28; // px, a bit more space between header and body
        const BOTTOM_GAP = 4;  // px, equivalent to bottom-1

        const content = (
            <BlockDropZone block={block} eventsAreaTopPx={HEADER_GAP} eventsAreaBottomPx={BOTTOM_GAP}>
                {({ isOver }) => (
                    <div
                        className={`absolute left-0 top-0 w-full h-full rounded shadow-sm border-2 transition-colors ${
                            schedule.selectedItemID === block.id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: LIGHT_PURPLE }}
                        onClick={(e) => {
                            e.stopPropagation();
                            schedule.setSelectedItemID(block.id);
                        }}
                    >
                        <div className="p-1 h-full overflow-hidden relative">
                            {/* Header */}
                            <div className="flex items-center justify-between" style={{ color: textColor }}>
                                <div className="text-xs font-semibold truncate">{block.name}</div>
                                {hasEvents && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20" style={{ color: textColor }}>
                                        {block.eventIds?.length}
                                    </span>
                                )}
                            </div>

                            {/* Visual drop area body */}
                            <div
                                className="absolute rounded-md border-2 border-dashed flex items-center justify-center transition-all"
                                style={{
                                    left: 4,
                                    right: 4,
                                    top: HEADER_GAP,
                                    bottom: BOTTOM_GAP,
                                    borderColor: isOver ? 'rgba(59,130,246,0.8)' : 'rgba(255,255,255,0.5)', // blue-500 when over
                                    backgroundColor: isOver ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.07)',
                                    color: textColor,
                                    opacity: isOver ? 1 : (hasEvents ? 0 : 1),
                                    zIndex: 1,
                                    pointerEvents: 'none'
                                }}
                            >
                                <span className="text-[10px] opacity-80">Drop events into this block</span>
                            </div>

                            {schedule.selectedItemID === block.id && (
                                <div className="absolute top-1 right-1 text-xs text-blue-600 font-medium">
                                    DEL
                                </div>
                            )}
                            {/* Resize handle */}
                            <div
                                className="absolute bottom-0 left-0 w-full h-3 cursor-ns-resize hover:bg-black/20 flex items-end justify-center"
                                onMouseDown={handleResizeStart}
                                style={{ zIndex: 10 }}
                            >
                                <div className="w-4 h-1 bg-gray-400 rounded-full opacity-50 hover:opacity-100" />
                            </div>
                        </div>
                    </div>
                )}
            </BlockDropZone>
        );

    return (
        <DraggableItem
            dragType={DRAG_TYPES.BLOCK}
            state={block.state}
            data={{ ...block, day }}
            className="w-full h-full"
            display={content}
        />
    );

}