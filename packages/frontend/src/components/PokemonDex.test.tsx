// 初学者向け：ポケモン図鑑コンポーネントのテスト
// TDDアプローチでテストを先に作成

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PokemonDex } from './PokemonDex';
import type { ポケモンマスタ } from '@pokemon-like-game-tutorial/shared';

// モックデータ
const モックポケモンデータ: ポケモンマスタ[] = [
  {
    species_id: 1,
    name: 'フシギダネ',
    hp: 45,
    attack: 49,
    defense: 49,
    sprite_url: '/sprites/bulbasaur.png',
    created_at: '2025-07-01 09:14:24',
  },
  {
    species_id: 25,
    name: 'ピカチュウ',
    hp: 35,
    attack: 55,
    defense: 40,
    sprite_url: '/sprites/pikachu.png',
    created_at: '2025-07-01 09:14:24',
  },
  {
    species_id: 4,
    name: 'ヒトカゲ',
    hp: 39,
    attack: 52,
    defense: 43,
    sprite_url: '/sprites/charmander.png',
    created_at: '2025-07-01 09:14:24',
  },
];

// APIサービスのモック
const モックAPIサービス = {
  全種族データ取得: vi.fn(),
};

describe('PokemonDex（ポケモン図鑑コンポーネント）', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初期表示テスト', () => {
    it('読み込み中の表示が正しく表示される', () => {
      // 初学者向け：APIが遅い場合のローディング表示をテスト
      モックAPIサービス.全種族データ取得.mockReturnValue(new Promise(() => {})); // 永続的にペンディング

      render(<PokemonDex APIサービス={モックAPIサービス} />);

      expect(screen.getByText('ポケモン図鑑を読み込んでいます...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument(); // ローディングスピナー
    });

    it('ポケモン図鑑のタイトルが表示される', async () => {
      // 初学者向け：画面のタイトルが適切に表示されることを確認
      モックAPIサービス.全種族データ取得.mockResolvedValue(モックポケモンデータ);

      render(<PokemonDex APIサービス={モックAPIサービス} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'ポケモン図鑑' })).toBeInTheDocument();
      });
    });

    it('取得したポケモン数が表示される', async () => {
      // 初学者向け：図鑑に登録されているポケモンの総数表示をテスト
      モックAPIサービス.全種族データ取得.mockResolvedValue(モックポケモンデータ);

      render(<PokemonDex APIサービス={モックAPIサービス} />);

      await waitFor(() => {
        expect(screen.getByText('図鑑登録数: 3種類')).toBeInTheDocument();
      });
    });
  });

  describe('ポケモンリスト表示テスト', () => {
    beforeEach(() => {
      モックAPIサービス.全種族データ取得.mockResolvedValue(モックポケモンデータ);
    });

    it('すべてのポケモンが表示される', async () => {
      // 初学者向け：APIから取得したすべてのポケモンが一覧表示されることを確認
      render(<PokemonDex APIサービス={モックAPIサービス} />);

      await waitFor(() => {
        expect(screen.getByText('フシギダネ')).toBeInTheDocument();
        expect(screen.getByText('ピカチュウ')).toBeInTheDocument();
        expect(screen.getByText('ヒトカゲ')).toBeInTheDocument();
      });
    });

    it('ポケモンの基本ステータスが表示される', async () => {
      // 初学者向け：HP、攻撃力、防御力が正しく表示されることを確認
      render(<PokemonDex APIサービス={モックAPIサービス} />);

      await waitFor(() => {
        // フシギダネのステータス
        expect(screen.getByText('HP: 45')).toBeInTheDocument();
        expect(screen.getByText('攻撃: 49')).toBeInTheDocument();
        expect(screen.getByText('防御: 49')).toBeInTheDocument();
      });
    });

    it('ポケモンのスプライト画像が表示される', async () => {
      // 初学者向け：各ポケモンの画像が適切に表示されることを確認
      render(<PokemonDex APIサービス={モックAPIサービス} />);

      await waitFor(() => {
        const フシギダネ画像 = screen.getByAltText('フシギダネ');
        expect(フシギダネ画像).toBeInTheDocument();
        expect(フシギダネ画像).toHaveAttribute('src', '/sprites/bulbasaur.png');
      });
    });
  });

  describe('検索・フィルター機能テスト', () => {
    beforeEach(() => {
      モックAPIサービス.全種族データ取得.mockResolvedValue(モックポケモンデータ);
    });

    it('ポケモン名で検索できる', async () => {
      // 初学者向け：名前による検索機能のテスト
      const ユーザー = userEvent.setup();
      render(<PokemonDex APIサービス={モックAPIサービス} />);

      // 検索ボックスが表示されるまで待機
      await waitFor(() => {
        expect(screen.getByPlaceholderText('ポケモン名で検索...')).toBeInTheDocument();
      });

      // 「ピカ」で検索
      const 検索ボックス = screen.getByPlaceholderText('ポケモン名で検索...');
      await ユーザー.type(検索ボックス, 'ピカ');

      // ピカチュウのみ表示され、他は非表示になることを確認
      expect(screen.getByText('ピカチュウ')).toBeInTheDocument();
      expect(screen.queryByText('フシギダネ')).not.toBeInTheDocument();
      expect(screen.queryByText('ヒトカゲ')).not.toBeInTheDocument();
    });

    it('HPでソートできる', async () => {
      // 初学者向け：ステータスによるソート機能のテスト
      const ユーザー = userEvent.setup();
      render(<PokemonDex APIサービス={モックAPIサービス} />);

      // ソートボタンが表示されるまで待機
      await waitFor(() => {
        expect(screen.getByText('HPでソート')).toBeInTheDocument();
      });

      // HPソートボタンをクリック
      await ユーザー.click(screen.getByText('HPでソート'));

      // ソート後の順序確認（HP順: ピカチュウ35 < ヒトカゲ39 < フシギダネ45）
      const ポケモンカード = screen.getAllByTestId('pokemon-card');
      expect(ポケモンカード[0]).toHaveTextContent('ピカチュウ');
      expect(ポケモンカード[1]).toHaveTextContent('ヒトカゲ');
      expect(ポケモンカード[2]).toHaveTextContent('フシギダネ');
    });
  });

  describe('エラーハンドリングテスト', () => {
    it('API呼び出しエラー時にエラーメッセージが表示される', async () => {
      // 初学者向け：ネットワークエラーなどの場合の適切なエラー表示をテスト
      モックAPIサービス.全種族データ取得.mockRejectedValue(new Error('ネットワークエラー'));

      render(<PokemonDex APIサービス={モックAPIサービス} />);

      await waitFor(() => {
        expect(screen.getByText('ポケモンデータの読み込みに失敗しました')).toBeInTheDocument();
        expect(screen.getByText('再読み込み')).toBeInTheDocument();
      });
    });

    it('再読み込みボタンでリトライできる', async () => {
      // 初学者向け：エラー時の再試行機能をテスト
      const ユーザー = userEvent.setup();

      // 最初はエラー
      モックAPIサービス.全種族データ取得.mockRejectedValueOnce(new Error('一時的なエラー'));
      // 2回目は成功
      モックAPIサービス.全種族データ取得.mockResolvedValueOnce(モックポケモンデータ);

      render(<PokemonDex APIサービス={モックAPIサービス} />);

      // エラー表示を確認
      await waitFor(() => {
        expect(screen.getByText('再読み込み')).toBeInTheDocument();
      });

      // 再読み込みボタンをクリック
      await ユーザー.click(screen.getByText('再読み込み'));

      // 成功時の表示を確認
      await waitFor(() => {
        expect(screen.getByText('フシギダネ')).toBeInTheDocument();
      });

      // API呼び出しが2回行われたことを確認
      expect(モックAPIサービス.全種族データ取得).toHaveBeenCalledTimes(2);
    });
  });

  describe('詳細表示テスト', () => {
    beforeEach(() => {
      モックAPIサービス.全種族データ取得.mockResolvedValue(モックポケモンデータ);
    });

    it('ポケモンカードをクリックすると詳細モーダルが開く', async () => {
      // 初学者向け：クリックで詳細情報を表示する機能をテスト
      const ユーザー = userEvent.setup();
      render(<PokemonDex APIサービス={モックAPIサービス} />);

      // ポケモンカードが表示されるまで待機
      await waitFor(() => {
        expect(screen.getByText('ピカチュウ')).toBeInTheDocument();
      });

      // ピカチュウのカードをクリック
      await ユーザー.click(screen.getByText('ピカチュウ'));

      // 詳細モーダルが開くことを確認
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('ピカチュウの詳細情報')).toBeInTheDocument();
    });
  });
});
