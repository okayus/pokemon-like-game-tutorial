// 初学者向け：マップページのコンポーネント
// 特定のマップを表示し、ゲームプレイを提供します

import { useState, useEffect, useRef } from 'react';
import { GameState, マップNPCリスト取得 } from '@pokemon-like-game-tutorial/shared';
import MapDisplay from '../components/MapDisplay';
import SaveLoadDialog from '../components/SaveLoadDialog';
import FixedSidebar from '../components/FixedSidebar';
import NPCDisplay from '../components/NPCDisplay';
import FooterDialogContent from '../components/FooterDialogContent';
import { useMapRouter } from '../hooks/useMapRouter';
import { useDialogSystem } from '../hooks/useDialogSystem';

/**
 * マップページコンポーネント
 * 初学者向け：URLパラメータに基づいてマップを表示します
 */
export default function MapPage() {
  const [プレイ時間, setプレイ時間] = useState(0);
  const [セーブダイアログ開いている, setセーブダイアログ開いている] = useState(false);
  const [ロードダイアログ開いている, setロードダイアログ開いている] = useState(false);
  const ゲーム開始時刻 = useRef<number>(Date.now());

  // マップルーターフックを使用
  const {
    現在のマップ,
    プレイヤー位置,
    移動中,
    エラー,
    プレイヤー移動,
    エラークリア
  } = useMapRouter();

  // 対話システムフックを使用
  const {
    対話状態,
    現在のメッセージ,
    現在のNPC名,
    対話開始,
    対話終了,
    次のメッセージへ,
    選択肢を選択
  } = useDialogSystem();

  // 初学者向け：useMapRouterからの位置を優先して使用
  // URLパラメータは初期表示時のみ使用し、移動後はフック内の状態を使用
  const 表示プレイヤー位置 = プレイヤー位置;

  // 現在のマップのNPCリストを取得
  const 現在のNPCリスト = 現在のマップ ? マップNPCリスト取得(現在のマップ.id) : [];

  // ゲーム状態を構築（SaveLoadDialogとの互換性のため）
  const gameState: GameState = {
    currentMap: 現在のマップ?.id || '',
    player: {
      id: '1',
      name: 'プレイヤー',
      position: 表示プレイヤー位置,
      direction: 'down',
      sprite: 'player',
    },
    npcs: [],
    isLoading: 移動中,
  };

  // プレイ時間を更新（初学者向け：1秒ごとにプレイ時間をカウント）
  useEffect(() => {
    const 時刻更新 = setInterval(() => {
      const 経過時間 = Math.floor((Date.now() - ゲーム開始時刻.current) / 1000);
      setプレイ時間(経過時間);
    }, 1000);
    
    return () => clearInterval(時刻更新);
  }, []);

  // キーボード操作の処理
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // 対話中は移動を無効化
      if (対話状態.対話中) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          プレイヤー移動('上');
          break;
        case 'ArrowDown':
          プレイヤー移動('下');
          break;
        case 'ArrowLeft':
          プレイヤー移動('左');
          break;
        case 'ArrowRight':
          プレイヤー移動('右');
          break;
        case 's':
        case 'S':
          setセーブダイアログ開いている(true);
          break;
        case 'l':
        case 'L':
          setロードダイアログ開いている(true);
          break;
        case ' ':
        case 'Enter':
          // スペースキーまたはEnterキーで近くのNPCと対話
          tryInteractWithNearbyNPC();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [プレイヤー移動, 対話状態.対話中]);

  // プレイ時間を表示用に変換（初学者向け：秒を時:分:秒形式に）
  const formatプレイ時間 = (秒: number): string => {
    const 時間 = Math.floor(秒 / 3600);
    const 分 = Math.floor((秒 % 3600) / 60);
    const 残り秒 = 秒 % 60;
    return `${時間}:${分.toString().padStart(2, '0')}:${残り秒.toString().padStart(2, '0')}`;
  };

  /**
   * NPCクリック処理
   * 初学者向け：NPCがクリックされた時に対話を開始します
   */
  const handleNPCClick = (NPC: import('@pokemon-like-game-tutorial/shared').NPCデータ) => {
    対話開始(NPC.id, NPC.名前, NPC.対話データID);
  };

  /**
   * 近くのNPCと対話を試行する関数
   * 初学者向け：スペースキーやEnterキーで隣接NPCと対話します
   */
  const tryInteractWithNearbyNPC = () => {
    // 隣接タイル（距離1以内）にいるNPCを探す
    const 近くのNPC = 現在のNPCリスト.find(NPC => {
      const 距離 = Math.abs(表示プレイヤー位置.x - NPC.位置.x) + 
                 Math.abs(表示プレイヤー位置.y - NPC.位置.y);
      return 距離 <= 1;
    });

    if (近くのNPC) {
      handleNPCClick(近くのNPC);
    }
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
        <div className="bg-slate-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-slate-700/50 relative">
          {エラー && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-200">
              {エラー}
              <button 
                onClick={エラークリア}
                className="ml-2 text-sm underline"
              >
                閉じる
              </button>
            </div>
          )}
          {移動中&& (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl z-10">
              <div className="text-white text-xl">マップ移動中...</div>
            </div>
          )}
          {現在のマップ ? (
            <div className="relative">
              <MapDisplay 
                マップ={現在のマップ} 
                プレイヤー位置={表示プレイヤー位置}
              />
              <NPCDisplay
                NPCリスト={現在のNPCリスト}
                タイルサイズ={32}
                NPCクリック={handleNPCClick}
                プレイヤー位置={表示プレイヤー位置}
              />
            </div>
          ) : (
            <div className="w-[640px] h-[480px] bg-gray-800 flex items-center justify-center text-gray-400">
              マップを読み込み中...
            </div>
          )}
          
          {/* 操作説明 */}
          <div className="mt-4 text-center text-slate-300 text-sm bg-slate-700/50 rounded-lg p-3">
            <p className="font-semibold text-blue-300 mb-1">操作方法</p>
            <p>矢印キー: 移動 | S: セーブ | L: ロード | スペース/Enter: NPC会話 | NPCクリック: 会話</p>
            {現在のマップ && (
              <p className="text-xs mt-1 text-slate-400">
                現在地: {現在のマップ.名前} ({表示プレイヤー位置.x}, {表示プレイヤー位置.y})
                {現在のNPCリスト.length > 0 && ` | NPC: ${現在のNPCリスト.length}体`}
              </p>
            )}
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
      
      {/* フッター（対話ウィンドウエリア） */}
      <footer className="col-span-3 relative">
        {/* 対話ウィンドウ */}
        {対話状態.対話中 && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 border-t-2 border-blue-400/50">
            <div className="h-full flex flex-col">
              {/* NPCの名前表示（上部） */}
              {現在のNPC名 && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2">
                  <p className="text-lg font-semibold">{現在のNPC名}</p>
                </div>
              )}
              
              {/* メッセージ内容 */}
              <div className="flex-1 p-6 overflow-y-auto">
                <FooterDialogContent
                  現在のメッセージ={現在のメッセージ}
                  選択肢を選択={選択肢を選択}
                  次のメッセージへ={次のメッセージへ}
                  対話終了={対話終了}
                />
              </div>
            </div>
          </div>
        )}
      </footer>
      
      {/* セーブダイアログ */}
      <SaveLoadDialog
        開いている={セーブダイアログ開いている}
        モード="save"
        現在のゲーム状態={gameState}
        プレイ時間={プレイ時間}
        閉じる={() => setセーブダイアログ開いている(false)}
        ゲーム状態を設定={() => {}} // マップページでは直接の状態変更は不要
      />
      
      {/* ロードダイアログ */}
      <SaveLoadDialog
        開いている={ロードダイアログ開いている}
        モード="load"
        現在のゲーム状態={gameState}
        プレイ時間={プレイ時間}
        閉じる={() => setロードダイアログ開いている(false)}
        ゲーム状態を設定={() => {}} // マップページでは直接の状態変更は不要
      />

    </div>
  );
}