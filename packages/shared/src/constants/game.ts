export const TILE_SIZE = 32;
export const MOVEMENT_SPEED = 4;
export const VIEWPORT_WIDTH = 15;
export const VIEWPORT_HEIGHT = 11;

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
} as const;
