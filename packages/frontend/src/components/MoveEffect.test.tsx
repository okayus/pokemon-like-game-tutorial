// 初学者向け：技エフェクトコンポーネントのテスト
// TDDアプローチで技エフェクトをテスト

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MoveEffect, MoveEffectSequence } from './MoveEffect';

// タイマーのモック
vi.useFakeTimers();

describe('MoveEffect', () => {
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
        <MoveEffect
          type="でんき"
          isVisible={false}
          onComplete={mockOnComplete}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('表示状態でエフェクトが表示される', () => {
      const { container } = render(
        <MoveEffect
          type="でんき"
          isVisible={true}
          onComplete={mockOnComplete}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('エフェクトタイプ', () => {
    it('でんき技エフェクトが表示される', () => {
      const { container } = render(
        <MoveEffect
          type="でんき"
          isVisible={true}
          onComplete={mockOnComplete}
        />
      );

      // でんき技の特殊エフェクト（稲妻）が含まれることを確認
      expect(container.innerHTML).toContain('bg-yellow');
    });

    it('ほのお技エフェクトが表示される', () => {
      const { container } = render(
        <MoveEffect
          type="ほのお"
          isVisible={true}
          onComplete={mockOnComplete}
        />
      );

      // ほのお技の特殊エフェクト（炎の渦）が含まれることを確認
      expect(container.innerHTML).toContain('conic-gradient');
    });

    it('クリティカルヒットエフェクトが表示される', () => {
      render(
        <MoveEffect
          type="クリティカル"
          isVisible={true}
          onComplete={mockOnComplete}
          damage={50}
        />
      );

      // クリティカルメッセージが表示されることを確認
      expect(screen.getByText('きゅうしょにあたった！')).toBeInTheDocument();
    });
  });

  describe('ダメージ表示', () => {
    it('ダメージ数値が表示される', async () => {
      render(
        <MoveEffect
          type="物理"
          isVisible={true}
          damage={42}
          onComplete={mockOnComplete}
        />
      );

      // ダメージ表示の遅延（500ms）を進める
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(screen.getByText('-42')).toBeInTheDocument();
    });

    it('ダメージがundefinedの場合は数値が表示されない', () => {
      render(
        <MoveEffect
          type="物理"
          isVisible={true}
          onComplete={mockOnComplete}
        />
      );

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(screen.queryByText(/^-\d+$/)).not.toBeInTheDocument();
    });

    it('クリティカルヒット時に特別な表示がされる', () => {
      render(
        <MoveEffect
          type="クリティカル"
          isVisible={true}
          damage={75}
          onComplete={mockOnComplete}
        />
      );

      act(() => {
        vi.advanceTimersByTime(500);
      });

      const damageElement = screen.getByText('-75');
      expect(damageElement).toHaveClass('text-yellow-300');
      expect(screen.getByText('💥')).toBeInTheDocument();
    });
  });

  describe('エフェクト完了', () => {
    it('指定した時間後にonCompleteが呼ばれる', () => {
      render(
        <MoveEffect
          type="でんき"
          isVisible={true}
          duration={1000}
          onComplete={mockOnComplete}
        />
      );

      expect(mockOnComplete).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('デフォルトの時間（2000ms）後にonCompleteが呼ばれる', () => {
      render(
        <MoveEffect
          type="でんき"
          isVisible={true}
          onComplete={mockOnComplete}
        />
      );

      act(() => {
        vi.advanceTimersByTime(1999);
      });
      expect(mockOnComplete).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('非表示になった場合はonCompleteが呼ばれない', () => {
      const { rerender } = render(
        <MoveEffect
          type="でんき"
          isVisible={true}
          onComplete={mockOnComplete}
        />
      );

      rerender(
        <MoveEffect
          type="でんき"
          isVisible={false}
          onComplete={mockOnComplete}
        />
      );

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(mockOnComplete).not.toHaveBeenCalled();
    });
  });

  describe('ポジション', () => {
    it('attackerポジションが正しく設定される', () => {
      const { container } = render(
        <MoveEffect
          type="でんき"
          isVisible={true}
          position="attacker"
          onComplete={mockOnComplete}
        />
      );

      expect(container.firstChild).toHaveClass('z-20');
    });

    it('targetポジション（デフォルト）が正しく設定される', () => {
      const { container } = render(
        <MoveEffect
          type="でんき"
          isVisible={true}
          onComplete={mockOnComplete}
        />
      );

      expect(container.firstChild).toHaveClass('z-30');
    });
  });
});

describe('MoveEffectSequence', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    mockOnComplete.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('エフェクトシーケンス', () => {
    it('複数のエフェクトが順次表示される', () => {
      const effects = [
        { type: 'でんき' as const, duration: 500 },
        { type: 'ダメージ' as const, damage: 30, duration: 500 }
      ];

      const { container } = render(
        <MoveEffectSequence
          effects={effects}
          onComplete={mockOnComplete}
        />
      );

      // 最初のエフェクトが表示される
      expect(container.firstChild).toBeInTheDocument();

      // 最初のエフェクト完了
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // まだonCompleteは呼ばれない
      expect(mockOnComplete).not.toHaveBeenCalled();

      // 2番目のエフェクト完了
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // 全エフェクト完了でonCompleteが呼ばれる
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('空のエフェクト配列でも正常に動作する', () => {
      const { container } = render(
        <MoveEffectSequence
          effects={[]}
          onComplete={mockOnComplete}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('単一のエフェクトが正常に表示・完了する', () => {
      const effects = [
        { type: 'ほのお' as const, duration: 1000, damage: 25 }
      ];

      render(
        <MoveEffectSequence
          effects={effects}
          onComplete={mockOnComplete}
        />
      );

      // エフェクト完了
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('エフェクトパラメータ', () => {
    it('各エフェクトのパラメータが正しく渡される', () => {
      const effects = [
        { 
          type: 'クリティカル' as const, 
          damage: 99, 
          position: 'attacker' as const,
          duration: 800 
        }
      ];

      render(
        <MoveEffectSequence
          effects={effects}
          onComplete={mockOnComplete}
        />
      );

      // ダメージ表示まで進める
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(screen.getByText('-99')).toBeInTheDocument();
      expect(screen.getByText('きゅうしょにあたった！')).toBeInTheDocument();
    });
  });
});