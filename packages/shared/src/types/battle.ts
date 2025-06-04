import { Character, CharacterType } from './character';

export interface BattleState {
  playerTeam: Character[];
  enemyTeam: Character[];
  currentPlayerIndex: number;
  currentEnemyIndex: number;
  turn: 'player' | 'enemy';
  phase: BattlePhase;
  log: BattleLogEntry[];
}

export type BattlePhase = 
  | 'start'
  | 'selecting-action'
  | 'selecting-move'
  | 'selecting-item'
  | 'selecting-switch'
  | 'executing-turn'
  | 'end';

export interface BattleAction {
  type: 'move' | 'item' | 'switch' | 'run';
  data: any;
}

export interface BattleLogEntry {
  message: string;
  type: 'damage' | 'status' | 'info' | 'critical';
}

export interface Move {
  id: string;
  name: string;
  type: CharacterType;
  category: 'physical' | 'special' | 'status';
  power: number;
  accuracy: number;
  pp: number;
  currentPp?: number;
  description: string;
  effect?: MoveEffect;
  animation?: MoveAnimation;
}

export interface MoveEffect {
  type: 'damage' | 'status' | 'stat-change' | 'heal';
  status?: StatusCondition;
  statChanges?: StatChange[];
  chance?: number;
}

export interface StatChange {
  stat: keyof Character['stats'];
  stages: number; // -6 to +6
}

export type StatusCondition = 
  | 'paralysis'
  | 'burn'
  | 'freeze'
  | 'poison'
  | 'sleep'
  | 'confusion';

export interface MoveAnimation {
  sprite?: string;
  duration: number;
  sound?: string;
}

export interface Item {
  id: string;
  name: string;
  type: 'healing' | 'pokeball' | 'battle' | 'key';
  description: string;
  price: number;
  effect?: ItemEffect;
  quantity?: number;
}

export interface ItemEffect {
  type: 'heal' | 'cure-status' | 'catch' | 'stat-boost';
  value?: number;
  status?: StatusCondition;
}