import { GripVertical } from 'lucide-react';
import { DRAG_TYPES } from '../../../hooks/useDraggable';
import type { Block } from '../../../types';
import { State, STATE_TYPES, DraggableItem  } from './draggableItem';
import { useScheduleState } from '../../../hooks';
import { getContrastingTextColor } from '../../../utils';

export interface DraggableBlockProps {
    block: Block;
}

export const DraggableBlock = ({ block }: DraggableBlockProps) => {
    const schedule = useScheduleState();
    // Use a consistent default color for blocks (matches timeline block color family)
    const bgColor = block.color ?? '#4d4d4dff';
    const textColor = getContrastingTextColor(bgColor);
    const isSelected = schedule.selectedItemID === block.id;
    
    const content = (
        <div 
            className={`flex items-center gap-2 px-3 py-2 rounded border-2 transition-shadow ${
                isSelected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-transparent'
            }`}
            style={{ backgroundColor: bgColor, color: textColor }}
            onClick={(e) => {
                e.stopPropagation();
                schedule.setSelectedItemID(block.id);
            }}
        >
            <GripVertical className="w-4 h-4" style={{ color: textColor, opacity: 0.7 }} />
            <span className="text-sm font-medium">{block.name ? block.name : 'Untitled Block'}</span>
        </div>
    );

    return (
        <DraggableItem
            dragType={DRAG_TYPES.BLOCK}
            state={block.state}
            data={{ ...block }}
            display={content}
        />
    );
}