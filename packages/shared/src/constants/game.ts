export const GAME_CONFIG = {
  TILE_SIZE: 32,
  MAP_TRANSITION_DURATION: 300,
  MOVEMENT_SPEED: 200,
  TEXT_SPEED: {
    slow: 50,
    normal: 30,
    fast: 10,
  },
  SAVE_SLOTS: 3,
  MAX_TEAM_SIZE: 6,
  MAX_LEVEL: 100,
} as const;

export const GAME_BALANCE = {
  // Experience
  BASE_EXP_REQUIRED: 100,
  EXP_GROWTH_RATE: 1.5,
  BATTLE_EXP_MULTIPLIER: 1.0,
  
  // Battle
  CRITICAL_HIT_RATE: 0.0625, // 6.25%
  TYPE_EFFECTIVENESS: {
    SUPER: 2.0,
    NORMAL: 1.0,
    NOT_VERY: 0.5,
    NONE: 0,
  },
  
  // Encounter
  BASE_ENCOUNTER_RATE: 0.1, // 10%
  GRASS_MULTIPLIER: 2.0,
  REPEL_DURATION: 100, // steps
  
  // Items
  ITEM_PRICES: {
    potion: 300,
    super_potion: 700,
    hyper_potion: 1200,
    pokeball: 200,
    great_ball: 600,
    ultra_ball: 1200,
    revive: 1500,
  },
} as const;