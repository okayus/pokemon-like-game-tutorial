import { GameState, TILE_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, TILE_COLORS } from '@pokemon-like-game-tutorial/shared';

interface GameCanvasProps {
  gameState: GameState;
}

function GameCanvas({ gameState }: GameCanvasProps) {
  const { player } = gameState;

  return (
    <div 
      className="relative bg-gray-700 overflow-hidden"
      style={{
        width: VIEWPORT_WIDTH * TILE_SIZE,
        height: VIEWPORT_HEIGHT * TILE_SIZE,
      }}
    >
      {/* Simple grid background */}
      <div className="absolute inset-0">
        {Array.from({ length: VIEWPORT_HEIGHT }).map((_, y) => (
          <div key={y} className="flex">
            {Array.from({ length: VIEWPORT_WIDTH }).map((_, x) => (
              <div
                key={`${x}-${y}`}
                className="border border-gray-600"
                style={{
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  backgroundColor: TILE_COLORS.grass,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Player */}
      <div
        className="absolute bg-blue-500 rounded-full flex items-center justify-center text-white font-bold transition-all duration-200"
        style={{
          width: TILE_SIZE - 4,
          height: TILE_SIZE - 4,
          left: player.position.x * TILE_SIZE + 2,
          top: player.position.y * TILE_SIZE + 2,
        }}
      >
        P
      </div>
    </div>
  );
}

export default GameCanvas;