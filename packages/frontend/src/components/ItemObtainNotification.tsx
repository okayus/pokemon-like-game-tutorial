// 初学者向け：アイテム取得通知コンポーネント
// アイテムを取得した時に表示される通知UI

import { useEffect, useState } from 'react';
import type { アイテム取得イベント結果 } from '@pokemon-like-game-tutorial/shared';

/**
 * アイテム取得通知のプロパティ
 */
interface ItemObtainNotificationProps {
  /** 表示する取得結果 */
  result: アイテム取得イベント結果 | null;
  /** 通知を閉じる時の処理 */
  onClose: () => void;
  /** 自動で閉じるまでの時間（ミリ秒） */
  autoCloseMs?: number;
}

/**
 * アイテム取得通知コンポーネント
 * 初学者向け：画面中央に表示される取得通知
 */
export function ItemObtainNotification({ 
  result, 
  onClose,
  autoCloseMs = 3000 
}: ItemObtainNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // 結果が変更されたら表示
  useEffect(() => {
    if (result) {
      setIsVisible(true);
      setIsClosing(false);
      
      // 自動クローズの設定
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseMs);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [result, autoCloseMs]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300); // アニメーション時間
  };

  if (!isVisible || !result) return null;

  return (
    <>
      {/* 背景オーバーレイ */}
      <div 
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      {/* 通知本体 */}
      <div
        className={`fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                   bg-white rounded-lg shadow-2xl p-6 z-50 max-w-md w-full mx-4
                   transition-all duration-300 ${
          isClosing 
            ? 'opacity-0 scale-95' 
            : 'opacity-100 scale-100'
        }`}
      >
        {/* アイコンとタイトル */}
        <div className="text-center mb-4">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
            result.success ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <span className="text-3xl">
              {result.success ? '🎉' : '❌'}
            </span>
          </div>
          
          <h3 className={`text-xl font-bold ${
            result.success ? 'text-green-700' : 'text-red-700'
          }`}>
            {result.success ? 'アイテム取得！' : '取得失敗'}
          </h3>
        </div>

        {/* メッセージ */}
        <p className="text-center text-gray-700 mb-4">
          {result.message}
        </p>

        {/* アイテム詳細（成功時のみ） */}
        {result.success && result.item && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center space-x-3">
              {result.item.icon_url && (
                <img 
                  src={result.item.icon_url} 
                  alt={result.item.name}
                  className="w-12 h-12"
                />
              )}
              <div className="text-center">
                <p className="font-semibold text-gray-800">
                  {result.item.name}
                </p>
                <p className="text-sm text-gray-600">
                  ×{result.item.quantity}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* エラー詳細（失敗時のみ） */}
        {!result.success && result.error && (
          <div className="bg-red-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-700">
              {result.error}
            </p>
          </div>
        )}

        {/* 閉じるボタン */}
        <button
          onClick={handleClose}
          className={`w-full py-2 px-4 rounded-lg font-bold transition-colors ${
            result.success 
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          OK
        </button>
      </div>
    </>
  );
}

/**
 * アイテム取得通知を管理するカスタムフック
 * 初学者向け：通知の状態管理を簡単にする
 */
export function useItemObtainNotification() {
  const [currentResult, setCurrentResult] = useState<アイテム取得イベント結果 | null>(null);

  const showNotification = (result: アイテム取得イベント結果) => {
    setCurrentResult(result);
  };

  const hideNotification = () => {
    setCurrentResult(null);
  };

  return {
    currentResult,
    showNotification,
    hideNotification
  };
}