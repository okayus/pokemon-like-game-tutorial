// 初学者向け：成功通知コンポーネント
// ユーザーの操作が成功した時に表示する通知

import { useState, useEffect } from 'react';

/**
 * 成功通知のプロパティ
 */
interface SuccessNotificationProps {
  /** 成功メッセージ */
  message: string;
  /** 通知を表示するか */
  show: boolean;
  /** 自動で閉じるまでの時間（ミリ秒）。0なら自動で閉じない */
  autoCloseMs?: number;
  /** 閉じる時の処理 */
  onClose: () => void;
  /** アクションボタンを表示するか */
  showAction?: boolean;
  /** アクションボタンのラベル */
  actionLabel?: string;
  /** アクションボタンがクリックされた時の処理 */
  onAction?: () => void;
}

/**
 * 成功通知コンポーネント
 * 初学者向け：ユーザーに成功を分かりやすく伝える
 */
export function SuccessNotification({
  message,
  show,
  autoCloseMs = 3000,
  onClose,
  showAction = false,
  actionLabel = '確認',
  onAction,
}: SuccessNotificationProps) {
  const [表示中, set表示中] = useState(false);

  // 表示状態の管理
  useEffect(() => {
    if (show) {
      set表示中(true);

      // 自動クローズの設定
      if (autoCloseMs > 0) {
        const timer = setTimeout(() => {
          onClose();
        }, autoCloseMs);

        return () => clearTimeout(timer);
      }
    } else {
      set表示中(false);
    }
  }, [show, autoCloseMs, onClose]);

  // 表示されていない場合は何も描画しない
  if (!show && !表示中) {
    return null;
  }

  return (
    <>
      {/* 背景オーバーレイ */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-25 z-40 transition-opacity duration-300 ${
          show ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* 成功通知本体 */}
      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                   bg-white rounded-lg shadow-lg p-6 z-50 max-w-sm w-full mx-4
                   transition-all duration-300 ${
                     show ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                   }`}
        role="dialog"
        aria-live="polite"
        aria-labelledby="success-title"
      >
        <div className="text-center">
          {/* 成功アイコン */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <span className="text-2xl" role="img" aria-label="成功">
              ✅
            </span>
          </div>

          {/* 成功メッセージ */}
          <h3 id="success-title" className="text-lg font-semibold text-gray-900 mb-2">
            成功しました
          </h3>
          <p className="text-gray-600 mb-6">{message}</p>

          {/* アクションボタン */}
          <div className="flex gap-3 justify-center">
            {showAction && onAction && (
              <button
                onClick={() => {
                  onAction();
                  onClose();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {actionLabel}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * 成功通知を管理するカスタムフック
 * 初学者向け：成功通知の状態管理を簡素化
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useSuccessNotification() {
  const [通知状態, set通知状態] = useState<{
    表示中: boolean;
    メッセージ: string;
    アクション?: {
      ラベル: string;
      実行: () => void;
    };
  }>({
    表示中: false,
    メッセージ: '',
  });

  // 成功通知を表示する関数
  const 成功通知表示 = (メッセージ: string, アクション?: { ラベル: string; 実行: () => void }) => {
    set通知状態({
      表示中: true,
      メッセージ,
      アクション,
    });
  };

  // 成功通知を閉じる関数
  const 成功通知を閉じる = () => {
    set通知状態((prev) => ({
      ...prev,
      表示中: false,
    }));
  };

  return {
    通知状態,
    成功通知表示,
    成功通知を閉じる,
  };
}
