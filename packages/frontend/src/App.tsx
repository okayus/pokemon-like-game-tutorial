import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Direction, DIRECTIONS, 移動可能かチェック, 移動先が通行可能かチェック, マップデータ, GAME_CONSTANTS } from '@pokemon-like-game-tutorial/shared';
import GameCanvas from './components/GameCanvas';
import SaveLoadDialog from './components/SaveLoadDialog';
import { Button } from './components/ui/button';
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
  const [プレイ時間, setプレイ時間] = useState(0);
  const [セーブダイアログ開いている, setセーブダイアログ開いている] = useState(false);
  const [ロードダイアログ開いている, setロードダイアログ開いている] = useState(false);
  const ゲーム開始時刻 = useRef<number>(Date.now());

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

  // プレイ時間を更新（初学者向け：1秒ごとにプレイ時間をカウント）
  useEffect(() => {
    const 時刻更新 = setInterval(() => {
      const 経過時間 = Math.floor((Date.now() - ゲーム開始時刻.current) / 1000);
      setプレイ時間(経過時間);
    }, 1000);
    
    return () => clearInterval(時刻更新);
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
        case 's':
        case 'S':
          setセーブダイアログ開いている(true);
          break;
        case 'l':
        case 'L':
          setロードダイアログ開いている(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer]);

  // プレイ時間を表示用に変換（初学者向け：秒を時:分:秒形式に）
  const formatプレイ時間 = (秒: number): string => {
    const 時間 = Math.floor(秒 / 3600);
    const 分 = Math.floor((秒 % 3600) / 60);
    const 残り秒 = 秒 % 60;
    return `${時間}:${分.toString().padStart(2, '0')}:${残り秒.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-4 rounded-lg shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-4 text-center">
          Pokemon-like Game
        </h1>
        
        {/* ゲーム情報表示（初学者向け：プレイ時間やプレイヤー名を表示） */}
        <div className="mb-4 text-center text-white text-sm">
          <p>プレイヤー: {gameState.player.name}</p>
          <p>プレイ時間: {formatプレイ時間(プレイ時間)}</p>
        </div>
        
        <GameCanvas gameState={gameState} />
        
        {/* 操作説明とボタン */}
        <div className="mt-4 space-y-2">
          <div className="text-center text-gray-300 text-sm">
            矢印キー: 移動 | S: セーブ | L: ロード
          </div>
          <div className="flex justify-center space-x-2">
            <Button
              onClick={() => setセーブダイアログ開いている(true)}
              size="sm"
              variant="outline"
            >
              セーブ
            </Button>
            <Button
              onClick={() => setロードダイアログ開いている(true)}
              size="sm"
              variant="outline"
            >
              ロード
            </Button>
          </div>
        </div>
      </div>
      
      {/* セーブダイアログ */}
      <SaveLoadDialog
        開いている={セーブダイアログ開いている}
        モード="save"
        現在のゲーム状態={gameState}
        プレイ時間={プレイ時間}
        閉じる={() => setセーブダイアログ開いている(false)}
        ゲーム状態を設定={setGameState}
      />
      
      {/* ロードダイアログ */}
      <SaveLoadDialog
        開いている={ロードダイアログ開いている}
        モード="load"
        現在のゲーム状態={gameState}
        プレイ時間={プレイ時間}
        閉じる={() => setロードダイアログ開いている(false)}
        ゲーム状態を設定={setGameState}
      />
    </div>
  );
}

export default App;