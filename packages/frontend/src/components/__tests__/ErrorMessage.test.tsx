// 初学者向け：ErrorMessageコンポーネントのテスト
// 統一されたエラー表示の動作を確認

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorMessage, ErrorFallback } from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('基本的なエラーメッセージが表示される', () => {
    const エラーメッセージ = 'データの取得に失敗しました';
    render(<ErrorMessage message={エラーメッセージ} />);

    expect(screen.getByText(エラーメッセージ)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByLabelText('errorアイコン')).toBeInTheDocument();
  });

  it('エラータイプによってスタイルが変更される', () => {
    const { rerender } = render(<ErrorMessage message="テスト" type="error" />);
    let alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-red-50', 'border-red-200');
    expect(screen.getByLabelText('errorアイコン')).toBeInTheDocument();

    rerender(<ErrorMessage message="テスト" type="warning" />);
    alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-yellow-50', 'border-yellow-200');
    expect(screen.getByLabelText('warningアイコン')).toBeInTheDocument();

    rerender(<ErrorMessage message="テスト" type="info" />);
    alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-blue-50', 'border-blue-200');
    expect(screen.getByLabelText('infoアイコン')).toBeInTheDocument();
  });

  it('再試行ボタンが正しく動作する', () => {
    const onRetry = vi.fn();
    const retryLabel = 'もう一度試す';

    render(
      <ErrorMessage
        message="テストエラー"
        showRetry={true}
        retryLabel={retryLabel}
        onRetry={onRetry}
      />
    );

    const retryButton = screen.getByRole('button', { name: retryLabel });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('閉じるボタンが正しく動作する', () => {
    const onClose = vi.fn();

    render(<ErrorMessage message="テストエラー" onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: 'エラーメッセージを閉じる' });
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('フルスクリーン表示の場合の構造が正しい', () => {
    render(<ErrorMessage message="テストエラー" fullScreen={true} />);

    const container = screen.getByRole('alert').closest('.min-h-screen');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass(
      'min-h-screen',
      'bg-gray-50',
      'flex',
      'items-center',
      'justify-center'
    );
  });

  it('アクセシビリティ属性が正しく設定されている', () => {
    render(<ErrorMessage message="テストエラー" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });
});

describe('ErrorFallback', () => {
  it('エラー情報が正しく表示される', () => {
    const testError = new Error('テストエラーメッセージ');
    const resetError = vi.fn();

    render(<ErrorFallback error={testError} resetError={resetError} />);

    expect(
      screen.getByText(/予期しないエラーが発生しました: テストエラーメッセージ/)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'リロード' })).toBeInTheDocument();
  });

  it('リロードボタンが正しく動作する', () => {
    const testError = new Error('テストエラー');
    const resetError = vi.fn();

    render(<ErrorFallback error={testError} resetError={resetError} />);

    const reloadButton = screen.getByRole('button', { name: 'リロード' });
    fireEvent.click(reloadButton);

    expect(resetError).toHaveBeenCalledTimes(1);
  });
});
