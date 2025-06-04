import type { Position, NPC, MapData } from '@pokemon-like-game-tutorial/shared';
import { isPositionEqual } from '@pokemon-like-game-tutorial/shared';

export function getNPCAtPosition(position: Position, mapData: MapData): NPC | undefined {
  return mapData.npcs.find(npc => isPositionEqual(npc.position, position));
}

export function isNPCTrainer(npc: NPC): boolean {
  return npc.trainer !== undefined;
}