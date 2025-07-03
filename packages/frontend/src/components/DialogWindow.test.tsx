// 初学者向け：対話ウィンドウコンポーネントのテストファイル
// DialogWindowコンポーネントの動作をテストして品質を保証します

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { メッセージタイプ } from '@pokemon-like-game-tutorial/shared';
import DialogWindow from './DialogWindow';

describe('DialogWindow', () => {
  // モック関数の準備
  const mockProps = {
    表示中: true,
    タイピングエフェクト: false,
    タイピング速度: 50,
    選択肢選択: vi.fn(),
    次へ進む: vi.fn(),
    対話終了: vi.fn(),
  };

  beforeEach(() => {
    // 各テスト前にモック関数をリセット
    vi.clearAllMocks();
  });

  afterEach(() => {
    // DOM操作のクリーンアップ
    document.body.innerHTML = '';
  });

  describe('表示・非表示の制御', () => {
    it('表示中がfalseの場合は何も表示されない', () => {
      render(<DialogWindow {...mockProps} 表示中={false} />);

      // 対話ウィンドウが表示されていないことを確認
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('表示中がtrueで現在のメッセージがない場合は何も表示されない', () => {
      render(<DialogWindow {...mockProps} 表示中={true} 現在のメッセージ={undefined} />);

      // 対話ウィンドウが表示されていないことを確認
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('通常メッセージの表示', () => {
    const 通常メッセージ = {
      id: 'test',
      タイプ: メッセージタイプ.通常,
      テキスト: 'こんにちは！\n今日は良い天気ですね。',
      次のメッセージ: 'next',
    };

    it('通常メッセージが正しく表示される', () => {
      render(<DialogWindow {...mockProps} 現在のメッセージ={通常メッセージ} NPC名="テストNPC" />);

      // NPC名が表示されている
      expect(screen.getByText('テストNPC')).toBeInTheDocument();

      // メッセージテキストが表示されている
      expect(screen.getByText('こんにちは！\n今日は良い天気ですね。')).toBeInTheDocument();

      // 操作ガイドが表示されている
      expect(screen.getByText(/Enter\/スペース: 次へ/)).toBeInTheDocument();
    });

    it('改行が正しく表示される', () => {
      render(<DialogWindow {...mockProps} 現在のメッセージ={通常メッセージ} />);

      const messageElement = screen.getByText('こんにちは！\n今日は良い天気ですね。');
      expect(messageElement).toHaveClass('whitespace-pre-line');
    });
  });

  describe('選択肢メッセージの表示', () => {
    const 選択肢メッセージ = {
      id: 'choice_test',
      タイプ: メッセージタイプ.選択肢,
      テキスト: 'どちらを選びますか？',
      選択肢: [
        {
          id: 'option1',
          テキスト: 'はい',
          次のメッセージ: 'yes',
        },
        {
          id: 'option2',
          テキスト: 'いいえ',
          次のメッセージ: 'no',
        },
      ],
    };

    it('選択肢が正しく表示される', async () => {
      render(
        <DialogWindow
          {...mockProps}
          現在のメッセージ={選択肢メッセージ}
          タイピングエフェクト={false}
        />
      );

      // 選択肢のボタンが表示されている
      expect(screen.getByText('はい')).toBeInTheDocument();
      expect(screen.getByText('いいえ')).toBeInTheDocument();

      // 操作ガイドが選択肢用に変わっている
      expect(screen.getByText(/↑↓: 選択 \| Enter: 決定/)).toBeInTheDocument();
    });

    it('選択肢をクリックできる', async () => {
      render(
        <DialogWindow
          {...mockProps}
          現在のメッセージ={選択肢メッセージ}
          タイピングエフェクト={false}
        />
      );

      const 第一選択肢 = screen.getByText('はい');
      fireEvent.click(第一選択肢);

      expect(mockProps.選択肢選択).toHaveBeenCalledWith(選択肢メッセージ.選択肢[0]);
    });
  });

  describe('タイピングエフェクト', () => {
    const タイピングメッセージ = {
      id: 'typing_test',
      タイプ: メッセージタイプ.通常,
      テキスト: 'タイピングテスト',
      次のメッセージ: 'next',
    };

    it('タイピングエフェクトが有効な場合、文字が段階的に表示される', async () => {
      render(
        <DialogWindow
          {...mockProps}
          現在のメッセージ={タイピングメッセージ}
          タイピングエフェクト={true}
          タイピング速度={10}
        />
      );

      // 最初は空またはカーソルのみ表示
      const messageContainer = screen.getByText('', { selector: 'div' }).parentElement;
      expect(messageContainer).toBeInTheDocument();

      // 少し待ってから文字が表示されることを確認
      await waitFor(
        () => {
          expect(screen.getByText(/タ/)).toBeInTheDocument();
        },
        { timeout: 100 }
      );
    });

    it('タイピングエフェクトが無効な場合、全文が即座に表示される', () => {
      render(
        <DialogWindow
          {...mockProps}
          現在のメッセージ={タイピングメッセージ}
          タイピングエフェクト={false}
        />
      );

      // 全文が即座に表示される
      expect(screen.getByText('タイピングテスト')).toBeInTheDocument();
    });
  });

  describe('キーボード操作', () => {
    const 通常メッセージ = {
      id: 'keyboard_test',
      タイプ: メッセージタイプ.通常,
      テキスト: 'キーボードテスト',
      次のメッセージ: 'next',
    };

    it('Enterキーで次のメッセージに進む', () => {
      render(
        <DialogWindow
          {...mockProps}
          現在のメッセージ={通常メッセージ}
          タイピングエフェクト={false}
        />
      );

      fireEvent.keyDown(window, { key: 'Enter' });
      expect(mockProps.次へ進む).toHaveBeenCalled();
    });

    it('スペースキーで次のメッセージに進む', () => {
      render(
        <DialogWindow
          {...mockProps}
          現在のメッセージ={通常メッセージ}
          タイピングエフェクト={false}
        />
      );

      fireEvent.keyDown(window, { key: ' ' });
      expect(mockProps.次へ進む).toHaveBeenCalled();
    });

    it('Escapeキーで対話終了', () => {
      render(
        <DialogWindow
          {...mockProps}
          現在のメッセージ={通常メッセージ}
          タイピングエフェクト={false}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(mockProps.対話終了).toHaveBeenCalled();
    });
  });

  describe('背景クリックでの終了', () => {
    it('背景オーバーレイをクリックで対話終了', () => {
      render(
        <DialogWindow
          {...mockProps}
          現在のメッセージ={{
            id: 'bg_test',
            タイプ: メッセージタイプ.通常,
            テキスト: '背景クリックテスト',
          }}
        />
      );

      const overlay = document.querySelector('.bg-black\\/50');
      expect(overlay).toBeInTheDocument();

      fireEvent.click(overlay!);
      expect(mockProps.対話終了).toHaveBeenCalled();
    });
  });
});
