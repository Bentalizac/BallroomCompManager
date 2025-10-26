import { GripVertical } from 'lucide-react';
import { DRAG_TYPES } from '../../../hooks/useDraggable';
import type { Block } from '../../../types';
import { State, STATE_TYPES, DraggableItem  } from './draggableItem';

export interface DraggableBlockProps {
    block: Block;
    state?: State;
}

export const DraggableBlock = ({ block, state = STATE_TYPES.SCHEDULED }: DraggableBlockProps) => {
    const content = (
        <div className="flex items-center gap-2 px-3 py-2 rounded bg-gray-200">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">{block.name ? block.name : 'Untitled Block'}</span>
        </div>
    );

    return (
        <DraggableItem
            dragType={DRAG_TYPES.BLOCK}
            state={state}
            data={{ ...block }}
            display={content}
        />
    );
}