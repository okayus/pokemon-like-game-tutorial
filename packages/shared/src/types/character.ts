export interface Character {
  id: string;
  name: string;
  type: CharacterType[];
  stats: CharacterStats;
  moves: string[]; // Move IDs
  sprite: CharacterSprite;
  level: number;
  experience: number;
  currentHp: number;
}

export type CharacterType = 
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy';

export interface CharacterStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface CharacterSprite {
  front: string;
  back: string;
  icon?: string;
}

export interface CharacterData {
  id: string;
  name: string;
  type: CharacterType[];
  baseStats: CharacterStats;
  moves: MoveLearnset[];
  sprite: CharacterSprite;
  evolutionLevel?: number;
  evolvesTo?: string;
}

export interface MoveLearnset {
  level: number;
  moveId: string;
}