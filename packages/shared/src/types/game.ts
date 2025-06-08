export interface GameState {
  currentMap: string;
  player: Player;
  npcs: NPC[];
  isLoading: boolean;
}

export interface Player {
  id: string;
  name: string;
  position: Position;
  direction: Direction;
  sprite: string;
}

export interface NPC {
  id: string;
  name: string;
  position: Position;
  direction: Direction;
  sprite: string;
  dialogue?: string[];
}

export interface Position {
  x: number;
  y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';