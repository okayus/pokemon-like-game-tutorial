// 初学者向け：統一されたローディングスピナーコンポーネント
// アプリケーション全体で使用する共通のローディング表示

/**
 * ローディングスピナーのプロパティ
 */
interface LoadingSpinnerProps {
  /** ローディングメッセージ（オプション） */
  message?: string;
  /** スピナーのサイズ */
  size?: 'small' | 'medium' | 'large';
  /** フルスクリーン表示かどうか */
  fullScreen?: boolean;
}

/**
 * 統一されたローディングスピナーコンポーネント
 * 初学者向け：一貫したローディング体験を提供
 */
export function LoadingSpinner({
  message = 'データを読み込んでいます...',
  size = 'medium',
  fullScreen = false,
}: LoadingSpinnerProps) {
  // サイズに応じたクラス設定
  const スピナーサイズクラス = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16',
  }[size];

  // スピナーの基本コンポーネント
  const スピナー本体 = (
    <div className="text-center">
      <div
        role="status"
        className={`animate-spin rounded-full border-b-2 border-blue-500 mx-auto mb-4 ${スピナーサイズクラス}`}
        aria-label="読み込み中"
      >
        <span className="sr-only">読み込み中...</span>
      </div>
      <p className="text-gray-600 text-sm md:text-base">{message}</p>
    </div>
  );

  // フルスクリーン表示の場合
  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">{スピナー本体}</div>
    );
  }

  // 通常の表示
  return <div className="flex items-center justify-center py-8">{スピナー本体}</div>;
}

/**
 * インライン用の小さなローディング表示
 * 初学者向け：ボタン内などで使用する小さなスピナー
 */
export function InlineSpinner() {
  return (
    <div
      className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block"
      role="status"
      aria-label="処理中"
    >
      <span className="sr-only">処理中...</span>
    </div>
  );
}
