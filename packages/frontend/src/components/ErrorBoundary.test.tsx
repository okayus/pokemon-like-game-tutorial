// 初学者向け：エラー境界コンポーネントのテスト
// TDDアプローチでエラーハンドリングをテスト

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, BattleErrorBoundary, useAsyncError, reportError } from './ErrorBoundary';

// console.errorのモック（エラー境界のテスト時にコンソールが汚れるのを防ぐ）
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalError;
});

// エラーをスローするテスト用コンポーネント
const ErrorThrowingComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Normal component</div>;
};

// 非同期エラーをスローするテスト用コンポーネント
const AsyncErrorComponent = () => {
  const throwAsyncError = useAsyncError();
  
  const handleClick = () => {
    throwAsyncError(new Error('Async test error'));
  };
  
  return <button onClick={handleClick}>Trigger Async Error</button>;
};

describe('ErrorBoundary', () => {
  describe('正常動作', () => {
    it('エラーが発生しない場合は子コンポーネントを表示する', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Normal component')).toBeInTheDocument();
    });
  });

  describe('エラーキャッチ', () => {
    it('子コンポーネントでエラーが発生した場合にエラーUIを表示する', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('アプリケーションエラーが発生しました')).toBeInTheDocument();
      expect(screen.getByText(/Error: Test error message/)).toBeInTheDocument();
    });

    it('onErrorコールバックが呼ばれる', () => {
      const mockOnError = vi.fn();
      
      render(
        <ErrorBoundary onError={mockOnError}>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(mockOnError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );
    });

    it('カスタムフォールバックUIが表示される', () => {
      const customFallback = (error: Error) => (
        <div>Custom error: {error.message}</div>
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error: Test error message')).toBeInTheDocument();
    });
  });

  describe('エラー回復', () => {
    it('再試行ボタンでエラー状態がリセットされる', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      // エラーUIが表示される
      expect(screen.getByText('アプリケーションエラーが発生しました')).toBeInTheDocument();

      // 再試行ボタンをクリック
      fireEvent.click(screen.getByText('再試行'));

      // エラーがリセットされ、子コンポーネントが再レンダリングされる
      rerender(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Normal component')).toBeInTheDocument();
    });

    it('ページ再読み込みボタンが動作する', () => {
      // window.location.reloadのモック
      const mockReload = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true
      });

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByText('ページを再読み込み'));
      expect(mockReload).toHaveBeenCalled();
    });

    it('ホームに戻るボタンが動作する', () => {
      // window.location.hrefのモック
      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true
      });

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByText('ホームに戻る'));
      expect(mockLocation.href).toBe('/');
    });
  });

  describe('開発環境での詳細情報表示', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('開発環境でスタックトレースが表示される', () => {
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('詳細情報（開発者向け）')).toBeInTheDocument();
    });

    it('本番環境でスタックトレースが表示されない', () => {
      process.env.NODE_ENV = 'production';

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByText('詳細情報（開発者向け）')).not.toBeInTheDocument();
    });
  });
});

describe('BattleErrorBoundary', () => {
  it('バトル専用のエラーUIが表示される', () => {
    render(
      <BattleErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </BattleErrorBoundary>
    );

    expect(screen.getByText('バトルエラーが発生しました')).toBeInTheDocument();
    expect(screen.getByText('バトル中に予期しないエラーが発生しました。')).toBeInTheDocument();
  });

  it('ホームに戻るボタンが動作する', () => {
    const mockLocation = { href: '' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    });

    render(
      <BattleErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </BattleErrorBoundary>
    );

    fireEvent.click(screen.getByText('ホームに戻る'));
    expect(mockLocation.href).toBe('/');
  });
});

describe('useAsyncError', () => {
  it('非同期エラーをエラー境界にスローできる', () => {
    render(
      <ErrorBoundary>
        <AsyncErrorComponent />
      </ErrorBoundary>
    );

    // 最初は正常に表示される
    expect(screen.getByText('Trigger Async Error')).toBeInTheDocument();

    // ボタンをクリックして非同期エラーを発生させる
    fireEvent.click(screen.getByText('Trigger Async Error'));

    // エラー境界がエラーをキャッチしてエラーUIを表示する
    expect(screen.getByText('アプリケーションエラーが発生しました')).toBeInTheDocument();
    expect(screen.getByText(/Error: Async test error/)).toBeInTheDocument();
  });
});

describe('reportError', () => {
  beforeEach(() => {
    // console.groupとconsole.groupEndのモック
    console.group = vi.fn();
    console.groupEnd = vi.fn();
    console.log = vi.fn();
  });

  it('エラーレポートが正しく生成される', () => {
    const error = new Error('Test error for reporting');
    const context = { userId: '123', action: 'battle_start' };

    const report = reportError(error, context);

    expect(report).toEqual({
      message: 'Test error for reporting',
      stack: error.stack,
      name: 'Error',
      timestamp: expect.any(String),
      url: expect.any(String),
      userAgent: expect.any(String),
      context: context
    });
  });

  it('開発環境でコンソールログが出力される', () => {
    process.env.NODE_ENV = 'development';
    
    const error = new Error('Test console error');
    reportError(error);

    expect(console.group).toHaveBeenCalledWith('🐛 Error Report');
    expect(console.error).toHaveBeenCalledWith('Error:', error);
    expect(console.groupEnd).toHaveBeenCalled();
  });

  it('コンテキストなしでも動作する', () => {
    const error = new Error('Test error without context');
    const report = reportError(error);

    expect(report.context).toEqual({});
    expect(report.message).toBe('Test error without context');
  });
});