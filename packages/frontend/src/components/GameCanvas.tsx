import { GameState, TILE_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, マップデータ, タイル色設定 } from '@pokemon-like-game-tutorial/shared';

interface GameCanvasProps {
  gameState: GameState;
  'data-testid'?: string;
}

function GameCanvas({ gameState, 'data-testid': dataTestId }: GameCanvasProps) {
  const { player, currentMap } = gameState;
  
  // 現在のマップデータを取得（初学者向け：表示するマップの地形情報を取得）
  const 現在のマップ = マップデータ[currentMap as keyof typeof マップデータ];

  return (
    <div 
      className="relative bg-gray-700 overflow-hidden"
      style={{
        width: VIEWPORT_WIDTH * TILE_SIZE,
        height: VIEWPORT_HEIGHT * TILE_SIZE,
      }}
      data-testid={dataTestId}
    >
      {/* マップタイル表示（初学者向け：実際のマップデータに基づいて地形を描画） */}
      <div className="absolute inset-0">
        {現在のマップ.map((行, y) => (
          <div key={y} className="flex">
            {行.map((タイルタイプ, x) => (
              <div
                key={`${x}-${y}`}
                className="border border-gray-600 border-opacity-30"
                style={{
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  backgroundColor: タイル色設定[タイルタイプ],
                }}
                title={`${タイルタイプ} (${x}, ${y})`}
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