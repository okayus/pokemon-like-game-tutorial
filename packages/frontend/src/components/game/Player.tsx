import { useGameStore } from '../../stores/gameStore';
import { cn } from '../../lib/utils';

export function Player() {
  const { position, direction } = useGameStore((state) => state.player);
  
  return (
    <div
      className={cn(
        "absolute w-8 h-8 transition-all duration-150 z-10",
        "bg-red-500 rounded-full"
      )}
      style={{
        left: `${position.x * 32}px`,
        top: `${position.y * 32}px`,
      }}
    >
      {/* Direction indicator */}
      <div
        className={cn(
          "absolute w-2 h-2 bg-white rounded-full",
          {
            'top-0 left-1/2 -translate-x-1/2': direction === 'up',
            'bottom-0 left-1/2 -translate-x-1/2': direction === 'down',
            'left-0 top-1/2 -translate-y-1/2': direction === 'left',
            'right-0 top-1/2 -translate-y-1/2': direction === 'right',
          }
        )}
      />
    </div>
  );
}