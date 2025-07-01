// 初学者向け：所有ポケモンリストコンポーネントのテスト
// TDDアプローチでテストを先に作成

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OwnedPokemonList } from './OwnedPokemonList';
import type { フラット所有ポケモン } from '@pokemon-like-game-tutorial/shared';

// モックデータ
const モック所有ポケモンデータ: フラット所有ポケモン[] = [
  {
    pokemon_id: '1',
    player_id: 'test-player-001',
    species_id: 1,
    nickname: 'フッシー',
    level: 15,
    current_hp: 65,
    caught_at: '2025-07-01 10:00:00',
    updated_at: '2025-07-01 10:00:00',
    // 種族データ（フラット化）
    species_name: 'フシギダネ',
    base_hp: 45,
    base_attack: 49,
    base_defense: 49,
    sprite_url: '/sprites/bulbasaur.png',
    // 計算ステータス（フラット化）
    max_hp: 65,
    attack: 64,
    defense: 64
  },
  {
    pokemon_id: '2',
    player_id: 'test-player-001',
    species_id: 25,
    nickname: 'ピカピカ',
    level: 20,
    current_hp: 70,
    caught_at: '2025-07-01 11:00:00',
    updated_at: '2025-07-01 11:00:00',
    // 種族データ（フラット化）
    species_name: 'ピカチュウ',
    base_hp: 35,
    base_attack: 55,
    base_defense: 40,
    sprite_url: '/sprites/pikachu.png',
    // 計算ステータス（フラット化）
    max_hp: 70,
    attack: 75,
    defense: 60
  },
  {
    pokemon_id: '3',
    player_id: 'test-player-001',
    species_id: 4,
    nickname: undefined,
    level: 10,
    current_hp: 49,
    caught_at: '2025-07-01 12:00:00',
    updated_at: '2025-07-01 12:00:00',
    // 種族データ（フラット化）
    species_name: 'ヒトカゲ',
    base_hp: 39,
    base_attack: 52,
    base_defense: 43,
    sprite_url: '/sprites/charmander.png',
    // 計算ステータス（フラット化）
    max_hp: 49,
    attack: 62,
    defense: 53
  }
];

// APIサービスのモック
const モックAPIサービス = {
  所有ポケモン一覧取得: vi.fn()
};

describe('OwnedPokemonList（所有ポケモンリストコンポーネント）', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初期表示テスト', () => {
    it('読み込み中の表示が正しく表示される', () => {
      // 初学者向け：APIが遅い場合のローディング表示をテスト
      モックAPIサービス.所有ポケモン一覧取得.mockReturnValue(new Promise(() => {}));
      
      render(<OwnedPokemonList プレイヤーID="test-player-001" APIサービス={モックAPIサービス} />);
      
      expect(screen.getByText('所有ポケモンを読み込んでいます...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('所有ポケモンリストのタイトルが表示される', async () => {
      // 初学者向け：画面のタイトルが適切に表示されることを確認
      モックAPIサービス.所有ポケモン一覧取得.mockResolvedValue({
        ポケモンリスト: モック所有ポケモンデータ,
        総数: 3,
        フィルター情報: {}
      });
      
      render(<OwnedPokemonList プレイヤーID="test-player-001" APIサービス={モックAPIサービス} />);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '所有ポケモン一覧' })).toBeInTheDocument();
      });
    });

    it('所有ポケモン数が表示される', async () => {
      // 初学者向け：所有しているポケモンの総数表示をテスト
      モックAPIサービス.所有ポケモン一覧取得.mockResolvedValue({
        ポケモンリスト: モック所有ポケモンデータ,
        総数: 3,
        フィルター情報: {}
      });
      
      render(<OwnedPokemonList プレイヤーID="test-player-001" APIサービス={モックAPIサービス} />);
      
      await waitFor(() => {
        expect(screen.getByText('所有ポケモン数: 3匹')).toBeInTheDocument();
      });
    });
  });

  describe('ポケモンリスト表示テスト', () => {
    beforeEach(() => {
      モックAPIサービス.所有ポケモン一覧取得.mockResolvedValue({
        ポケモンリスト: モック所有ポケモンデータ,
        総数: 3,
        フィルター情報: {}
      });
    });

    it('すべての所有ポケモンが表示される', async () => {
      // 初学者向け：APIから取得したすべての所有ポケモンが一覧表示されることを確認
      render(<OwnedPokemonList プレイヤーID="test-player-001" APIサービス={モックAPIサービス} />);
      
      await waitFor(() => {
        expect(screen.getByText('フッシー')).toBeInTheDocument();
        expect(screen.getByText('ピカピカ')).toBeInTheDocument();
        expect(screen.getByText('ヒトカゲ')).toBeInTheDocument(); // ニックネームなしは種族名表示
      });
    });

    it('ポケモンのレベルとHPが表示される', async () => {
      // 初学者向け：レベルと現在HP/最大HPが正しく表示されることを確認
      render(<OwnedPokemonList プレイヤーID="test-player-001" APIサービス={モックAPIサービス} />);
      
      await waitFor(() => {
        // フッシーのステータス
        expect(screen.getByText('Lv.15')).toBeInTheDocument();
        expect(screen.getByText('65/65')).toBeInTheDocument();
      });
    });

    it('ニックネームがない場合は種族名が表示される', async () => {
      // 初学者向け：ニックネームが設定されていない場合の表示をテスト
      render(<OwnedPokemonList プレイヤーID="test-player-001" APIサービス={モックAPIサービス} />);
      
      await waitFor(() => {
        // ヒトカゲはニックネームなしなので種族名で表示
        expect(screen.getByText('ヒトカゲ')).toBeInTheDocument();
      });
    });

    it('ポケモンのスプライト画像が表示される', async () => {
      // 初学者向け：各ポケモンの画像が適切に表示されることを確認
      render(<OwnedPokemonList プレイヤーID="test-player-001" APIサービス={モックAPIサービス} />);
      
      await waitFor(() => {
        const フシギダネ画像 = screen.getByAltText('フッシー');
        expect(フシギダネ画像).toBeInTheDocument();
        expect(フシギダネ画像).toHaveAttribute('src', '/sprites/bulbasaur.png');
      });
    });
  });

  describe('検索・フィルター機能テスト', () => {
    beforeEach(() => {
      モックAPIサービス.所有ポケモン一覧取得.mockResolvedValue({
        ポケモンリスト: モック所有ポケモンデータ,
        総数: 3,
        フィルター情報: {}
      });
    });

    it('ポケモン名で検索できる', async () => {
      // 初学者向け：ニックネームまたは種族名による検索機能のテスト
      const ユーザー = userEvent.setup();
      
      // 検索結果をモック（ピカチュウのみ）
      const 検索結果 = [モック所有ポケモンデータ[1]]; // ピカピカのみ
      
      // 最初は全データ、検索後は絞り込み結果を返すようにモック
      モックAPIサービス.所有ポケモン一覧取得
        .mockResolvedValueOnce({
          ポケモンリスト: モック所有ポケモンデータ,
          総数: 3,
          フィルター情報: {}
        })
        .mockResolvedValue({
          ポケモンリスト: 検索結果,
          総数: 1,
          フィルター情報: { species_name: 'ピカ' }
        });
      
      render(<OwnedPokemonList プレイヤーID="test-player-001" APIサービス={モックAPIサービス} />);
      
      // 初期表示を待機
      await waitFor(() => {
        expect(screen.getByText('ピカピカ')).toBeInTheDocument();
        expect(screen.getByText('フッシー')).toBeInTheDocument();
      });
      
      // 「ピカ」で検索
      const 検索ボックス = screen.getByPlaceholderText('ポケモン名で検索...');
      await ユーザー.type(検索ボックス, 'ピカ');
      
      // 検索実行を待機（デバウンス）
      await waitFor(() => {
        // API呼び出しが2回目が実行されたことを確認
        expect(モックAPIサービス.所有ポケモン一覧取得).toHaveBeenCalledTimes(2);
      }, { timeout: 1000 });
      
      // 検索結果の表示を確認
      await waitFor(() => {
        expect(screen.getByText('所有ポケモン数: 1匹')).toBeInTheDocument();
      });
      
      // フッシーとヒトカゲが非表示になることを確認
      expect(screen.queryByText('フッシー')).not.toBeInTheDocument();
      expect(screen.queryByText('ヒトカゲ')).not.toBeInTheDocument();
    });

    it('レベルでソートできる', async () => {
      // 初学者向け：レベルによるソート機能のテスト
      const ユーザー = userEvent.setup();
      render(<OwnedPokemonList プレイヤーID="test-player-001" APIサービス={モックAPIサービス} />);
      
      // ソートボタンが表示されるまで待機
      await waitFor(() => {
        expect(screen.getByText('レベル順')).toBeInTheDocument();
      });
      
      // レベルソートボタンをクリック
      await ユーザー.click(screen.getByText('レベル順'));
      
      // ソート後の順序確認（レベル降順: ピカピカ20 > フッシー15 > ヒトカゲ10）
      const ポケモンカード = screen.getAllByTestId('owned-pokemon-card');
      const ポケモン名 = ポケモンカード.map(card => {
        const h3 = card.querySelector('h3');
        return h3?.textContent || '';
      });
      
      expect(ポケモン名[0]).toBe('ピカピカ');
      expect(ポケモン名[1]).toBe('フッシー');
      expect(ポケモン名[2]).toBe('ヒトカゲ');
    });
  });

  describe('エラーハンドリングテスト', () => {
    it('API呼び出しエラー時にエラーメッセージが表示される', async () => {
      // 初学者向け：ネットワークエラーなどの場合の適切なエラー表示をテスト
      モックAPIサービス.所有ポケモン一覧取得.mockRejectedValue(
        new Error('ネットワークエラー')
      );
      
      render(<OwnedPokemonList プレイヤーID="test-player-001" APIサービス={モックAPIサービス} />);
      
      await waitFor(() => {
        expect(screen.getByText('所有ポケモンデータの読み込みに失敗しました')).toBeInTheDocument();
        expect(screen.getByText('再読み込み')).toBeInTheDocument();
      });
    });

    it('空のリストの場合は適切なメッセージが表示される', async () => {
      // 初学者向け：ポケモンを1匹も持っていない場合の表示をテスト
      モックAPIサービス.所有ポケモン一覧取得.mockResolvedValue({
        ポケモンリスト: [],
        総数: 0,
        フィルター情報: {}
      });
      
      render(<OwnedPokemonList プレイヤーID="test-player-001" APIサービス={モックAPIサービス} />);
      
      await waitFor(() => {
        expect(screen.getByText('まだポケモンを捕まえていません')).toBeInTheDocument();
        expect(screen.getByText('マップでポケモンを探してみましょう！')).toBeInTheDocument();
      });
    });
  });

  describe('詳細表示テスト', () => {
    beforeEach(() => {
      モックAPIサービス.所有ポケモン一覧取得.mockResolvedValue({
        ポケモンリスト: モック所有ポケモンデータ,
        総数: 3,
        フィルター情報: {}
      });
    });

    it('ポケモンカードをクリックすると詳細モーダルが開く', async () => {
      // 初学者向け：クリックで詳細情報を表示する機能をテスト
      const ユーザー = userEvent.setup();
      render(<OwnedPokemonList プレイヤーID="test-player-001" APIサービス={モックAPIサービス} />);
      
      // ポケモンカードが表示されるまで待機
      await waitFor(() => {
        expect(screen.getByText('ピカピカ')).toBeInTheDocument();
      });
      
      // ピカピカのカードをクリック
      await ユーザー.click(screen.getByText('ピカピカ'));
      
      // 詳細モーダルが開くことを確認
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('ピカピカの詳細情報')).toBeInTheDocument();
    });
  });
});