// 初学者向け：SuccessNotificationコンポーネントのテスト
// 成功通知の動作を確認

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SuccessNotification, useSuccessNotification } from '../SuccessNotification';

// タイマーのモック
vi.useFakeTimers();

describe('SuccessNotification', () => {
  const mockOnClose = vi.fn();
  const mockOnAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('通知が表示される', () => {
    const メッセージ = 'ポケモンの捕獲に成功しました！';
    render(<SuccessNotification message={メッセージ} show={true} onClose={mockOnClose} />);

    expect(screen.getByText('成功しました')).toBeInTheDocument();
    expect(screen.getByText(メッセージ)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('成功')).toBeInTheDocument();
  });

  it('show=falseの時は何も表示されない', () => {
    render(<SuccessNotification message="テスト" show={false} onClose={mockOnClose} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('閉じるボタンが正しく動作する', () => {
    render(<SuccessNotification message="テスト" show={true} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: '閉じる' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('背景オーバーレイクリックで閉じる', () => {
    render(<SuccessNotification message="テスト" show={true} onClose={mockOnClose} />);

    const overlay = document.querySelector('.fixed.inset-0.bg-black');
    expect(overlay).toBeInTheDocument();

    fireEvent.click(overlay!);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('アクションボタンが表示され、正しく動作する', () => {
    const actionLabel = 'ポケモンを確認';
    render(
      <SuccessNotification
        message="テスト"
        show={true}
        showAction={true}
        actionLabel={actionLabel}
        onAction={mockOnAction}
        onClose={mockOnClose}
      />
    );

    const actionButton = screen.getByRole('button', { name: actionLabel });
    expect(actionButton).toBeInTheDocument();

    fireEvent.click(actionButton);
    expect(mockOnAction).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('自動クローズが動作する', () => {
    render(
      <SuccessNotification message="テスト" show={true} autoCloseMs={2000} onClose={mockOnClose} />
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    // 2秒経過をシミュレート
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('autoCloseMs=0の時は自動で閉じない', () => {
    render(
      <SuccessNotification message="テスト" show={true} autoCloseMs={0} onClose={mockOnClose} />
    );

    // 10秒経過しても閉じないことを確認
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('アクセシビリティ属性が正しく設定されている', () => {
    render(<SuccessNotification message="テスト" show={true} onClose={mockOnClose} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-live', 'polite');
    expect(dialog).toHaveAttribute('aria-labelledby', 'success-title');

    const title = screen.getByText('成功しました');
    expect(title).toHaveAttribute('id', 'success-title');
  });
});

describe('useSuccessNotification', () => {
  it('初期状態が正しい', () => {
    const { result } = renderHook(() => useSuccessNotification());

    expect(result.current.通知状態.表示中).toBe(false);
    expect(result.current.通知状態.メッセージ).toBe('');
    expect(result.current.通知状態.アクション).toBeUndefined();
  });

  it('成功通知表示が正しく動作する', () => {
    const { result } = renderHook(() => useSuccessNotification());

    const テストメッセージ = 'パーティ編成が完了しました';
    const テストアクション = {
      ラベル: 'パーティを確認',
      実行: vi.fn(),
    };

    act(() => {
      result.current.成功通知表示(テストメッセージ, テストアクション);
    });

    expect(result.current.通知状態.表示中).toBe(true);
    expect(result.current.通知状態.メッセージ).toBe(テストメッセージ);
    expect(result.current.通知状態.アクション).toEqual(テストアクション);
  });

  it('成功通知を閉じるが正しく動作する', () => {
    const { result } = renderHook(() => useSuccessNotification());

    // まず通知を表示
    act(() => {
      result.current.成功通知表示('テスト');
    });

    expect(result.current.通知状態.表示中).toBe(true);

    // 通知を閉じる
    act(() => {
      result.current.成功通知を閉じる();
    });

    expect(result.current.通知状態.表示中).toBe(false);
    // メッセージとアクションは保持される
    expect(result.current.通知状態.メッセージ).toBe('テスト');
  });
});
