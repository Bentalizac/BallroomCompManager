import { GripVertical } from 'lucide-react';
import { DRAG_TYPES } from '../../../hooks/useDraggable';
import type { Block } from '../../../types';
import { State, STATE_TYPES, DraggableItem  } from './draggableItem';
import { useScheduleState } from '../../../hooks';

export interface DraggableBlockProps {
    block: Block;
}

export const DraggableBlock = ({ block }: DraggableBlockProps) => {
    const schedule = useScheduleState();
    
    const content = (
        <div 
            className="flex items-center gap-2 px-3 py-2 rounded bg-gray-200"
            onClick={(e) => {
                e.stopPropagation();
                schedule.setSelectedItemID(block.id);
            }}
        >
            <GripVertical className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">{block.name ? block.name : 'Untitled Block'}</span>
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