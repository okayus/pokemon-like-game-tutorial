// 初学者向け：パーティ編成ページのテスト
// TDDアプローチでテストを先に作成

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PartyBuilderPage from './PartyBuilderPage';
import type { フラット所有ポケモン, パーティポケモン } from '@pokemon-like-game-tutorial/shared';

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
    species_name: 'フシギダネ',
    base_hp: 45,
    base_attack: 49,
    base_defense: 49,
    sprite_url: '/sprites/bulbasaur.png',
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
    species_name: 'ピカチュウ',
    base_hp: 35,
    base_attack: 55,
    base_defense: 40,
    sprite_url: '/sprites/pikachu.png',
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
    species_name: 'ヒトカゲ',
    base_hp: 39,
    base_attack: 52,
    base_defense: 43,
    sprite_url: '/sprites/charmander.png',
    max_hp: 49,
    attack: 62,
    defense: 53
  }
];

const モックパーティデータ: パーティポケモン[] = [
  {
    player_id: 'test-player-001',
    position: 1,
    pokemon_id: '1',
    pokemon: {
      pokemon_id: '1',
      player_id: 'test-player-001',
      species_id: 1,
      nickname: 'フッシー',
      level: 15,
      current_hp: 65,
      caught_at: '2025-07-01 10:00:00',
      updated_at: '2025-07-01 10:00:00',
      species: {
        species_id: 1,
        name: 'フシギダネ',
        hp: 45,
        attack: 49,
        defense: 49,
        sprite_url: '/sprites/bulbasaur.png',
        created_at: '2025-07-01'
      },
      stats: { max_hp: 65, attack: 64, defense: 64 }
    },
    updated_at: '2025-07-01 10:00:00'
  }
];

// APIサービスのモック
const モックAPIサービス = {
  所有ポケモン一覧取得: vi.fn(),
  パーティ取得: vi.fn(),
  パーティ編成更新: vi.fn()
};

vi.mock('../services/pokemonApi', () => ({
  ポケモンAPIサービス: vi.fn(() => モックAPIサービス)
}));

describe('PartyBuilderPage（パーティ編成ページ）', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初期表示テスト', () => {
    it('ページタイトルが表示される', async () => {
      // 初学者向け：基本的な画面表示のテスト
      モックAPIサービス.所有ポケモン一覧取得.mockResolvedValue({
        ポケモンリスト: [],
        総数: 0,
        フィルター情報: {}
      });
      モックAPIサービス.パーティ取得.mockResolvedValue([]);

      render(
        <MemoryRouter>
          <PartyBuilderPage />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: 'パーティ編成' })).toBeInTheDocument();
    });

    it('6つのパーティスロットが表示される', async () => {
      // 初学者向け：パーティスロットの表示確認
      モックAPIサービス.所有ポケモン一覧取得.mockResolvedValue({
        ポケモンリスト: [],
        総数: 0,
        フィルター情報: {}
      });
      モックAPIサービス.パーティ取得.mockResolvedValue([]);

      render(
        <MemoryRouter>
          <PartyBuilderPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        const スロット = screen.getAllByTestId(/party-slot-\d+/);
        expect(スロット).toHaveLength(6);
      });
    });

    it('既存のパーティメンバーが表示される', async () => {
      // 初学者向け：保存されているパーティの表示
      モックAPIサービス.所有ポケモン一覧取得.mockResolvedValue({
        ポケモンリスト: モック所有ポケモンデータ,
        総数: 3,
        フィルター情報: {}
      });
      モックAPIサービス.パーティ取得.mockResolvedValue(モックパーティデータ);

      render(
        <MemoryRouter>
          <PartyBuilderPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('フッシー')).toBeInTheDocument();
        expect(screen.getByText('Lv.15')).toBeInTheDocument();
      });
    });
  });

  describe('ポケモン選択テスト', () => {
    beforeEach(() => {
      モックAPIサービス.所有ポケモン一覧取得.mockResolvedValue({
        ポケモンリスト: モック所有ポケモンデータ,
        総数: 3,
        フィルター情報: {}
      });
      モックAPIサービス.パーティ取得.mockResolvedValue([]);
    });

    it('空のスロットをクリックすると選択モードになる', async () => {
      // 初学者向け：スロットクリックで選択モード開始
      const ユーザー = userEvent.setup();
      
      render(
        <MemoryRouter>
          <PartyBuilderPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('party-slot-1')).toBeInTheDocument();
      });

      const 空スロット = screen.getByTestId('party-slot-1');
      await ユーザー.click(空スロット);

      // 所有ポケモン一覧が表示される
      expect(screen.getByText('ポケモンを選択')).toBeInTheDocument();
      expect(screen.getByText('フッシー')).toBeInTheDocument();
      expect(screen.getByText('ピカピカ')).toBeInTheDocument();
      expect(screen.getByText('ヒトカゲ')).toBeInTheDocument();
    });

    it('ポケモンを選択してパーティに追加できる', async () => {
      // 初学者向け：ポケモン選択でパーティ追加
      const ユーザー = userEvent.setup();
      
      モックAPIサービス.パーティ編成更新.mockResolvedValue([
        {
          player_id: 'test-player-001',
          position: 1,
          pokemon_id: '2',
          pokemon: モック所有ポケモンデータ[1],
          updated_at: '2025-07-01 13:00:00'
        }
      ]);

      render(
        <MemoryRouter>
          <PartyBuilderPage />
        </MemoryRouter>
      );

      // スロット1をクリック
      await waitFor(() => {
        expect(screen.getByTestId('party-slot-1')).toBeInTheDocument();
      });
      await ユーザー.click(screen.getByTestId('party-slot-1'));

      // ピカピカを選択
      const ピカピカカード = screen.getByText('ピカピカ').closest('[data-testid="pokemon-select-card"]');
      await ユーザー.click(ピカピカカード!);

      // API呼び出し確認
      expect(モックAPIサービス.パーティ編成更新).toHaveBeenCalledWith(
        'test-player-001',
        {
          position: 1,
          pokemon_id: '2'
        }
      );
    });

    it('既にパーティにいるポケモンは選択できない', async () => {
      // 初学者向け：重複防止のテスト
      モックAPIサービス.パーティ取得.mockResolvedValue(モックパーティデータ);
      
      const ユーザー = userEvent.setup();
      
      render(
        <MemoryRouter>
          <PartyBuilderPage />
        </MemoryRouter>
      );

      // スロット2をクリック
      await waitFor(() => {
        expect(screen.getByTestId('party-slot-2')).toBeInTheDocument();
      });
      await ユーザー.click(screen.getByTestId('party-slot-2'));

      // フッシーカードが無効化されている
      const フッシーカード = screen.getByText('フッシー').closest('[data-testid="pokemon-select-card"]');
      expect(フッシーカード).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('パーティ管理テスト', () => {
    beforeEach(() => {
      モックAPIサービス.所有ポケモン一覧取得.mockResolvedValue({
        ポケモンリスト: モック所有ポケモンデータ,
        総数: 3,
        フィルター情報: {}
      });
      モックAPIサービス.パーティ取得.mockResolvedValue(モックパーティデータ);
    });

    it('パーティメンバーを削除できる', async () => {
      // 初学者向け：パーティからポケモンを外す
      const ユーザー = userEvent.setup();
      
      モックAPIサービス.パーティ編成更新.mockResolvedValue([]);

      render(
        <MemoryRouter>
          <PartyBuilderPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('フッシー')).toBeInTheDocument();
      });

      // 削除ボタンをクリック
      const 削除ボタン = screen.getByTestId('remove-pokemon-1');
      await ユーザー.click(削除ボタン);

      // API呼び出し確認
      expect(モックAPIサービス.パーティ編成更新).toHaveBeenCalledWith(
        'test-player-001',
        {
          position: 1,
          pokemon_id: null
        }
      );
    });

    it('ドラッグ&ドロップで並び替えができる', async () => {
      // 初学者向け：ドラッグ&ドロップの基本的なテスト
      // 注：実際のドラッグ&ドロップのテストは複雑なため、簡略化
      render(
        <MemoryRouter>
          <PartyBuilderPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        const スロット1 = screen.getByTestId('party-slot-1');
        expect(スロット1).toHaveAttribute('draggable', 'true');
      });
    });
  });

  describe('パーティ統計テスト', () => {
    it('パーティ全体のステータスが表示される', async () => {
      // 初学者向け：パーティの合計ステータス表示
      モックAPIサービス.所有ポケモン一覧取得.mockResolvedValue({
        ポケモンリスト: モック所有ポケモンデータ,
        総数: 3,
        フィルター情報: {}
      });
      モックAPIサービス.パーティ取得.mockResolvedValue(モックパーティデータ);

      render(
        <MemoryRouter>
          <PartyBuilderPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('パーティステータス')).toBeInTheDocument();
        expect(screen.getByText(/総HP:/)).toBeInTheDocument();
        expect(screen.getByText(/平均レベル:/)).toBeInTheDocument();
      });
    });
  });

  describe('エラーハンドリングテスト', () => {
    it('API エラー時にエラーメッセージが表示される', async () => {
      // 初学者向け：エラー時の適切な表示
      モックAPIサービス.所有ポケモン一覧取得.mockRejectedValue(
        new Error('ネットワークエラー')
      );

      render(
        <MemoryRouter>
          <PartyBuilderPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('データの読み込みに失敗しました')).toBeInTheDocument();
      });
    });
  });
});