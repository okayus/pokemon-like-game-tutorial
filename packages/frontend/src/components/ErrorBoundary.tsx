// 初学者向け：エラー境界コンポーネント
// React アプリでエラーが発生した時の処理を管理

import React, { Component, ReactNode } from 'react';

/**
 * エラー境界の状態
 * 初学者向け：エラー発生時の情報を管理
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * エラー境界のProps
 * 初学者向け：エラー境界コンポーネントに渡す設定
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: React.ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * エラー境界コンポーネント
 * 初学者向け：Reactアプリでエラーが発生した時の安全網
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * エラーをキャッチしたときの処理
   * 初学者向け：エラーが発生した時にReactが呼び出すメソッド
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  /**
   * エラー情報をキャッチしたときの処理
   * 初学者向け：エラーの詳細情報を取得するメソッド
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // エラーログの出力
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 親コンポーネントにエラーを通知
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // エラー追跡サービスに送信（本番環境では実装）
    // 例: Sentry, Bugsnag, などのエラー追跡サービス
    // reportError(error, errorInfo);
  }

  /**
   * エラーリセット処理
   * 初学者向け：エラー状態をクリアして再試行する
   */
  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // カスタムフォールバックUIがある場合
      if (this.props.fallback && this.state.errorInfo) {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }

      // デフォルトのエラーUI
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white text-2xl">⚠️</span>
              </div>
              <h1 className="text-2xl font-bold text-red-700">
                アプリケーションエラーが発生しました
              </h1>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                申し訳ございません。予期しないエラーが発生しました。
                下記の情報を開発者に報告していただけると助かります。
              </p>

              <div className="bg-gray-100 rounded p-4 mb-4">
                <h3 className="font-bold text-gray-800 mb-2">エラー内容:</h3>
                <p className="text-red-600 font-mono text-sm break-all">
                  {this.state.error.name}: {this.state.error.message}
                </p>
              </div>

              {/* 開発環境でのみスタックトレースを表示 */}
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="bg-gray-100 rounded p-4">
                  <summary className="font-bold text-gray-800 cursor-pointer">
                    詳細情報（開発者向け）
                  </summary>
                  <pre className="text-xs text-gray-600 mt-2 overflow-auto">
                    {this.state.error.stack}
                  </pre>
                  <pre className="text-xs text-gray-600 mt-2 overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={this.resetError}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                再試行
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                ページを再読み込み
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                ホームに戻る
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * バトル専用エラー境界コンポーネント
 * 初学者向け：バトル画面でのエラーに特化した処理
 */
export function BattleErrorBoundary({ children }: { children: ReactNode }) {
  const handleBattleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Battle Error:', error, errorInfo);

    // バトル関連のエラーログ
    console.log('Battle context information:');
    console.log('- Current URL:', window.location.href);
    console.log('- User Agent:', navigator.userAgent);
    console.log('- Timestamp:', new Date().toISOString());
  };

  const renderBattleErrorFallback = (error: Error) => (
    <div className="min-h-screen bg-gradient-to-b from-red-200 to-red-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-3xl">💥</span>
        </div>

        <h2 className="text-2xl font-bold text-red-700 mb-4">バトルエラーが発生しました</h2>

        <p className="text-gray-700 mb-6">
          バトル中に予期しないエラーが発生しました。 ホームに戻ってもう一度お試しください。
        </p>

        <div className="space-y-3">
          <button
            onClick={() => (window.location.href = '/')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            ホームに戻る
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            ページを再読み込み
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-gray-600 cursor-pointer">開発者向け情報</summary>
            <pre className="text-xs text-gray-500 mt-2 bg-gray-100 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );

  return (
    <ErrorBoundary onError={handleBattleError} fallback={renderBattleErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}

/**
 * 非同期エラーハンドリング用フック
 * 初学者向け：Promiseのエラーをキャッチするためのユーティリティ
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAsyncError() {
  const [, setError] = React.useState();

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}

/**
 * エラー報告ユーティリティ
 * 初学者向け：エラー情報を整理して報告するヘルパー関数
 */
// eslint-disable-next-line react-refresh/only-export-components
export function reportError(error: Error, context?: Record<string, unknown>) {
  const errorReport = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    context: context || {},
  };

  // 開発環境では詳細ログを出力
  if (process.env.NODE_ENV === 'development') {
    console.group('🐛 Error Report');
    console.error('Error:', error);
    console.log('Context:', context);
    console.log('Full Report:', errorReport);
    console.groupEnd();
  }

  // 本番環境では外部エラー追跡サービスに送信
  // 例: Sentry.captureException(error, { extra: errorReport });

  return errorReport;
}

export default ErrorBoundary;
