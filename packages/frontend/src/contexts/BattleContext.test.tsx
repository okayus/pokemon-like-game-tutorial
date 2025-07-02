// 初学者向け：バトルコンテキストのテスト
// TDDアプローチでバトル状態管理をテスト

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, renderHook, act, waitFor } from '@testing-library/react';
import { BattleProvider, useBattle } from './BattleContext';
import type { 
  バトル開始リクエスト, 
  バトル状態, 
  技使用結果 
} from '@pokemon-like-game-tutorial/shared';

// fetch APIのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

// テスト用のWrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BattleProvider>{children}</BattleProvider>
);

describe('BattleContext', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('初期状態', () => {
    it('初期状態が正しく設定される', () => {
      const { result } = renderHook(() => useBattle(), {
        wrapper: TestWrapper
      });

      expect(result.current.現在バトル).toBeNull();
      expect(result.current.読み込み中).toBe(false);
      expect(result.current.エラーメッセージ).toBe('');
      expect(result.current.選択中技).toBeNull();
      expect(result.current.アニメーション中).toBe(false);
      expect(result.current.メッセージ表示中).toBe(false);
    });

    it('BattleProvider外でuseBattleを使用するとエラーになる', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useBattle());
      }).toThrow('useBattle は BattleProvider 内で使用してください');

      consoleSpy.mockRestore();
    });
  });

  describe('バトル開始', () => {
    it('バトル開始が成功する', async () => {
      const mockBattleState: バトル状態 = {
        session: {
          battle_id: 'battle-123',
          player_id: 'player-001',
          player_pokemon_id: 'pokemon-001',
          enemy_pokemon_id: 'wild-25',
          battle_type: '野生',
          status: '進行中',
          current_turn: 1,
          phase: 'コマンド選択',
          created_at: '2025-07-02 10:00:00'
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
          moves: []
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
          moves: []
        },
        recent_logs: [],
        is_loading: false
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          battle: mockBattleState
        })
      });

      const { result } = renderHook(() => useBattle(), {
        wrapper: TestWrapper
      });

      const request: バトル開始リクエスト = {
        player_id: 'player-001',
        player_pokemon_id: 'pokemon-001',
        enemy_pokemon_id: '25',
        battle_type: '野生'
      };

      await act(async () => {
        await result.current.バトル開始(request);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8788/api/battle/start',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request)
        })
      );

      expect(result.current.現在バトル).toEqual(mockBattleState);
      expect(result.current.読み込み中).toBe(false);
      expect(result.current.エラーメッセージ).toBe('');
    });

    it('バトル開始が失敗した場合エラーが設定される', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'プレイヤーのポケモンが見つかりません'
        })
      });

      const { result } = renderHook(() => useBattle(), {
        wrapper: TestWrapper
      });

      const request: バトル開始リクエスト = {
        player_id: 'player-001',
        player_pokemon_id: 'invalid-pokemon',
        enemy_pokemon_id: '25',
        battle_type: '野生'
      };

      await act(async () => {
        await result.current.バトル開始(request);
      });

      expect(result.current.現在バトル).toBeNull();
      expect(result.current.読み込み中).toBe(false);
      expect(result.current.エラーメッセージ).toBe('プレイヤーのポケモンが見つかりません');
    });

    it('ネットワークエラー時にエラーが設定される', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'));

      const { result } = renderHook(() => useBattle(), {
        wrapper: TestWrapper
      });

      const request: バトル開始リクエスト = {
        player_id: 'player-001',
        player_pokemon_id: 'pokemon-001',
        enemy_pokemon_id: '25',
        battle_type: '野生'
      };

      await act(async () => {
        await result.current.バトル開始(request);
      });

      expect(result.current.エラーメッセージ).toBe('Network Error');
    });
  });

  describe('技使用', () => {
    const setupBattleState = (): バトル状態 => ({
      session: {
        battle_id: 'battle-123',
        player_id: 'player-001',
        player_pokemon_id: 'pokemon-001',
        enemy_pokemon_id: 'wild-25',
        battle_type: '野生',
        status: '進行中',
        current_turn: 1,
        phase: 'コマンド選択',
        created_at: '2025-07-02 10:00:00'
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
        moves: [{
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
          current_pp: 30
        }]
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
        moves: []
      },
      recent_logs: [],
      is_loading: false
    });

    it('技使用が成功する', async () => {
      const mockMoveResult: 技使用結果 = {
        success: true,
        move_name: 'でんきショック',
        damage_dealt: 18,
        critical_hit: false,
        effectiveness: '普通',
        attacker_hp: 45,
        target_hp: 17,
        battle_status: '進行中',
        message: 'ピカチュウの でんきショック！18のダメージ！'
      };

      // バトル開始のモック
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          battle: setupBattleState()
        })
      });

      // 技使用のモック
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMoveResult
      });

      const { result } = renderHook(() => useBattle(), {
        wrapper: TestWrapper
      });

      // まずバトルを開始
      await act(async () => {
        await result.current.バトル開始({
          player_id: 'player-001',
          player_pokemon_id: 'pokemon-001',
          enemy_pokemon_id: '25',
          battle_type: '野生'
        });
      });

      // 技を使用
      await act(async () => {
        await result.current.技使用(4);
      });

      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:8788/api/battle/battle-123/use-move',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            battle_id: 'battle-123',
            pokemon_id: 'pokemon-001',
            move_id: 4,
            target: '敵'
          })
        })
      );

      expect(result.current.現在バトル?.enemy_pokemon.current_hp).toBe(17);
      expect(result.current.メッセージ表示中).toBe(true);
    });

    it('バトルが開始されていない状態で技使用するとエラーになる', async () => {
      const { result } = renderHook(() => useBattle(), {
        wrapper: TestWrapper
      });

      await act(async () => {
        await result.current.技使用(4);
      });

      expect(result.current.エラーメッセージ).toBe('バトルが開始されていません');
    });

    it('技使用が失敗した場合エラーが設定される', async () => {
      // バトル開始のモック
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          battle: setupBattleState()
        })
      });

      // 技使用失敗のモック
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'でんきショックのPPが足りない！'
        })
      });

      const { result } = renderHook(() => useBattle(), {
        wrapper: TestWrapper
      });

      // バトル開始
      await act(async () => {
        await result.current.バトル開始({
          player_id: 'player-001',
          player_pokemon_id: 'pokemon-001',
          enemy_pokemon_id: '25',
          battle_type: '野生'
        });
      });

      // 技使用
      await act(async () => {
        await result.current.技使用(4);
      });

      expect(result.current.エラーメッセージ).toBe('でんきショックのPPが足りない！');
      expect(result.current.アニメーション中).toBe(false);
    });
  });

  describe('技選択', () => {
    it('技選択が正しく動作する', () => {
      const { result } = renderHook(() => useBattle(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.技選択(4);
      });

      expect(result.current.選択中技).toBe(4);

      act(() => {
        result.current.技選択(null);
      });

      expect(result.current.選択中技).toBeNull();
    });
  });

  describe('エラークリア', () => {
    it('エラーメッセージがクリアされる', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Test Error'));

      const { result } = renderHook(() => useBattle(), {
        wrapper: TestWrapper
      });

      // エラーを発生させる
      await act(async () => {
        await result.current.バトル開始({
          player_id: 'player-001',
          player_pokemon_id: 'pokemon-001',
          enemy_pokemon_id: '25',
          battle_type: '野生'
        });
      });

      expect(result.current.エラーメッセージ).toBe('Test Error');

      // エラーをクリア
      act(() => {
        result.current.エラークリア();
      });

      expect(result.current.エラーメッセージ).toBe('');
    });
  });

  describe('バトル終了', () => {
    it('バトル終了が成功する', async () => {
      // バトル開始のモック
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          battle: {
            session: { battle_id: 'battle-123' }
          }
        })
      });

      // バトル終了のモック
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'バトルを終了しました'
        })
      });

      const { result } = renderHook(() => useBattle(), {
        wrapper: TestWrapper
      });

      // バトル開始
      await act(async () => {
        await result.current.バトル開始({
          player_id: 'player-001',
          player_pokemon_id: 'pokemon-001',
          enemy_pokemon_id: '25',
          battle_type: '野生'
        });
      });

      // バトル終了
      await act(async () => {
        await result.current.バトル終了('プレイヤーが逃げ出した');
      });

      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:8788/api/battle/battle-123/end',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'プレイヤーが逃げ出した' })
        })
      );

      expect(result.current.現在バトル).toBeNull();
    });
  });
});