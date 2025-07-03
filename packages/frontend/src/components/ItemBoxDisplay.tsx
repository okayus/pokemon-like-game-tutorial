// 初学者向け：マップ上のアイテムボックス表示コンポーネント
// アイテムボックスの位置と状態を視覚的に表示

import { useEffect, useState } from 'react';
import type { アイテムボックス, アイテム取得イベント結果 } from '@pokemon-like-game-tutorial/shared';
import { アイテムボックスアイコン取得 } from '@pokemon-like-game-tutorial/shared';
import { デフォルトアイテムAPIサービス } from '../services/itemApi';

/**
 * アイテムボックス表示のプロパティ
 */
interface ItemBoxDisplayProps {
  /** 表示するアイテムボックスの一覧 */
  アイテムボックス一覧: アイテムボックス[];
  /** プレイヤーの現在位置 */
  プレイヤー位置: { x: number; y: number };
  /** プレイヤーID */
  プレイヤーID: string;
  /** マップID */
  マップID: string;
  /** アイテムボックスとの接触時の処理 */
  onアイテム取得: (boxId: string, result: アイテム取得イベント結果) => void;
}

/**
 * 単一のアイテムボックスコンポーネント
 * 初学者向け：1つのアイテムボックスの表示と接触判定
 */
function ItemBox({ 
  box, 
  isNearPlayer,
  onOpen 
}: { 
  box: アイテムボックス; 
  isNearPlayer: boolean;
  onOpen: () => void;
}) {
  const アイコン = アイテムボックスアイコン取得(box.タイプ);
  
  // 開封済みの場合は半透明で表示
  const 透明度クラス = box.状態 === '開封済み' ? 'opacity-30' : 'opacity-100';
  
  // プレイヤーが近くにいる場合はハイライト
  const ハイライトクラス = isNearPlayer && box.状態 === '未開封' 
    ? 'ring-2 ring-yellow-400 animate-pulse' 
    : '';

  return (
    <div
      className={`absolute w-8 h-8 flex items-center justify-center transition-all ${透明度クラス} ${ハイライトクラス}`}
      style={{
        left: `${box.位置.x * 32}px`,
        top: `${box.位置.y * 32}px`
      }}
      onClick={isNearPlayer && box.状態 === '未開封' ? onOpen : undefined}
      role="button"
      aria-label={`アイテムボックス: ${box.タイプ}`}
    >
      <span className="text-2xl">{アイコン}</span>
      {/* 開封可能な場合はツールチップ表示 */}
      {isNearPlayer && box.状態 === '未開封' && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          Spaceキーで開く
        </div>
      )}
    </div>
  );
}

/**
 * アイテムボックス表示コンポーネント
 * 初学者向け：マップ上の全アイテムボックスを管理
 */
export function ItemBoxDisplay({ 
  アイテムボックス一覧, 
  プレイヤー位置,
  プレイヤーID,
  マップID,
  onアイテム取得 
}: ItemBoxDisplayProps) {
  // 状態管理：開封処理中のボックスID
  const [開封中ボックスID, set開封中ボックスID] = useState<string | null>(null);
  
  // 状態管理：ローカルのアイテムボックス状態
  const [ローカルボックス一覧, setローカルボックス一覧] = useState(アイテムボックス一覧);
  
  // プレイヤーIDまたはマップIDが変更されたらボックス状態をリセット
  useEffect(() => {
    setローカルボックス一覧(アイテムボックス一覧);
  }, [プレイヤーID, マップID, アイテムボックス一覧]);

  /**
   * プレイヤーとアイテムボックスの距離をチェック
   * 初学者向け：隣接している場合のみ開封可能
   */
  const isPlayerNearBox = (box: アイテムボックス): boolean => {
    const xDistance = Math.abs(プレイヤー位置.x - box.位置.x);
    const yDistance = Math.abs(プレイヤー位置.y - box.位置.y);
    
    // 隣接している（距離が1以下）場合はtrue
    return xDistance <= 1 && yDistance <= 1;
  };

  /**
   * アイテムボックスを開封する処理
   * 初学者向け：バックエンドAPIを呼び出してアイテムを取得
   */
  const openItemBox = async (box: アイテムボックス) => {
    if (box.状態 === '開封済み' || 開封中ボックスID) return;
    
    try {
      set開封中ボックスID(box.id);
      
      // アイテム取得APIを呼び出し
      const result = await デフォルトアイテムAPIサービス.アイテム取得(
        プレイヤーID,
        box.アイテムID,
        box.個数
      );
      
      // 取得結果を作成
      const 取得結果: アイテム取得イベント結果 = {
        success: result.success,
        message: result.message || box.メッセージ || 'アイテムを取得しました',
        item: result.success ? {
          id: box.アイテムID,
          name: '', // APIレスポンスに名前が含まれていない場合は空文字
          quantity: box.個数
        } : undefined,
        error: !result.success ? result.message : undefined
      };
      
      // 成功した場合はローカル状態を更新
      if (result.success) {
        setローカルボックス一覧(prev => 
          prev.map(b => b.id === box.id 
            ? { ...b, 状態: '開封済み' as const }
            : b
          )
        );
      }
      
      // 親コンポーネントに結果を通知
      onアイテム取得(box.id, 取得結果);
      
    } catch (error) {
      console.error('アイテムボックス開封エラー:', error);
      
      const エラー結果: アイテム取得イベント結果 = {
        success: false,
        message: 'アイテムの取得に失敗しました',
        error: error instanceof Error ? error.message : '不明なエラー'
      };
      
      onアイテム取得(box.id, エラー結果);
    } finally {
      set開封中ボックスID(null);
    }
  };

  /**
   * キーボードイベントの処理
   * 初学者向け：Spaceキーでアイテムボックスを開封
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        // プレイヤーに隣接している未開封のボックスを探す
        const nearbyBox = ローカルボックス一覧.find(box => 
          box.状態 === '未開封' && isPlayerNearBox(box)
        );
        
        if (nearbyBox) {
          e.preventDefault();
          openItemBox(nearbyBox);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ローカルボックス一覧, プレイヤー位置, 開封中ボックスID]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {ローカルボックス一覧.map(box => (
        <div key={box.id} className="pointer-events-auto">
          <ItemBox
            box={box}
            isNearPlayer={isPlayerNearBox(box)}
            onOpen={() => openItemBox(box)}
          />
        </div>
      ))}
    </div>
  );
}