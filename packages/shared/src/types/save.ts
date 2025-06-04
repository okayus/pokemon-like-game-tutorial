import { GameState } from './game';

export interface SaveData {
  version: string;
  timestamp: number;
  playTime: number;
  
  game: GameState;
  
  progress: {
    badges: string[];
    defeatedTrainers: string[];
    caughtCharacters: string[];
    seenCharacters: string[];
  };
  
  flags: Record<string, boolean>;
  
  settings?: {
    masterVolume: number;
    bgmVolume: number;
    sfxVolume: number;
    textSpeed: 'slow' | 'normal' | 'fast';
    battleAnimations: boolean;
  };
}

export interface SaveSlot {
  id: number;
  name: string;
  playTime: number;
  badges: number;
  location: string;
  timestamp: number;
  thumbnail?: string;
}