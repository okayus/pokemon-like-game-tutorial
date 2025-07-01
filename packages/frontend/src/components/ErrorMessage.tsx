// 初学者向け：統一されたエラーメッセージコンポーネント
// アプリケーション全体で使用する共通のエラー表示

/**
 * エラーメッセージのプロパティ
 */
interface ErrorMessageProps {
  /** エラーメッセージ */
  message: string;
  /** エラーの種類 */
  type?: 'error' | 'warning' | 'info';
  /** 再試行ボタンを表示するか */
  showRetry?: boolean;
  /** 再試行ボタンのラベル */
  retryLabel?: string;
  /** 再試行ボタンがクリックされた時の処理 */
  onRetry?: () => void;
  /** エラーを閉じる処理 */
  onClose?: () => void;
  /** フルスクリーン表示かどうか */
  fullScreen?: boolean;
}

/**
 * 統一されたエラーメッセージコンポーネント
 * 初学者向け：一貫したエラー表示体験を提供
 */
export function ErrorMessage({
  message,
  type = 'error',
  showRetry = false,
  retryLabel = '再試行',
  onRetry,
  onClose,
  fullScreen = false
}: ErrorMessageProps) {
  // エラータイプに応じたスタイル設定
  const スタイル設定 = {
    error: {
      背景色: 'bg-red-50',
      ボーダー色: 'border-red-200',
      テキスト色: 'text-red-700',
      アイコン: '❌'
    },
    warning: {
      背景色: 'bg-yellow-50',
      ボーダー色: 'border-yellow-200', 
      テキスト色: 'text-yellow-700',
      アイコン: '⚠️'
    },
    info: {
      背景色: 'bg-blue-50',
      ボーダー色: 'border-blue-200',
      テキスト色: 'text-blue-700',
      アイコン: 'ℹ️'
    }
  }[type];

  // エラーメッセージの基本コンポーネント
  const エラー本体 = (
    <div 
      className={`${スタイル設定.背景色} ${スタイル設定.ボーダー色} border rounded-lg p-4 relative`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        {/* エラーアイコン */}
        <span 
          className="mr-3 text-lg flex-shrink-0"
          role="img"
          aria-label={`${type}アイコン`}
        >
          {スタイル設定.アイコン}
        </span>
        
        {/* エラーメッセージ */}
        <div className="flex-1">
          <p className={`${スタイル設定.テキスト色} text-sm md:text-base leading-relaxed`}>
            {message}
          </p>
          
          {/* 再試行ボタン */}
          {showRetry && onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                {retryLabel}
              </button>
            </div>
          )}
        </div>
        
        {/* 閉じるボタン */}
        {onClose && (
          <button
            onClick={onClose}
            className={`${スタイル設定.テキスト色} hover:opacity-70 transition-opacity ml-3 flex-shrink-0`}
            aria-label="エラーメッセージを閉じる"
          >
            <span className="text-lg">×</span>
          </button>
        )}
      </div>
    </div>
  );

  // フルスクリーン表示の場合
  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {エラー本体}
        </div>
      </div>
    );
  }

  // 通常の表示
  return エラー本体;
}

/**
 * エラー境界用のフォールバックコンポーネント
 * 初学者向け：予期しないエラーが発生した時の表示
 */
export function ErrorFallback({ 
  error, 
  resetError 
}: { 
  error: Error; 
  resetError: () => void; 
}) {
  return (
    <ErrorMessage
      message={`予期しないエラーが発生しました: ${error.message}`}
      type="error"
      showRetry={true}
      retryLabel="リロード"
      onRetry={resetError}
      fullScreen={true}
    />
  );
}