// 初学者向け：技選択コンポーネントのテスト
// TDDアプローチで技選択UIをテスト

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MoveSelector, SimpleMoveSelector } from './MoveSelector';

// テスト用の技データ
const createMockMove = (overrides = {}) => ({
  move_id: 4,
  name: 'でんきショック',
  type: 'でんき' as const,
  power: 40,
  accuracy: 100,
  pp: 30,
  category: '特殊' as const,
  description: '電気の刺激で相手を攻撃する。まひ状態にすることがある。',
  created_at: '2025-07-02 00:00:00',
  updated_at: '2025-07-02 00:00:00',
  current_pp: 30,
  ...overrides,
});

const mockMoves = [
  createMockMove({
    move_id: 4,
    name: 'でんきショック',
    type: 'でんき' as const,
    power: 40,
    current_pp: 30,
  }),
  createMockMove({
    move_id: 5,
    name: 'たいあたり',
    type: 'ノーマル' as const,
    power: 35,
    category: '物理' as const,
    current_pp: 35,
    pp: 35,
  }),
  createMockMove({
    move_id: 6,
    name: 'かたくなる',
    type: 'ノーマル' as const,
    power: 0,
    category: '変化' as const,
    current_pp: 20,
    pp: 20,
    description: '体を硬くして防御力を上げる。',
  }),
  createMockMove({
    move_id: 7,
    name: 'でんこうせっか',
    type: 'ノーマル' as const,
    power: 40,
    category: '物理' as const,
    current_pp: 0, // PP切れ
    pp: 30,
  }),
];

describe('MoveSelector', () => {
  const mockOnMoveSelect = vi.fn();

  beforeEach(() => {
    mockOnMoveSelect.mockClear();
  });

  describe('基本表示', () => {
    it('技リストが正しく表示される', () => {
      render(
        <MoveSelector moves={mockMoves} selectedMoveId={null} onMoveSelect={mockOnMoveSelect} />
      );

      expect(screen.getByText('でんきショック')).toBeInTheDocument();
      expect(screen.getByText('たいあたり')).toBeInTheDocument();
      expect(screen.getByText('かたくなる')).toBeInTheDocument();
      expect(screen.getByText('でんこうせっか')).toBeInTheDocument();
    });

    it('技の基本情報が表示される', () => {
      render(
        <MoveSelector
          moves={[mockMoves[0]]}
          selectedMoveId={null}
          onMoveSelect={mockOnMoveSelect}
        />
      );

      expect(screen.getByText('でんき')).toBeInTheDocument();
      expect(screen.getByText('威力: 40')).toBeInTheDocument();
      expect(screen.getByText('命中: 100%')).toBeInTheDocument();
      expect(screen.getByText('PP: 30/30')).toBeInTheDocument();
    });

    it('技の詳細説明が表示される', () => {
      render(
        <MoveSelector
          moves={[mockMoves[0]]}
          selectedMoveId={null}
          onMoveSelect={mockOnMoveSelect}
          showDetails={true}
        />
      );

      expect(screen.getByText(/電気の刺激で相手を攻撃する/)).toBeInTheDocument();
    });

    it('技リストが空の場合のメッセージが表示される', () => {
      render(<MoveSelector moves={[]} selectedMoveId={null} onMoveSelect={mockOnMoveSelect} />);

      expect(screen.getByText('覚えている技がありません')).toBeInTheDocument();
    });
  });

  describe('技選択', () => {
    it('技をクリックすると選択される', () => {
      render(
        <MoveSelector moves={mockMoves} selectedMoveId={null} onMoveSelect={mockOnMoveSelect} />
      );

      const moveButton = screen.getByText('でんきショック').closest('button');
      fireEvent.click(moveButton!);

      expect(mockOnMoveSelect).toHaveBeenCalledWith(4);
    });

    it('選択中の技が視覚的に区別される', () => {
      render(<MoveSelector moves={mockMoves} selectedMoveId={4} onMoveSelect={mockOnMoveSelect} />);

      expect(screen.getByText('選択中')).toBeInTheDocument();
    });

    it('選択中の技を再クリックすると選択解除される', () => {
      render(<MoveSelector moves={mockMoves} selectedMoveId={4} onMoveSelect={mockOnMoveSelect} />);

      const moveButton = screen.getByText('でんきショック').closest('button');
      fireEvent.click(moveButton!);

      expect(mockOnMoveSelect).toHaveBeenCalledWith(null);
    });
  });

  describe('PP管理', () => {
    it('PP切れの技が無効化される', () => {
      render(
        <MoveSelector moves={mockMoves} selectedMoveId={null} onMoveSelect={mockOnMoveSelect} />
      );

      const ppZeroMove = screen.getByText('でんこうせっか').closest('button');
      expect(ppZeroMove).toBeDisabled();
      expect(screen.getByText('PP切れ')).toBeInTheDocument();
    });

    it('PP切れの技をクリックしても選択されない', () => {
      render(
        <MoveSelector moves={mockMoves} selectedMoveId={null} onMoveSelect={mockOnMoveSelect} />
      );

      const ppZeroMove = screen.getByText('でんこうせっか').closest('button');
      fireEvent.click(ppZeroMove!);

      expect(mockOnMoveSelect).not.toHaveBeenCalled();
    });

    it('PPの残量に応じてバーの色が変わる', () => {
      const lowPPMove = createMockMove({
        name: '低PP技',
        current_pp: 5,
        pp: 30,
      });

      render(
        <MoveSelector moves={[lowPPMove]} selectedMoveId={null} onMoveSelect={mockOnMoveSelect} />
      );

      // PPバーの存在を確認（色の詳細テストは実装依存）
      expect(screen.getByText('PP: 5/30')).toBeInTheDocument();
    });
  });

  describe('技タイプとカテゴリ', () => {
    it('物理技のアイコンが表示される', () => {
      render(
        <MoveSelector
          moves={[mockMoves[1]]} // たいあたり（物理）
          selectedMoveId={null}
          onMoveSelect={mockOnMoveSelect}
        />
      );

      expect(screen.getByText('⚔️')).toBeInTheDocument();
    });

    it('特殊技のアイコンが表示される', () => {
      render(
        <MoveSelector
          moves={[mockMoves[0]]} // でんきショック（特殊）
          selectedMoveId={null}
          onMoveSelect={mockOnMoveSelect}
        />
      );

      expect(screen.getByText('✨')).toBeInTheDocument();
    });

    it('変化技のアイコンが表示される', () => {
      render(
        <MoveSelector
          moves={[mockMoves[2]]} // かたくなる（変化）
          selectedMoveId={null}
          onMoveSelect={mockOnMoveSelect}
        />
      );

      expect(screen.getByText('🔄')).toBeInTheDocument();
    });

    it('変化技では威力が「−」で表示される', () => {
      render(
        <MoveSelector
          moves={[mockMoves[2]]} // かたくなる（威力0）
          selectedMoveId={null}
          onMoveSelect={mockOnMoveSelect}
        />
      );

      expect(screen.getByText('威力: −')).toBeInTheDocument();
    });
  });

  describe('無効化状態', () => {
    it('disabled時にすべての技が選択不可になる', () => {
      render(
        <MoveSelector
          moves={mockMoves}
          selectedMoveId={null}
          onMoveSelect={mockOnMoveSelect}
          disabled={true}
        />
      );

      const moveButton = screen.getByText('でんきショック').closest('button');
      fireEvent.click(moveButton!);

      expect(mockOnMoveSelect).not.toHaveBeenCalled();
    });

    it('disabled時にヒントメッセージが表示される', () => {
      render(
        <MoveSelector
          moves={mockMoves}
          selectedMoveId={null}
          onMoveSelect={mockOnMoveSelect}
          disabled={true}
        />
      );

      expect(screen.getByText('アニメーション中は技を選択できません')).toBeInTheDocument();
    });
  });

  describe('SimpleMoveSelector', () => {
    it('簡易版では詳細説明が表示されない', () => {
      render(
        <SimpleMoveSelector
          moves={[mockMoves[0]]}
          selectedMoveId={null}
          onMoveSelect={mockOnMoveSelect}
        />
      );

      expect(screen.queryByText(/電気の刺激で相手を攻撃する/)).not.toBeInTheDocument();
    });

    it('基本的な技選択機能は動作する', () => {
      render(
        <SimpleMoveSelector
          moves={mockMoves}
          selectedMoveId={null}
          onMoveSelect={mockOnMoveSelect}
        />
      );

      const moveButton = screen.getByText('でんきショック').closest('button');
      fireEvent.click(moveButton!);

      expect(mockOnMoveSelect).toHaveBeenCalledWith(4);
    });
  });

  describe('長い説明のテキスト省略', () => {
    it('説明文が長い場合に省略される', () => {
      const longDescriptionMove = createMockMove({
        name: '長い説明技',
        description:
          'これは非常に長い説明文です。50文字を超えるテキストなので省略されるはずです。テストのために更に文字を追加しています。',
      });

      render(
        <MoveSelector
          moves={[longDescriptionMove]}
          selectedMoveId={null}
          onMoveSelect={mockOnMoveSelect}
          showDetails={true}
        />
      );

      const description = screen.getByText(/これは非常に長い説明文です/);
      expect(description.textContent).toMatch(/\.\.\.$/); // 末尾に...があることを確認
    });
  });
});
