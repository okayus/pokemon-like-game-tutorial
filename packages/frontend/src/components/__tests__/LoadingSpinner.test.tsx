// 初学者向け：LoadingSpinnerコンポーネントのテスト
// 統一されたローディング表示の動作を確認

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner, InlineSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('デフォルトメッセージでローディングスピナーが表示される', () => {
    render(<LoadingSpinner />);

    // デフォルトメッセージが表示されることを確認
    expect(screen.getByText('データを読み込んでいます...')).toBeInTheDocument();

    // スピナー要素が存在することを確認
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText('読み込み中')).toBeInTheDocument();
  });

  it('カスタムメッセージが正しく表示される', () => {
    const カスタムメッセージ = 'ポケモンデータを取得しています...';
    render(<LoadingSpinner message={カスタムメッセージ} />);

    expect(screen.getByText(カスタムメッセージ)).toBeInTheDocument();
  });

  it('サイズによってスピナーのクラスが変更される', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    let spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-6', 'w-6');

    rerender(<LoadingSpinner size="medium" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-12', 'w-12');

    rerender(<LoadingSpinner size="large" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-16', 'w-16');
  });

  it('フルスクリーン表示の場合の構造が正しい', () => {
    render(<LoadingSpinner fullScreen={true} />);

    // フルスクリーン用のコンテナが存在することを確認
    const container = screen.getByRole('status').closest('.min-h-screen');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass(
      'min-h-screen',
      'bg-gray-50',
      'flex',
      'items-center',
      'justify-center'
    );
  });

  it('通常表示の場合の構造が正しい', () => {
    render(<LoadingSpinner fullScreen={false} />);

    // 通常表示用のコンテナが存在することを確認
    const container = screen.getByRole('status').closest('.flex');
    expect(container).toHaveClass('flex', 'items-center', 'justify-center', 'py-8');
    expect(container).not.toHaveClass('min-h-screen');
  });
});

describe('InlineSpinner', () => {
  it('インラインスピナーが正しく表示される', () => {
    render(<InlineSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin', 'h-4', 'w-4', 'inline-block');
    expect(screen.getByLabelText('処理中')).toBeInTheDocument();
  });

  it('アクセシビリティ属性が正しく設定されている', () => {
    render(<InlineSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', '処理中');

    // スクリーンリーダー用のテキストが存在することを確認
    expect(screen.getByText('処理中...')).toHaveClass('sr-only');
  });
});
