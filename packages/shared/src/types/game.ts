export type Direction = 'up' | 'down' | 'left' | 'right';

export type GameMode = 'explore' | 'dialog' | 'battle' | 'menu';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface GameState {
  mode: GameMode;
  currentMap: string;
  player: PlayerState;
}

export interface PlayerState {
  position: Position;
  direction: Direction;
  name: string;
  team: string[]; // Character IDs
  inventory: Item[];
  money: number;
}