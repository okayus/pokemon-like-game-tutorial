import { memo } from 'react';
import type { NPC as NPCType } from '@pokemon-like-game-tutorial/shared';
import { cn } from '../../lib/utils';

interface NPCProps {
  data: NPCType;
}

export const NPC = memo(function NPC({ data }: NPCProps) {
  return (
    <div
      className={cn(
        "absolute w-8 h-8 z-10",
        "bg-blue-500 rounded-full"
      )}
      style={{
        left: `${data.position.x * 32}px`,
        top: `${data.position.y * 32}px`,
      }}
    >
      {/* Direction indicator if NPC has one */}
      {data.direction && (
        <div
          className={cn(
            "absolute w-2 h-2 bg-white rounded-full",
            {
              'top-0 left-1/2 -translate-x-1/2': data.direction === 'up',
              'bottom-0 left-1/2 -translate-x-1/2': data.direction === 'down',
              'left-0 top-1/2 -translate-y-1/2': data.direction === 'left',
              'right-0 top-1/2 -translate-y-1/2': data.direction === 'right',
            }
          )}
        />
      )}
    </div>
  );
});