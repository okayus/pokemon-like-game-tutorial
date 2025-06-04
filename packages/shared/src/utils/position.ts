import { Position, Direction } from '../types/game';

export function getNextPosition(position: Position, direction: Direction): Position {
  switch (direction) {
    case 'up':
      return { x: position.x, y: position.y - 1 };
    case 'down':
      return { x: position.x, y: position.y + 1 };
    case 'left':
      return { x: position.x - 1, y: position.y };
    case 'right':
      return { x: position.x + 1, y: position.y };
  }
}

export function getFacingPosition(position: Position, direction: Direction): Position {
  return getNextPosition(position, direction);
}

export function getDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function isPositionEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

export function isPositionInBounds(position: Position, width: number, height: number): boolean {
  return position.x >= 0 && position.x < width && position.y >= 0 && position.y < height;
}