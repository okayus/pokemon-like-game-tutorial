import { Position } from './game';

export interface MapData {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: number[][];
  npcs: NPC[];
  exits: MapExit[];
  encounters?: Encounter[];
  bgm?: string;
}

export interface NPC {
  id: string;
  name: string;
  position: Position;
  sprite: string;
  dialog: string[];
  direction?: 'up' | 'down' | 'left' | 'right';
  trainer?: TrainerData;
}

export interface TrainerData {
  team: string[]; // Character IDs
  reward: number;
  defeated?: boolean;
}

export interface MapExit {
  position: Position;
  destination: string; // Map ID
  newPosition: Position;
}

export interface Encounter {
  characterId: string;
  rate: number; // Percentage
  minLevel: number;
  maxLevel: number;
}

export type TileType = number;

// Tile constants
export const TILE_TYPES = {
  GRASS: 0,
  PATH: 1,
  WATER: 2,
  TREE: 3,
  BUILDING: 4,
  FLOWER: 5,
  SAND: 6,
  ROCK: 7,
} as const;