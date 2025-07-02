// 初学者向け：マップページのコンポーネント
// 特定のマップを表示し、ゲームプレイを提供します

import { useState, useEffect, useRef } from 'react';
import { GameState, マップNPCリスト取得, マップアイテム配置取得, アイテム取得イベント結果 } from '@pokemon-like-game-tutorial/shared';
import MapDisplay from '../components/MapDisplay';
import SaveLoadDialog from '../components/SaveLoadDialog';
import FixedSidebar from '../components/FixedSidebar';
import NPCDisplay from '../components/NPCDisplay';
import FooterDialogContent from '../components/FooterDialogContent';
import { CommonHeader } from '../components/CommonHeader';
import { ItemBoxDisplay } from '../components/ItemBoxDisplay';
import { ItemObtainNotification, useItemObtainNotification } from '../components/ItemObtainNotification';
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
    対話中のNPC,
    現在の対話,
    対話進行中,
    対話開始,
    対話終了,
    対話次へ
  } = useDialogSystem();

  // アイテム取得通知システム
  const { currentResult, showNotification, hideNotification } = useItemObtainNotification();

  // プレイ時間の更新
  useEffect(() => {
    const interval = setInterval(() => {
      setプレイ時間(Math.floor((Date.now() - ゲーム開始時刻.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // キーボード操作
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (移動中 || 対話進行中) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          プレイヤー移動('上');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          プレイヤー移動('下');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          プレイヤー移動('左');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          プレイヤー移動('右');
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          if (対話中のNPC) {
            if (現在の対話) {
              対話次へ();
            } else {
              対話開始(対話中のNPC);
            }
          }
          break;
        case 'Escape':
          if (現在の対話) {
            対話終了();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [移動中, 対話進行中, 対話中のNPC, 現在の対話, プレイヤー移動, 対話開始, 対話次へ, 対話終了]);

  // 現在のマップのNPCリストを取得
  const 現在のマップのNPCリスト = 現在のマップ ? マップNPCリスト取得(現在のマップ.id) : [];

  // 現在のマップのアイテムボックス配置を取得
  const 現在のマップのアイテム配置 = 現在のマップ ? マップアイテム配置取得(現在のマップ.id) : undefined;
  const アイテムボックス一覧 = 現在のマップのアイテム配置?.アイテムボックス一覧 || [];

  /**
   * アイテム取得時の処理
   * 初学者向け：アイテムボックスから取得した時の通知表示
   */
  const handleアイテム取得 = (boxId: string, result: アイテム取得イベント結果) => {
    showNotification(result);
  };

  // タイルクリック処理
  const handleタイルクリック = (x: number, y: number) => {
    if (移動中 || 対話進行中) return;

    // クリックした位置への移動（隣接している場合のみ）
    const dx = Math.abs(x - プレイヤー位置.x);
    const dy = Math.abs(y - プレイヤー位置.y);
    
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
      if (x < プレイヤー位置.x) プレイヤー移動('左');
      else if (x > プレイヤー位置.x) プレイヤー移動('右');
      else if (y < プレイヤー位置.y) プレイヤー移動('上');
      else if (y > プレイヤー位置.y) プレイヤー移動('下');
    }
  };

  // 現在のゲーム状態を作成
  const 現在のゲーム状態: GameState = {
    プレイヤー: {
      id: 'player1',
      name: 'プレイヤー',
      position: プレイヤー位置,
      direction: 'down',
      sprite: 'player'
    },
    現在のマップ: 現在のマップ?.id || 'town',
    プレイ時間
  };

  if (!現在のマップ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">マップを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 共通ヘッダー */}
      <CommonHeader />
      
      <div className="flex">
        {/* メインゲームエリア */}
        <div className="flex-1 flex flex-col">
          {/* ゲーム情報ヘッダー */}
          <div className="bg-white shadow-sm p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {現在のマップ.name}
                </h2>
                <p className="text-sm text-gray-600">
                  プレイ時間: {Math.floor(プレイ時間 / 60)}分{プレイ時間 % 60}秒
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setセーブダイアログ開いている(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  セーブ
                </button>
                <button
                  onClick={() => setロードダイアログ開いている(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  ロード
                </button>
              </div>
            </div>
          </div>

          {/* エラー表示 */}
          {エラー && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-4 rounded relative">
              <span className="block sm:inline">{エラー}</span>
              <button
                onClick={エラークリア}
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
              >
                <span className="sr-only">閉じる</span>
                ×
              </button>
            </div>
          )}

          {/* メインコンテンツ */}
          <div className="flex-1 p-4 flex items-center justify-center">
            <div className="relative">
              <MapDisplay
                マップ={現在のマップ}
                プレイヤー位置={プレイヤー位置}
                onタイルクリック={handleタイルクリック}
              />
              
              {/* NPCオーバーレイ */}
              <NPCDisplay
                NPCリスト={現在のマップのNPCリスト}
                プレイヤー位置={プレイヤー位置}
                onNPC接触={対話開始}
              />
              
              {/* アイテムボックスオーバーレイ */}
              <ItemBoxDisplay
                アイテムボックス一覧={アイテムボックス一覧}
                プレイヤー位置={プレイヤー位置}
                プレイヤーID="test-player-001"
                マップID={現在のマップ.id}
                onアイテム取得={handleアイテム取得}
              />
            </div>
          </div>

          {/* フッター対話エリア */}
          <FooterDialogContent 
            現在の対話={現在の対話}
            対話進行中={対話進行中}
            on対話次へ={対話次へ}
            on対話終了={対話終了}
          />
        </div>
      </div>

      {/* サイドバー */}
      <FixedSidebar 現在のゲーム状態={現在のゲーム状態} />

      {/* セーブダイアログ */}
      <SaveLoadDialog
        開いている={セーブダイアログ開いている}
        モード="save"
        ゲーム状態={現在のゲーム状態}
        on閉じる={() => setセーブダイアログ開いている(false)}
      />

      {/* ロードダイアログ */}
      <SaveLoadDialog
        開いている={ロードダイアログ開いている}
        モード="load"
        ゲーム状態={現在のゲーム状態}
        on閉じる={() => setロードダイアログ開いている(false)}
      />

      {/* アイテム取得通知 */}
      <ItemObtainNotification 
        result={currentResult}
        onClose={hideNotification}
      />
    </div>
  );
}