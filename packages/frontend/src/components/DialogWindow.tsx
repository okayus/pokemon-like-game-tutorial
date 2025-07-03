// 初学者向け：対話ウィンドウコンポーネント
// NPCとの会話を表示するUIコンポーネントです

import { useState, useEffect } from 'react';
import { 対話メッセージ, メッセージタイプ, 選択肢 } from '@pokemon-like-game-tutorial/shared';

/**
 * 対話ウィンドウのプロパティ
 * 初学者向け：親コンポーネントから受け取るデータの型定義です
 */
interface DialogWindowProps {
  /** 対話ウィンドウが表示されているかどうか */
  表示中: boolean;
  /** 現在表示するメッセージ */
  現在のメッセージ?: 対話メッセージ;
  /** NPCの名前 */
  NPC名?: string;
  /** タイピングエフェクトを使用するかどうか */
  タイピングエフェクト: boolean;
  /** タイピング速度（ミリ秒） */
  タイピング速度?: number;
  /** 選択肢が選ばれた時のコールバック */
  選択肢選択: (選択肢: 選択肢) => void;
  /** 次のメッセージへ進む時のコールバック */
  次へ進む: () => void;
  /** 対話を終了する時のコールバック */
  対話終了: () => void;
}

/**
 * 対話ウィンドウコンポーネント
 * 初学者向け：NPCとの会話を美しく表示するコンポーネントです
 */
export default function DialogWindow({
  表示中,
  現在のメッセージ,
  NPC名,
  タイピングエフェクト,
  タイピング速度 = 50,
  選択肢選択,
  次へ進む,
  対話終了,
}: DialogWindowProps) {
  // 初学者向け：タイピングエフェクトの状態管理
  const [表示テキスト, set表示テキスト] = useState<string>('');
  const [タイピング完了, setタイピング完了] = useState<boolean>(false);
  const [選択中の選択肢, set選択中の選択肢] = useState<number>(0);

  /**
   * タイピングエフェクトの実装
   * 初学者向け：文字を1文字ずつ表示する処理です
   */
  useEffect(() => {
    if (!現在のメッセージ || !タイピングエフェクト) {
      // タイピングエフェクトを使わない場合は全文を即座に表示
      set表示テキスト(現在のメッセージ?.テキスト || '');
      setタイピング完了(true);
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
    }, タイピング速度);

    // クリーンアップ関数（初学者向け：メモリリークを防ぐため）
    return () => clearInterval(タイピングタイマー);
  }, [現在のメッセージ, タイピングエフェクト, タイピング速度]);

  /**
   * キーボード操作の処理
   * 初学者向け：矢印キーとEnterキーでの操作を実装
   */
  useEffect(() => {
    const キー操作処理 = (e: KeyboardEvent) => {
      if (!表示中 || !現在のメッセージ) return;

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
            選択肢選択(現在のメッセージ.選択肢[選択中の選択肢]);
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
              次へ進む();
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

    if (表示中) {
      window.addEventListener('keydown', キー操作処理);
    }

    return () => window.removeEventListener('keydown', キー操作処理);
  }, [表示中, 現在のメッセージ, タイピング完了, 選択中の選択肢, 選択肢選択, 次へ進む, 対話終了]);

  // 対話ウィンドウが非表示の場合は何も表示しない
  if (!表示中 || !現在のメッセージ) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      {/* 背景のオーバーレイ（初学者向け：画面を暗くして対話に集中させる） */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={対話終了} />

      {/* 対話ウィンドウ本体 */}
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-slate-800 to-slate-900 rounded-t-2xl border-2 border-blue-400/50 shadow-2xl">
        {/* NPCの名前表示（上部） */}
        {NPC名 && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-t-xl">
            <p className="text-lg font-semibold">{NPC名}</p>
          </div>
        )}

        {/* メッセージ内容 */}
        <div className="p-6 min-h-[120px]">
          <div className="text-white text-lg leading-relaxed whitespace-pre-line">
            {表示テキスト}
            {/* タイピング中のカーソル */}
            {!タイピング完了 && <span className="animate-pulse text-blue-400">|</span>}
          </div>

          {/* 選択肢の表示 */}
          {現在のメッセージ.タイプ === メッセージタイプ.選択肢 &&
            現在のメッセージ.選択肢 &&
            タイピング完了 && (
              <div className="mt-6 space-y-2">
                {現在のメッセージ.選択肢.map((選択肢, index) => (
                  <button
                    key={選択肢.id}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      index === 選択中の選択肢
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    onClick={() => 選択肢選択(選択肢)}
                    onMouseEnter={() => set選択中の選択肢(index)}
                  >
                    <span className="text-blue-400 mr-2">▶</span>
                    {選択肢.テキスト}
                  </button>
                ))}
              </div>
            )}
        </div>

        {/* 操作ガイド（下部） */}
        <div className="border-t border-slate-700 px-6 py-3 bg-slate-800/50">
          <div className="text-slate-400 text-sm text-center">
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
    </div>
  );
}
