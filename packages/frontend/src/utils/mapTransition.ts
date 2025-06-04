import type { Position, MapData, MapExit } from '@pokemon-like-game-tutorial/shared';
import { isPositionEqual } from '@pokemon-like-game-tutorial/shared';

export function checkMapTransition(
  position: Position,
  mapData: MapData
): MapExit | undefined {
  return mapData.exits.find(exit => isPositionEqual(exit.position, position));
}