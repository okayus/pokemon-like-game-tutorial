export const TILE_STYLES: Record<number, string> = {
  0: 'bg-green-400', // Grass
  1: 'bg-yellow-600', // Path
  2: 'bg-blue-500', // Water
  3: 'bg-green-800', // Tree
  4: 'bg-gray-600', // Building
  5: 'bg-pink-400', // Flower
  6: 'bg-yellow-300', // Sand
  7: 'bg-gray-500', // Rock
};

export const BLOCKING_TILES = [2, 3, 4, 7]; // Water, Tree, Building, Rock

export const ENCOUNTER_TILES = [0, 5]; // Grass, Flower