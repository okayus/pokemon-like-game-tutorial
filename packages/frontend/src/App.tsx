import { useState, useEffect, useCallback } from 'react';
import { GameState, Direction, DIRECTIONS, 移動可能かチェック, 移動先が通行可能かチェック, マップデータ, GAME_CONSTANTS } from '@pokemon-like-game-tutorial/shared';
import GameCanvas from './components/GameCanvas';
import './App.css';

// 初期ゲーム状態を定義（初学者向け：ゲームの開始時の状態を設定）
const initialGameState: GameState = {
  currentMap: 'town',
  player: {
    id: '1',
    name: 'Player',
    position: { x: GAME_CONSTANTS.初期位置X, y: GAME_CONSTANTS.初期位置Y },
    direction: 'down',
    sprite: 'player',
  },
  npcs: [],
  isLoading: false,
};

function App() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  // プレイヤーを移動させる関数（初学者向け：キー入力に応じてプレイヤーの位置を更新）
  const movePlayer = useCallback((direction: Direction) => {
    setGameState((prev) => {
      // 新しい位置を計算
      const newPosition = {
        x: prev.player.position.x + DIRECTIONS[direction].x,
        y: prev.player.position.y + DIRECTIONS[direction].y,
      };

      // 現在のマップデータを取得（初学者向け：現在いるマップの地形情報を取得）
      const 現在のマップ = マップデータ[prev.currentMap as keyof typeof マップデータ];
      
      // 移動先チェック（初学者向け：マップの境界と地形の両方をチェック）
      const マップ内移動可能 = 移動可能かチェック(newPosition.x, newPosition.y);
      const 地形通行可能 = 移動先が通行可能かチェック(newPosition.x, newPosition.y, 現在のマップ);
      
      if (!マップ内移動可能 || !地形通行可能) {
        // 移動できない場合は、向きだけ変更して位置は変えない
        return {
          ...prev,
          player: {
            ...prev.player,
            direction,
          },
        };
      }

      // 移動可能な場合は、位置と向きを更新
      return {
        ...prev,
        player: {
          ...prev.player,
          position: newPosition,
          direction,
        },
      };
    });
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          movePlayer('up');
          break;
        case 'ArrowDown':
          movePlayer('down');
          break;
        case 'ArrowLeft':
          movePlayer('left');
          break;
        case 'ArrowRight':
          movePlayer('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-4 rounded-lg shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-4 text-center">
          Pokemon-like Game
        </h1>
        <GameCanvas gameState={gameState} />
        <div className="mt-4 text-center text-gray-300 text-sm">
          Use arrow keys to move
        </div>
      </div>
    </div>
  );
}

export default App;