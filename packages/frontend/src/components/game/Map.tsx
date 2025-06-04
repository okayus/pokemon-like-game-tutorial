import { useMemo } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { getMapData } from '../../data/maps';
import { Tile } from './Tile';
import { NPC } from './NPC';

export function Map() {
  const currentMap = useGameStore((state) => state.currentMap);
  const mapData = useMemo(() => getMapData(currentMap), [currentMap]);
  
  if (!mapData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white">Map not found: {currentMap}</p>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {/* Tile Grid */}
      <div 
        className="grid gap-0 game-map"
        style={{
          gridTemplateColumns: `repeat(${mapData.width}, 32px)`,
          gridTemplateRows: `repeat(${mapData.height}, 32px)`,
        }}
      >
        {mapData.tiles.flat().map((tileType, index) => (
          <Tile key={index} type={tileType} />
        ))}
      </div>
      
      {/* NPCs Layer */}
      {mapData.npcs.map((npc) => (
        <NPC key={npc.id} data={npc} />
      ))}
    </div>
  );
}