// 初学者向け：フッターエリア用の対話コンテンツコンポーネント
// フッターエリアに収まるようにデザインされた対話表示です

import { useState, useEffect } from 'react';
import { 対話メッセージ, メッセージタイプ, 選択肢 } from '@pokemon-like-game-tutorial/shared';

/**
 * フッター対話コンテンツのプロパティ
 * 初学者向け：親コンポーネントから受け取るデータの型定義です
 */
interface FooterDialogContentProps {
  /** 現在表示するメッセージ */
  現在のメッセージ?: 対話メッセージ;
  /** 選択肢が選ばれた時のコールバック */
  選択肢を選択: (選択肢: 選択肢) => void;
  /** 次のメッセージへ進む時のコールバック */
  次のメッセージへ: () => void;
  /** 対話を終了する時のコールバック */
  対話終了: () => void;
}

/**
 * フッター対話コンテンツコンポーネント
 * 初学者向け：フッターエリアに最適化された対話表示です
 */
export default function FooterDialogContent({
  現在のメッセージ,
  選択肢を選択,
  次のメッセージへ,
  対話終了,
}: FooterDialogContentProps) {
  // 初学者向け：タイピングエフェクトの状態管理
  const [表示テキスト, set表示テキスト] = useState<string>('');
  const [タイピング完了, setタイピング完了] = useState<boolean>(false);
  const [選択中の選択肢, set選択中の選択肢] = useState<number>(0);

  /**
   * タイピングエフェクトの実装
   * 初学者向け：文字を1文字ずつ表示する処理です
   */
  useEffect(() => {
    if (!現在のメッセージ) {
      set表示テキスト('');
      setタイピング完了(false);
      return;
    }

    // タイピングエフェクトの初期化
    set表示テキスト('');
    setタイピング完了(false);
    set選択中の選択肢(0);

    let 文字インデックス = 0;
    const 全テキスト = 現在のメッセージ.テキスト;

    // 初学者向け：setIntervalで一定間隔で文字を追加
    const タイピングタイマー = setInterval(() => {
      if (文字インデックス < 全テキスト.length) {
        set表示テキスト(全テキスト.slice(0, 文字インデックス + 1));
        文字インデックス++;
      } else {
        // タイピング完了
        setタイピング完了(true);
        clearInterval(タイピングタイマー);
      }
    }, 30); // フッター用に少し速く

    // クリーンアップ関数（初学者向け：メモリリークを防ぐため）
    return () => clearInterval(タイピングタイマー);
  }, [現在のメッセージ]);

  /**
   * キーボード操作の処理
   * 初学者向け：矢印キーとEnterキーでの操作を実装
   */
  useEffect(() => {
    const キー操作処理 = (e: KeyboardEvent) => {
      if (!現在のメッセージ) return;

      // タイピング中の場合はスキップ機能
      if (!タイピング完了 && (e.key === 'Enter' || e.key === ' ')) {
        set表示テキスト(現在のメッセージ.テキスト);
        setタイピング完了(true);
        return;
      }

      // 選択肢がある場合の処理
      if (
        現在のメッセージ.タイプ === メッセージタイプ.選択肢 &&
        現在のメッセージ.選択肢 &&
        タイピング完了
      ) {
        const 選択肢数 = 現在のメッセージ.選択肢.length;

        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            set選択中の選択肢((prev) => (prev > 0 ? prev - 1 : 選択肢数 - 1));
            break;
          case 'ArrowDown':
            e.preventDefault();
            set選択中の選択肢((prev) => (prev < 選択肢数 - 1 ? prev + 1 : 0));
            break;
          case 'Enter':
            e.preventDefault();
            選択肢を選択(現在のメッセージ.選択肢[選択中の選択肢]);
            break;
          case 'Escape':
            e.preventDefault();
            対話終了();
            break;
        }
      } else if (タイピング完了) {
        // 通常メッセージの場合
        switch (e.key) {
          case 'Enter':
          case ' ':
            e.preventDefault();
            if (現在のメッセージ.次のメッセージ) {
              次のメッセージへ();
            } else {
              対話終了();
            }
            break;
          case 'Escape':
            e.preventDefault();
            対話終了();
            break;
        }
      }
    };

    window.addEventListener('keydown', キー操作処理);
    return () => window.removeEventListener('keydown', キー操作処理);
  }, [現在のメッセージ, タイピング完了, 選択中の選択肢, 選択肢を選択, 次のメッセージへ, 対話終了]);

  if (!現在のメッセージ) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">対話を準備中...</div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* メッセージテキスト */}
      <div className="flex-1 flex items-start">
        <div className="text-white text-base leading-relaxed whitespace-pre-line">
          {表示テキスト}
          {/* タイピング中のカーソル */}
          {!タイピング完了 && <span className="animate-pulse text-blue-400">|</span>}
        </div>
      </div>

      {/* 選択肢の表示 */}
      {現在のメッセージ.タイプ === メッセージタイプ.選択肢 &&
        現在のメッセージ.選択肢 &&
        タイピング完了 && (
          <div className="mt-4 space-y-2">
            {現在のメッセージ.選択肢.map((選択肢, index) => (
              <button
                key={選択肢.id}
                className={`w-full text-left p-2 rounded transition-all duration-150 ${
                  index === 選択中の選択肢
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                onClick={() => 選択肢を選択(選択肢)}
                onMouseEnter={() => set選択中の選択肢(index)}
              >
                <span className="text-blue-400 mr-2 text-sm">▶</span>
                <span className="text-sm">{選択肢.テキスト}</span>
              </button>
            ))}
          </div>
        )}

      {/* 操作ガイド（下部） */}
      <div className="border-t border-slate-700 pt-2 mt-2">
        <div className="text-slate-400 text-xs text-center">
          {!タイピング完了 ? (
            <span>Enter/スペース: スキップ</span>
          ) : 現在のメッセージ.タイプ === メッセージタイプ.選択肢 ? (
            <span>↑↓: 選択 | Enter: 決定 | Esc: 終了</span>
          ) : (
            <span>
              Enter/スペース: {現在のメッセージ.次のメッセージ ? '次へ' : '終了'} | Esc: 終了
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
