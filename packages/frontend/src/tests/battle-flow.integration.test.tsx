// 初学者向け：バトルフロー統合テスト
// TDDアプローチでバトル全体の流れをテスト

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BattleProvider } from '../contexts/BattleContext';
import { BattlePage } from '../pages/BattlePage';
import type { バトル状態, 技使用結果 } from '@pokemon-like-game-tutorial/shared';

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

// タイマーのモック
vi.useFakeTimers();

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
const createMockBattleState = (overrides = {}): バトル状態 => ({
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
    ...overrides,
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
    ...overrides,
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

describe('バトルフロー統合テスト', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockNavigate.mockClear();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('バトル開始フロー', () => {
    it('バトル開始演出からバトル画面まで正常に遷移する', async () => {
      // バトル開始APIのモック
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

      // バトル開始演出が表示される
      expect(screen.getByText('バトル開始！')).toBeInTheDocument();

      // 演出完了まで進める
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // バトル開始APIが呼ばれる
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

      // バトル画面が表示される
      await waitFor(() => {
        expect(screen.getByText('野生ポケモンとのバトル')).toBeInTheDocument();
        expect(screen.getByText('ピカチュウは何をする？')).toBeInTheDocument();
      });
    });

    it('バトル開始時にエラーが発生した場合の処理', async () => {
      // バトル開始APIエラーのモック
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

      // バトル開始演出完了まで進める
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // エラー画面が表示される
      await waitFor(() => {
        expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
        expect(screen.getByText('ポケモンが見つかりません')).toBeInTheDocument();
      });
    });
  });

  describe('技使用フロー', () => {
    beforeEach(() => {
      // バトル開始APIのモック
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          battle: createMockBattleState(),
        }),
      });
    });

    it('技選択から技使用まで正常に動作する', async () => {
      // 技使用APIのモック
      const mockMoveResult: 技使用結果 = {
        success: true,
        move_name: 'でんきショック',
        damage_dealt: 18,
        critical_hit: false,
        effectiveness: '普通',
        attacker_hp: 45,
        target_hp: 17,
        battle_status: '進行中',
        message: 'ピカチュウの でんきショック！18のダメージ！',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMoveResult,
      });

      render(
        <TestWrapper>
          <BattlePage />
        </TestWrapper>
      );

      // バトル開始演出をスキップ
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // バトル画面が表示されるまで待機
      await waitFor(() => {
        expect(screen.getByText('でんきショック')).toBeInTheDocument();
      });

      // 技を選択
      const moveButton = screen.getByText('でんきショック');
      fireEvent.click(moveButton);

      // 技使用ボタンをクリック
      await waitFor(() => {
        const useButton = screen.getByText('技を使う');
        expect(useButton).not.toBeDisabled();
        fireEvent.click(useButton);
      });

      // 技使用APIが呼ばれる
      await waitFor(() => {
        expect(mockFetch).toHaveBeenLastCalledWith(
          'http://localhost:8788/api/battle/battle-123/use-move',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              battle_id: 'battle-123',
              pokemon_id: 'pokemon-001',
              move_id: 4,
              target: '敵',
            }),
          })
        );
      });

      // バトルメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText('ピカチュウの でんきショック！18のダメージ！')).toBeInTheDocument();
      });
    });

    it('技のPP不足エラーが正しく処理される', async () => {
      // PP不足エラーのモック
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'でんきショックのPPが足りない！',
        }),
      });

      render(
        <TestWrapper>
          <BattlePage />
        </TestWrapper>
      );

      // バトル開始演出をスキップ
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByText('でんきショック')).toBeInTheDocument();
      });

      // 技選択・使用
      const moveButton = screen.getByText('でんきショック');
      fireEvent.click(moveButton);

      const useButton = screen.getByText('技を使う');
      fireEvent.click(useButton);

      // エラーメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText('でんきショックのPPが足りない！')).toBeInTheDocument();
      });
    });
  });

  describe('バトル終了フロー', () => {
    it('プレイヤー勝利時の処理', async () => {
      // 勝利状態のバトル
      const wonBattle = createMockBattleState({
        session: { status: '終了', winner: 'プレイヤー' },
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          battle: wonBattle,
        }),
      });

      render(
        <TestWrapper>
          <BattlePage />
        </TestWrapper>
      );

      // バトル開始演出をスキップ
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // 勝利画面が表示される
      await waitFor(() => {
        expect(screen.getByText('勝利！')).toBeInTheDocument();
        expect(screen.getByText('ポッポを倒した！')).toBeInTheDocument();
        expect(screen.getByText('ホームに戻る')).toBeInTheDocument();
      });
    });

    it('プレイヤー敗北時の処理', async () => {
      // 敗北状態のバトル
      const lostBattle = createMockBattleState({
        session: { status: '終了', winner: '敵' },
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          battle: lostBattle,
        }),
      });

      render(
        <TestWrapper>
          <BattlePage />
        </TestWrapper>
      );

      // バトル開始演出をスキップ
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // 敗北画面が表示される
      await waitFor(() => {
        expect(screen.getByText('敗北...')).toBeInTheDocument();
        expect(screen.getByText('ピカチュウは戦闘不能になった...')).toBeInTheDocument();
      });
    });

    it('逃走機能が正常に動作する', async () => {
      // バトル終了APIのモック
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            battle: createMockBattleState(),
          }),
        })
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

      // バトル開始演出をスキップ
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByText('にげる')).toBeInTheDocument();
      });

      // 逃走ボタンをクリック
      const escapeButton = screen.getByText('にげる');
      fireEvent.click(escapeButton);

      // 逃走演出が表示される
      expect(screen.getByText('逃げ出した！')).toBeInTheDocument();

      // バトル終了APIが呼ばれる
      await waitFor(() => {
        expect(mockFetch).toHaveBeenLastCalledWith(
          'http://localhost:8788/api/battle/battle-123/end',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: 'プレイヤーが逃げ出した' }),
          })
        );
      });

      // 演出完了後にホームに戻る
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('ターン制フロー', () => {
    it('複数ターンにわたるバトルが正常に動作する', async () => {
      // let turnCount = 1; // 未使用のため削除

      // 初期バトル状態
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          battle: createMockBattleState(),
        }),
      });

      // 技使用（ターン1）
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          move_name: 'でんきショック',
          damage_dealt: 15,
          critical_hit: false,
          effectiveness: '普通',
          attacker_hp: 45,
          target_hp: 20,
          battle_status: '進行中',
          message: 'ピカチュウの でんきショック！15のダメージ！',
        }),
      });

      // 技使用（ターン2）
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          move_name: 'でんきショック',
          damage_dealt: 20,
          critical_hit: true,
          effectiveness: '普通',
          attacker_hp: 45,
          target_hp: 0,
          battle_status: '終了',
          winner: 'プレイヤー',
          message: 'ピカチュウの でんきショック！20のダメージ！きゅうしょにあたった！',
        }),
      });

      render(
        <TestWrapper>
          <BattlePage />
        </TestWrapper>
      );

      // バトル開始演出をスキップ
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByText('でんきショック')).toBeInTheDocument();
      });

      // ターン1: 技使用
      fireEvent.click(screen.getByText('でんきショック'));
      fireEvent.click(screen.getByText('技を使う'));

      await waitFor(() => {
        expect(screen.getByText('ピカチュウの でんきショック！15のダメージ！')).toBeInTheDocument();
      });

      // アニメーション完了まで待機
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // ターン2: 再度技使用
      await waitFor(() => {
        expect(screen.getByText('でんきショック')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('でんきショック'));
      fireEvent.click(screen.getByText('技を使う'));

      // クリティカルヒットメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText(/きゅうしょにあたった/)).toBeInTheDocument();
      });

      // バトル終了（勝利）
      await waitFor(() => {
        expect(screen.getByText('勝利！')).toBeInTheDocument();
      });
    });
  });

  describe('エラー回復フロー', () => {
    it('ネットワークエラーから回復できる', async () => {
      // 最初はネットワークエラー
      mockFetch.mockRejectedValueOnce(new Error('Network Error'));

      render(
        <TestWrapper>
          <BattlePage />
        </TestWrapper>
      );

      // バトル開始演出をスキップ
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // エラーが表示される
      await waitFor(() => {
        expect(screen.getByText('Network Error')).toBeInTheDocument();
      });

      // 再試行が成功
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          battle: createMockBattleState(),
        }),
      });

      // 再試行ボタンをクリック
      fireEvent.click(screen.getByText('再試行'));

      // バトル画面が表示される
      await waitFor(() => {
        expect(screen.getByText('野生ポケモンとのバトル')).toBeInTheDocument();
      });
    });
  });
});
