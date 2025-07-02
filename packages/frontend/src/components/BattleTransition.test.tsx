// 初学者向け：バトル演出コンポーネントのテスト
// TDDアプローチでバトル演出をテスト

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { BattleTransition, BattleTransitionSequence } from './BattleTransition';

// タイマーのモック
vi.useFakeTimers();

describe('BattleTransition', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    mockOnComplete.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('基本表示', () => {
    it('非表示状態では何も表示されない', () => {
      const { container } = render(
        <BattleTransition
          type="バトル開始"
          isVisible={false}
          onComplete={mockOnComplete}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('表示状態で演出が表示される', () => {
      const { container } = render(
        <BattleTransition
          type="バトル開始"
          isVisible={true}
          onComplete={mockOnComplete}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('演出タイプ', () => {
    it('バトル開始演出が正しく表示される', async () => {
      render(
        <BattleTransition
          type="バトル開始"
          isVisible={true}
          playerName="サトシ"
          enemyName="野生のピカチュウ"
          onComplete={mockOnComplete}
        />
      );

      // テキスト表示まで進める
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText('バトル開始！')).toBeInTheDocument();
      expect(screen.getByText('サトシ VS 野生のピカチュウ')).toBeInTheDocument();
    });

    it('勝利演出が正しく表示される', () => {
      render(
        <BattleTransition
          type="勝利"
          isVisible={true}
          enemyName="野生のポッポ"
          onComplete={mockOnComplete}
        />
      );

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText('勝利！')).toBeInTheDocument();
      expect(screen.getByText('野生のポッポを倒した！')).toBeInTheDocument();
      expect(screen.getByText('経験値を獲得！')).toBeInTheDocument();
    });

    it('敗北演出が正しく表示される', () => {
      render(
        <BattleTransition
          type="敗北"
          isVisible={true}
          playerName="サトシ"
          onComplete={mockOnComplete}
        />
      );

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText('敗北...')).toBeInTheDocument();
      expect(screen.getByText('サトシは倒れた...')).toBeInTheDocument();
      expect(screen.getByText('ポケモンセンターへ急ごう')).toBeInTheDocument();
    });

    it('逃走演出が正しく表示される', () => {
      render(
        <BattleTransition
          type="逃走"
          isVisible={true}
          onComplete={mockOnComplete}
        />
      );

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText('逃げ出した！')).toBeInTheDocument();
      expect(screen.getByText('うまく逃げ切った！')).toBeInTheDocument();
    });

    it('バトル終了演出が正しく表示される', () => {
      render(
        <BattleTransition
          type="バトル終了"
          isVisible={true}
          onComplete={mockOnComplete}
        />
      );

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText('バトル終了')).toBeInTheDocument();
    });
  });

  describe('演出フェーズ', () => {
    it('エフェクトが段階的に表示される', () => {
      const { container } = render(
        <BattleTransition
          type="バトル開始"
          isVisible={true}
          onComplete={mockOnComplete}
        />
      );

      // 初期状態（入場フェーズ）
      expect(container.innerHTML).toContain('bg-gradient-to-br');

      // テキスト表示フェーズ
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText('バトル開始！')).toBeInTheDocument();

      // エフェクト表示フェーズ
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // エフェクトが表示されることを確認（浮遊エフェクト）
      const floatingEffects = container.querySelectorAll('.animate-bounce');
      expect(floatingEffects.length).toBeGreaterThan(0);
    });

    it('指定した時間後にonCompleteが呼ばれる', () => {
      render(
        <BattleTransition
          type="バトル開始"
          isVisible={true}
          duration={2000}
          onComplete={mockOnComplete}
        />
      );

      expect(mockOnComplete).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('デフォルトの時間（3000ms）後にonCompleteが呼ばれる', () => {
      render(
        <BattleTransition
          type="バトル開始"
          isVisible={true}
          onComplete={mockOnComplete}
        />
      );

      act(() => {
        vi.advanceTimersByTime(2999);
      });
      expect(mockOnComplete).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('デフォルト値', () => {
    it('プレイヤー名とエネミー名のデフォルト値が使用される', () => {
      render(
        <BattleTransition
          type="バトル開始"
          isVisible={true}
          onComplete={mockOnComplete}
        />
      );

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText('プレイヤー VS 野生のポケモン')).toBeInTheDocument();
    });
  });

  describe('状態リセット', () => {
    it('非表示になった場合は状態がリセットされる', () => {
      const { rerender } = render(
        <BattleTransition
          type="バトル開始"
          isVisible={true}
          onComplete={mockOnComplete}
        />
      );

      // 演出を進行
      act(() => {
        vi.advanceTimersByTime(600);
      });

      // 非表示に変更
      rerender(
        <BattleTransition
          type="バトル開始"
          isVisible={false}
          onComplete={mockOnComplete}
        />
      );

      // onCompleteが呼ばれないことを確認
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(mockOnComplete).not.toHaveBeenCalled();
    });
  });
});

describe('BattleTransitionSequence', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    mockOnComplete.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('シーケンス再生', () => {
    it('複数の演出が順次表示される', () => {
      const transitions = [
        { type: 'バトル開始' as const, duration: 1000 },
        { type: '勝利' as const, duration: 1000 }
      ];

      render(
        <BattleTransitionSequence
          transitions={transitions}
          onComplete={mockOnComplete}
        />
      );

      // 最初の演出が表示される
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.getByText('バトル開始！')).toBeInTheDocument();

      // 最初の演出完了
      act(() => {
        vi.advanceTimersByTime(700);
      });

      // 2番目の演出が表示される
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.getByText('勝利！')).toBeInTheDocument();

      // まだonCompleteは呼ばれない
      expect(mockOnComplete).not.toHaveBeenCalled();

      // 2番目の演出完了
      act(() => {
        vi.advanceTimersByTime(700);
      });

      // 全演出完了でonCompleteが呼ばれる
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('空の演出配列でも正常に動作する', () => {
      const { container } = render(
        <BattleTransitionSequence
          transitions={[]}
          onComplete={mockOnComplete}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('単一の演出が正常に表示・完了する', () => {
      const transitions = [
        { 
          type: '勝利' as const, 
          playerName: 'テストプレイヤー',
          enemyName: 'テストエネミー',
          duration: 1500 
        }
      ];

      render(
        <BattleTransitionSequence
          transitions={transitions}
          onComplete={mockOnComplete}
        />
      );

      // 演出表示
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.getByText('勝利！')).toBeInTheDocument();

      // 演出完了
      act(() => {
        vi.advanceTimersByTime(1200);
      });
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('演出パラメータ', () => {
    it('各演出のパラメータが正しく渡される', () => {
      const transitions = [
        {
          type: 'バトル開始' as const,
          playerName: 'カスタムプレイヤー',
          enemyName: 'カスタムエネミー',
          duration: 800
        }
      ];

      render(
        <BattleTransitionSequence
          transitions={transitions}
          onComplete={mockOnComplete}
        />
      );

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText('カスタムプレイヤー VS カスタムエネミー')).toBeInTheDocument();

      // カスタム時間で完了
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });
});