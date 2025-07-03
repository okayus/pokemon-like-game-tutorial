// 初学者向け：バトル画面のテスト
// TDDアプローチでバトル画面コンポーネントをテスト

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BattleProvider } from '../contexts/BattleContext';
import { BattlePage } from './BattlePage';
import type { バトル状態 } from '@pokemon-like-game-tutorial/shared';

// fetch APIのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

// react-router-domのナビゲートモック
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// テスト用のWrapper
const TestWrapper = ({
  children,
  initialPath = '/battle/pokemon-001/wild-25?type=野生',
}: {
  children: React.ReactNode;
  initialPath?: string;
}) => (
  <MemoryRouter initialEntries={[initialPath]}>
    <BattleProvider>{children}</BattleProvider>
  </MemoryRouter>
);

// テスト用のモックバトル状態
const createMockBattleState = (): バトル状態 => ({
  session: {
    battle_id: 'battle-123',
    player_id: 'player-001',
    player_pokemon_id: 'pokemon-001',
    enemy_pokemon_id: 'wild-25',
    battle_type: '野生',
    status: '進行中',
    current_turn: 1,
    phase: 'コマンド選択',
    created_at: '2025-07-02 10:00:00',
  },
  player_pokemon: {
    pokemon_id: 'pokemon-001',
    species_id: 25,
    name: 'ピカチュウ',
    level: 15,
    current_hp: 45,
    max_hp: 45,
    attack: 55,
    defense: 40,
    sprite_url: '/sprites/pikachu.png',
    moves: [
      {
        move_id: 4,
        name: 'でんきショック',
        type: 'でんき',
        power: 40,
        accuracy: 100,
        pp: 30,
        category: '特殊',
        description: '電気の刺激で相手を攻撃する。',
        created_at: '2025-07-02 00:00:00',
        updated_at: '2025-07-02 00:00:00',
        current_pp: 30,
      },
    ],
  },
  enemy_pokemon: {
    pokemon_id: 'wild-25',
    species_id: 16,
    name: 'ポッポ',
    level: 12,
    current_hp: 35,
    max_hp: 35,
    attack: 45,
    defense: 40,
    sprite_url: '/sprites/pidgey.png',
    moves: [],
  },
  recent_logs: [],
  is_loading: false,
});

describe('BattlePage', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('初期表示', () => {
    it('読み込み中状態が表示される', () => {
      render(
        <TestWrapper>
          <BattlePage />
        </TestWrapper>
      );

      expect(screen.getByText('バトルを開始しています...')).toBeInTheDocument();
    });

    it('パラメータが不足している場合はホームにリダイレクトされる', () => {
      render(
        <TestWrapper initialPath="/battle">
          <BattlePage />
        </TestWrapper>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('バトル開始APIが呼ばれる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          battle: createMockBattleState(),
        }),
      });

      render(
        <TestWrapper>
          <BattlePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8788/api/battle/start',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              player_id: 'player-001',
              player_pokemon_id: 'pokemon-001',
              enemy_pokemon_id: 'wild-25',
              battle_type: '野生',
            }),
          })
        );
      });
    });
  });

  describe('バトル画面表示', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          battle: createMockBattleState(),
        }),
      });
    });

    it('バトル状態が正しく表示される', async () => {
      render(
        <TestWrapper>
          <BattlePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('野生ポケモンとのバトル')).toBeInTheDocument();
        expect(screen.getByText('ターン: 1')).toBeInTheDocument();
      });
    });

    it('両ポケモンの情報が表示される', async () => {
      render(
        <TestWrapper>
          <BattlePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/ピカチュウ Lv\.15/)).toBeInTheDocument();
        expect(screen.getByText(/ポッポ Lv\.12/)).toBeInTheDocument();
      });
    });

    it('コマンド選択画面が表示される', async () => {
      render(
        <TestWrapper>
          <BattlePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('ピカチュウは何をする？')).toBeInTheDocument();
        expect(screen.getByText('でんきショック')).toBeInTheDocument();
        expect(screen.getByText('技を使う')).toBeInTheDocument();
        expect(screen.getByText('にげる')).toBeInTheDocument();
      });
    });
  });

  describe('技選択', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          battle: createMockBattleState(),
        }),
      });
    });

    it('技を選択できる', async () => {
      render(
        <TestWrapper>
          <BattlePage />
        </TestWrapper>
      );

      await waitFor(() => {
        const moveButton = screen.getByText('でんきショック');
        fireEvent.click(moveButton);
      });

      // 技選択後、ボタンの状態が変わることを確認
      await waitFor(() => {
        const useButton = screen.getByText('技を使う');
        expect(useButton).not.toBeDisabled();
      });
    });

    it('技を使用できる', async () => {
      // 技使用APIのモック
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          move_name: 'でんきショック',
          damage_dealt: 18,
          critical_hit: false,
          effectiveness: '普通',
          attacker_hp: 45,
          target_hp: 17,
          battle_status: '進行中',
          message: 'ピカチュウの でんきショック！18のダメージ！',
        }),
      });

      render(
        <TestWrapper>
          <BattlePage />
        </TestWrapper>
      );

      await waitFor(() => {
        const moveButton = screen.getByText('でんきショック');
        fireEvent.click(moveButton);
      });

      await waitFor(() => {
        const useButton = screen.getByText('技を使う');
        fireEvent.click(useButton);
      });

      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:8788/api/battle/battle-123/use-move',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('PPが0の技は選択できない', async () => {
      const battleStateWithNoPP = createMockBattleState();
      battleStateWithNoPP.player_pokemon.moves[0].current_pp = 0;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          battle: battleStateWithNoPP,
        }),
      });

      render(
        <TestWrapper>
          <BattlePage />
        </TestWrapper>
      );

      await waitFor(() => {
        const moveButton = screen.getByText('でんきショック');
        expect(moveButton).toBeDisabled();
      });
    });
  });

  describe('バトル終了', () => {
    it('にげるボタンでバトルを終了できる', async () => {
      mockFetch
        // バトル開始
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            battle: createMockBattleState(),
          }),
        })
        // バトル終了
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            message: 'バトルを終了しました',
          }),
        });

      render(
        <TestWrapper>
          <BattlePage />
        </TestWrapper>
      );

      await waitFor(() => {
        const escapeButton = screen.getByText('にげる');
        fireEvent.click(escapeButton);
      });

      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:8788/api/battle/battle-123/end',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ reason: 'プレイヤーが逃げ出した' }),
        })
      );

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('バトル終了時に結果画面が表示される', async () => {
      const endedBattle = createMockBattleState();
      endedBattle.session.status = '終了';
      endedBattle.session.winner = '味方';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          battle: endedBattle,
        }),
      });

      render(
        <TestWrapper>
          <BattlePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('勝利！')).toBeInTheDocument();
        expect(screen.getByText('ポッポを倒した！')).toBeInTheDocument();
        expect(screen.getByText('ホームに戻る')).toBeInTheDocument();
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('エラー時にエラー画面が表示される', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'ポケモンが見つかりません',
        }),
      });

      render(
        <TestWrapper>
          <BattlePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
        expect(screen.getByText('ポケモンが見つかりません')).toBeInTheDocument();
        expect(screen.getByText('再試行')).toBeInTheDocument();
        expect(screen.getByText('戻る')).toBeInTheDocument();
      });
    });
  });
});
