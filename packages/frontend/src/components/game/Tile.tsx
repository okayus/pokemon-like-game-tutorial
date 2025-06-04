import { memo } from 'react';
import { TILE_STYLES } from '@pokemon-like-game-tutorial/shared';
import { cn } from '../../lib/utils';

interface TileProps {
  type: number;
}

export const Tile = memo(function Tile({ type }: TileProps) {
  return (
    <div 
      className={cn(
        "w-8 h-8",
        TILE_STYLES[type] || 'bg-gray-500'
      )}
    />
  );
});