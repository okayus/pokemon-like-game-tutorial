import { Character, CharacterType } from '../types/character';
import { Move } from '../types/battle';
import { GAME_BALANCE } from '../constants/game';

// Type effectiveness chart
const typeChart: Record<CharacterType, Partial<Record<CharacterType, number>>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

export function getTypeEffectiveness(attackType: CharacterType, defenseTypes: CharacterType[]): number {
  let multiplier = 1;
  
  for (const defenseType of defenseTypes) {
    const effectiveness = typeChart[attackType]?.[defenseType] ?? 1;
    multiplier *= effectiveness;
  }
  
  return multiplier;
}

export function calculateDamage(
  attacker: Character,
  defender: Character,
  move: Move
): number {
  // Base damage formula
  const level = attacker.level;
  const power = move.power;
  
  const attack = move.category === 'physical' 
    ? attacker.stats.attack 
    : attacker.stats.specialAttack;
    
  const defense = move.category === 'physical'
    ? defender.stats.defense
    : defender.stats.specialDefense;
  
  // Calculate base damage
  let damage = ((((2 * level) / 5 + 2) * power * attack / defense) / 50) + 2;
  
  // Apply type effectiveness
  const effectiveness = getTypeEffectiveness(move.type, defender.type);
  damage *= effectiveness;
  
  // Apply STAB (Same Type Attack Bonus)
  if (attacker.type.includes(move.type)) {
    damage *= 1.5;
  }
  
  // Random factor (85-100%)
  damage *= (Math.random() * 0.15 + 0.85);
  
  // Critical hit check
  if (Math.random() < GAME_BALANCE.CRITICAL_HIT_RATE) {
    damage *= 1.5;
  }
  
  return Math.floor(damage);
}

export function calculateExpGain(defeatedCharacter: Character, playerLevel: number): number {
  const baseExp = 100; // Base experience for the character
  const levelDifference = defeatedCharacter.level - playerLevel;
  
  let expGain = (baseExp * defeatedCharacter.level) / 7;
  
  // Adjust for level difference
  if (levelDifference > 0) {
    expGain *= 1 + (levelDifference * 0.1);
  } else if (levelDifference < -5) {
    expGain *= 0.5;
  }
  
  return Math.floor(expGain * GAME_BALANCE.BATTLE_EXP_MULTIPLIER);
}

export function getExpRequiredForLevel(level: number): number {
  return Math.floor(
    GAME_BALANCE.BASE_EXP_REQUIRED * Math.pow(GAME_BALANCE.EXP_GROWTH_RATE, level - 1)
  );
}