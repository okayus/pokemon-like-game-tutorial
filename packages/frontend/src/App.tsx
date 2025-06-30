import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Direction, DIRECTIONS, 移動可能かチェック, 移動先が通行可能かチェック, マップデータ, GAME_CONSTANTS } from '@pokemon-like-game-tutorial/shared';
import GameCanvas from './components/GameCanvas';
import SaveLoadDialog from './components/SaveLoadDialog';
import FixedSidebar from './components/FixedSidebar';
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
    <div className="h-screen grid grid-cols-[320px_1fr_200px] grid-rows-[1fr_100px] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* 左サイドバー（初学者向け：常に表示されるメニュー） */}
      <FixedSidebar
        プレイヤー名={gameState.player.name}
        プレイ時間={formatプレイ時間(プレイ時間)}
        セーブダイアログを開く={() => setセーブダイアログ開いている(true)}
        ロードダイアログを開く={() => setロードダイアログ開いている(true)}
      />
      
      {/* メインゲームエリア（初学者向け：中央にゲーム画面を配置） */}
      <main className="flex flex-col p-8">
        {/* ゲームキャンバスを上部に配置 */}
        <div className="bg-slate-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-slate-700/50">
          <GameCanvas gameState={gameState} data-testid="game-canvas" />
          
          {/* 操作説明 */}
          <div className="mt-4 text-center text-slate-300 text-sm bg-slate-700/50 rounded-lg p-3">
            <p className="font-semibold text-blue-300 mb-1">操作方法</p>
            <p>矢印キー: 移動 | S: セーブ | L: ロード</p>
          </div>
        </div>
        
        {/* ゲームタイトル（下部に移動） */}
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-6 text-center">
          Pokemon-like Game
        </h1>
      </main>
      
      {/* 右サイドバー（空白） */}
      <aside className="">
        {/* 将来の拡張用 */}
      </aside>
      
      {/* フッター（空白） */}
      <footer className="col-span-3">
        {/* 将来の拡張用 */}
      </footer>
      
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