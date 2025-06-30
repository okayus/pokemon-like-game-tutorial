// 方向を表す型（初学者向け：プレイヤーの向きや移動方向を管理）
export type Direction = 'up' | 'down' | 'left' | 'right';

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