// 初学者向け：ダメージ数値表示コンポーネントのテスト
// TDDアプローチでダメージアニメーションをテスト

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { DamageNumber, DamageNumberSequence, BattleMessage } from './DamageNumber';

// タイマーのモック
vi.useFakeTimers();

describe('DamageNumber', () => {
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
        <DamageNumber damage={50} type="通常" isVisible={false} onComplete={mockOnComplete} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('表示状態でダメージ数値が表示される', () => {
      render(<DamageNumber damage={42} type="通常" isVisible={true} onComplete={mockOnComplete} />);

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('指定した位置に表示される', () => {
      const { container } = render(
        <DamageNumber
          damage={30}
          type="通常"
          isVisible={true}
          startPosition={{ x: 75, y: 25 }}
          onComplete={mockOnComplete}
        />
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.left).toBe('75%');
      expect(element.style.top).toBe('25%');
    });
  });

  describe('ダメージタイプ', () => {
    it('通常ダメージが正しく表示される', () => {
      render(<DamageNumber damage={40} type="通常" isVisible={true} onComplete={mockOnComplete} />);

      const damageElement = screen.getByText('40');
      expect(damageElement).toHaveClass('text-white');
      expect(damageElement).toHaveClass('text-4xl');
    });

    it('クリティカルヒットが正しく表示される', () => {
      render(
        <DamageNumber
          damage={75}
          type="クリティカル"
          isVisible={true}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByText('75 ！')).toBeInTheDocument();
      const damageElement = screen.getByText('75 ！');
      expect(damageElement).toHaveClass('text-yellow-300');
      expect(damageElement).toHaveClass('text-5xl');
      expect(screen.getByText('⭐')).toBeInTheDocument();
    });

    it('効果抜群ダメージが正しく表示される', () => {
      render(
        <DamageNumber damage={60} type="効果抜群" isVisible={true} onComplete={mockOnComplete} />
      );

      expect(screen.getByText('60 ！')).toBeInTheDocument();
      const damageElement = screen.getByText('60 ！');
      expect(damageElement).toHaveClass('text-red-400');
      expect(screen.getByText('🔥')).toBeInTheDocument();
    });

    it('効果今ひとつダメージが正しく表示される', () => {
      render(
        <DamageNumber
          damage={15}
          type="効果今ひとつ"
          isVisible={true}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByText('15...')).toBeInTheDocument();
      const damageElement = screen.getByText('15...');
      expect(damageElement).toHaveClass('text-gray-400');
    });

    it('回復が正しく表示される', () => {
      render(<DamageNumber damage={25} type="回復" isVisible={true} onComplete={mockOnComplete} />);

      expect(screen.getByText('+25 ♥')).toBeInTheDocument();
      const damageElement = screen.getByText('+25 ♥');
      expect(damageElement).toHaveClass('text-green-400');
      expect(screen.getByText('✨')).toBeInTheDocument();
    });

    it('ミスが正しく表示される', () => {
      render(<DamageNumber damage={0} type="ミス" isVisible={true} onComplete={mockOnComplete} />);

      expect(screen.getByText('MISS!')).toBeInTheDocument();
      const damageElement = screen.getByText('MISS!');
      expect(damageElement).toHaveClass('text-gray-500');
    });
  });

  describe('アニメーション', () => {
    it('指定した時間後にonCompleteが呼ばれる', () => {
      render(
        <DamageNumber
          damage={50}
          type="通常"
          isVisible={true}
          duration={1500}
          onComplete={mockOnComplete}
        />
      );

      expect(mockOnComplete).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('デフォルトの時間（2000ms）後にonCompleteが呼ばれる', () => {
      render(<DamageNumber damage={50} type="通常" isVisible={true} onComplete={mockOnComplete} />);

      act(() => {
        vi.advanceTimersByTime(1999);
      });
      expect(mockOnComplete).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('非表示になった場合は状態がリセットされる', () => {
      const { rerender } = render(
        <DamageNumber damage={50} type="通常" isVisible={true} onComplete={mockOnComplete} />
      );

      rerender(
        <DamageNumber damage={50} type="通常" isVisible={false} onComplete={mockOnComplete} />
      );

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(mockOnComplete).not.toHaveBeenCalled();
    });
  });
});

describe('DamageNumberSequence', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    mockOnComplete.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('シーケンス表示', () => {
    it('複数のダメージが順次表示される', () => {
      const damages = [
        { damage: 30, type: '通常' as const, delay: 0 },
        { damage: 50, type: 'クリティカル' as const, delay: 500 },
      ];

      render(<DamageNumberSequence damages={damages} onComplete={mockOnComplete} />);

      // 最初のダメージが即座に表示
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.queryByText('50 ！')).not.toBeInTheDocument();

      // 遅延後に2番目のダメージが表示
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(screen.getByText('50 ！')).toBeInTheDocument();
    });

    it('すべてのダメージ完了後にonCompleteが呼ばれる', () => {
      const damages = [
        { damage: 20, type: '通常' as const, duration: 1000 },
        { damage: 40, type: '通常' as const, duration: 1000 },
      ];

      render(<DamageNumberSequence damages={damages} onComplete={mockOnComplete} />);

      // 最初のダメージ完了
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(mockOnComplete).not.toHaveBeenCalled();

      // 2番目のダメージ完了（デフォルト遅延300ms後に開始）
      act(() => {
        vi.advanceTimersByTime(1300);
      });
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('空の配列でも正常に動作する', () => {
      render(<DamageNumberSequence damages={[]} onComplete={mockOnComplete} />);

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('カスタム位置が正しく適用される', () => {
      const damages = [
        {
          damage: 25,
          type: '通常' as const,
          position: { x: 80, y: 20 },
        },
      ];

      const { container } = render(
        <DamageNumberSequence damages={damages} onComplete={mockOnComplete} />
      );

      const damageElement = container.querySelector('[style*="left: 80%"]');
      expect(damageElement).toBeInTheDocument();
    });
  });
});

describe('BattleMessage', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    mockOnComplete.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('メッセージ表示', () => {
    it('非表示状態では何も表示されない', () => {
      const { container } = render(
        <BattleMessage message="テストメッセージ" isVisible={false} onComplete={mockOnComplete} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('表示状態でメッセージが表示される', () => {
      render(
        <BattleMessage
          message="ピカチュウの でんきショック！"
          isVisible={true}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByText('ピカチュウの でんきショック！')).toBeInTheDocument();
    });

    it('指定した時間後にonCompleteが呼ばれる', () => {
      render(
        <BattleMessage
          message="テストメッセージ"
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

    it('デフォルトの時間（3000ms）後にonCompleteが呼ばれる', () => {
      render(
        <BattleMessage message="テストメッセージ" isVisible={true} onComplete={mockOnComplete} />
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
});
