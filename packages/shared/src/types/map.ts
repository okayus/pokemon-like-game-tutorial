export interface MapData {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: Tile[][];
  exits: MapExit[];
}

export interface Tile {
  type: TileType;
  walkable: boolean;
  grass?: boolean;
}

export type TileType = 'grass' | 'path' | 'water' | 'wall' | 'tree' | 'building';

export interface MapExit {
  position: { x: number; y: number };
  targetMap: string;
  targetPosition: { x: number; y: number };
}