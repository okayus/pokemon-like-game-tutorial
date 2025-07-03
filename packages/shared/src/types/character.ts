export interface Character {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  stats: CharacterStats;
  moves: Move[];
}

export interface CharacterStats {
  attack: number;
  defense: number;
  speed: number;
}

export interface Move {
  id: string;
  name: string;
  power: number;
  accuracy: number;
  pp: number;
  maxPp: number;
}
