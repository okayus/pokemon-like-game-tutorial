import type { MapData } from '@pokemon-like-game-tutorial/shared';
import { townMap } from './town';
import { route1Map } from './route1';

const maps: Record<string, MapData> = {
  town: townMap,
  route1: route1Map,
};

export function getMapData(mapId: string): MapData | undefined {
  return maps[mapId];
}

export function getAllMaps(): Record<string, MapData> {
  return maps;
}