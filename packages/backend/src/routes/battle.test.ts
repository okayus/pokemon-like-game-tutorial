// 初学者向け：バトルAPIのテスト
// TDDアプローチでバトルシステムのAPIエンドポイントをテスト

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import { battleRoutes } from './battle';
import type { Env } from '../types';
import type { 
  バトル開始リクエスト, 
  バトル開始応答,
  技使用リクエスト,
  技使用結果,
  バトル状態,
  参戦ポケモン,
  習得技詳細
} from '@pokemon-like-game-tutorial/shared';

// モックの設定
vi.mock('../db/battleRepository');
vi.mock('../db/simplePokemonRepository');

describe('Battle API Routes', () => {
  let app: Hono<{ Bindings: Env }>;
  let mockEnv: Env;

  beforeEach(() => {
    vi.clearAllMocks();
    
    app = new Hono<{ Bindings: Env }>();
    app.route('/api/battle', battleRoutes);

    // モック環境変数
    mockEnv = {
      DB: {} as any,
      FRONTEND_URL: 'http://localhost:5173'
    };
  });

  describe('POST /api/battle/start', () => {
    it('正常にバトルを開始できる', async () => {
      // モックデータ準備
      const mockPlayerPokemon: 参戦ポケモン = {
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
            current_pp: 30
          }
        ]
      };

      const mockEnemyPokemon: 参戦ポケモン = {
        pokemon_id: 'wild-16-123456',
        species_id: 16,
        name: 'ポッポ',
        level: 12,
        current_hp: 35,
        max_hp: 35,
        attack: 45,
        defense: 40,
        sprite_url: '/sprites/pidgey.png',
        moves: []
      };

      // リポジトリのモック
      const { BattleRepository } = await import('../db/battleRepository');
      const mockBattleRepo = BattleRepository.prototype;
      
      vi.mocked(mockBattleRepo.アクティブバトル取得).mockResolvedValue(null);
      vi.mocked(mockBattleRepo.参戦ポケモン取得).mockResolvedValue(mockPlayerPokemon);
      vi.mocked(mockBattleRepo.野生ポケモン作成).mockResolvedValue(mockEnemyPokemon);
      vi.mocked(mockBattleRepo.バトルセッション作成).mockResolvedValue({
        battle_id: 'battle-uuid-123',
        player_id: 'player-001',
        player_pokemon_id: 'pokemon-001',
        enemy_pokemon_id: 'wild-16-123456',
        battle_type: '野生',
        status: '進行中',
        current_turn: 1,
        phase: 'コマンド選択',
        created_at: '2025-07-02 10:00:00'
      });
      vi.mocked(mockBattleRepo.バトルログ記録).mockResolvedValue();

      const request = new Request('http://localhost/api/battle/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: 'player-001',
          player_pokemon_id: 'pokemon-001',
          enemy_pokemon_id: '16',
          battle_type: '野生'
        } as バトル開始リクエスト)
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json<バトル開始応答>();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.battle).toBeDefined();
      expect(result.battle.session.battle_id).toBe('battle-uuid-123');
      expect(result.battle.player_pokemon.name).toBe('ピカチュウ');
      expect(result.battle.enemy_pokemon.name).toBe('ポッポ');
    });

    it('必須パラメータが不足している場合エラーを返す', async () => {
      const request = new Request('http://localhost/api/battle/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: 'player-001'
          // 他のパラメータが不足
        })
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json<バトル開始応答>();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toBe('必要なパラメータが不足しています');
    });

    it('既に進行中のバトルがある場合エラーを返す', async () => {
      const { BattleRepository } = await import('../db/battleRepository');
      const mockBattleRepo = BattleRepository.prototype;
      
      vi.mocked(mockBattleRepo.アクティブバトル取得).mockResolvedValue({
        battle_id: 'existing-battle',
        player_id: 'player-001',
        player_pokemon_id: 'pokemon-001',
        enemy_pokemon_id: 'wild-16',
        battle_type: '野生',
        status: '進行中',
        current_turn: 3,
        phase: 'コマンド選択',
        created_at: '2025-07-02 09:00:00'
      });

      const request = new Request('http://localhost/api/battle/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: 'player-001',
          player_pokemon_id: 'pokemon-001',
          enemy_pokemon_id: '16',
          battle_type: '野生'
        } as バトル開始リクエスト)
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json<バトル開始応答>();

      expect(response.status).toBe(409);
      expect(result.success).toBe(false);
      expect(result.error).toBe('既に進行中のバトルがあります');
    });
  });

  describe('POST /api/battle/:battleId/use-move', () => {
    it('正常に技を使用できる', async () => {
      const mockSession = {
        battle_id: 'battle-123',
        player_id: 'player-001',
        player_pokemon_id: 'pokemon-001',
        enemy_pokemon_id: 'wild-16',
        battle_type: '野生',
        status: '進行中',
        current_turn: 1,
        phase: 'コマンド選択',
        created_at: '2025-07-02 10:00:00'
      };

      const mockPlayerPokemon: 参戦ポケモン = {
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
            current_pp: 30
          }
        ]
      };

      const mockEnemyPokemon: 参戦ポケモン = {
        pokemon_id: 'wild-16',
        species_id: 16,
        name: 'ポッポ',
        level: 12,
        current_hp: 35,
        max_hp: 35,
        attack: 45,
        defense: 40,
        sprite_url: '/sprites/pidgey.png',
        moves: []
      };

      const { BattleRepository } = await import('../db/battleRepository');
      const mockBattleRepo = BattleRepository.prototype;
      
      vi.mocked(mockBattleRepo.バトルセッション取得).mockResolvedValue(mockSession);
      vi.mocked(mockBattleRepo.参戦ポケモン取得)
        .mockResolvedValueOnce(mockPlayerPokemon)
        .mockResolvedValueOnce(mockEnemyPokemon);
      vi.mocked(mockBattleRepo.PP更新).mockResolvedValue();
      vi.mocked(mockBattleRepo.ポケモンHP更新).mockResolvedValue();
      vi.mocked(mockBattleRepo.バトルログ記録).mockResolvedValue();
      vi.mocked(mockBattleRepo.バトルセッション更新).mockResolvedValue();

      const request = new Request('http://localhost/api/battle/battle-123/use-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          battle_id: 'battle-123',
          pokemon_id: 'pokemon-001',
          move_id: 4,
          target: '敵'
        } as 技使用リクエスト)
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json<技使用結果>();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.move_name).toBe('でんきショック');
      expect(result.damage_dealt).toBeGreaterThan(0);
      expect(result.battle_status).toBe('進行中');
    });

    it('PPが不足している場合エラーメッセージを返す', async () => {
      const mockSession = {
        battle_id: 'battle-123',
        player_id: 'player-001',
        player_pokemon_id: 'pokemon-001',
        enemy_pokemon_id: 'wild-16',
        battle_type: '野生',
        status: '進行中',
        current_turn: 1,
        phase: 'コマンド選択',
        created_at: '2025-07-02 10:00:00'
      };

      const mockPlayerPokemon: 参戦ポケモン = {
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
            current_pp: 0 // PPなし
          }
        ]
      };

      const { BattleRepository } = await import('../db/battleRepository');
      const mockBattleRepo = BattleRepository.prototype;
      
      vi.mocked(mockBattleRepo.バトルセッション取得).mockResolvedValue(mockSession);
      vi.mocked(mockBattleRepo.参戦ポケモン取得).mockResolvedValue(mockPlayerPokemon);

      const request = new Request('http://localhost/api/battle/battle-123/use-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          battle_id: 'battle-123',
          pokemon_id: 'pokemon-001',
          move_id: 4,
          target: '敵'
        } as 技使用リクエスト)
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json<技使用結果>();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toBe('でんきショックのPPが足りない！');
    });
  });

  describe('GET /api/battle/:battleId/status', () => {
    it('バトル状態を正しく取得できる', async () => {
      const mockSession = {
        battle_id: 'battle-123',
        player_id: 'player-001',
        player_pokemon_id: 'pokemon-001',
        enemy_pokemon_id: 'wild-16',
        battle_type: '野生',
        status: '進行中',
        current_turn: 3,
        phase: 'コマンド選択',
        created_at: '2025-07-02 10:00:00'
      };

      const mockPlayerPokemon: 参戦ポケモン = {
        pokemon_id: 'pokemon-001',
        species_id: 25,
        name: 'ピカチュウ',
        level: 15,
        current_hp: 30,
        max_hp: 45,
        attack: 55,
        defense: 40,
        sprite_url: '/sprites/pikachu.png',
        moves: []
      };

      const mockEnemyPokemon: 参戦ポケモン = {
        pokemon_id: 'wild-16',
        species_id: 16,
        name: 'ポッポ',
        level: 12,
        current_hp: 20,
        max_hp: 35,
        attack: 45,
        defense: 40,
        sprite_url: '/sprites/pidgey.png',
        moves: []
      };

      const mockLogs = [
        {
          log_id: 3,
          battle_id: 'battle-123',
          turn_number: 3,
          action_type: '技使用',
          acting_pokemon: 'ピカチュウ',
          move_id: 4,
          damage_dealt: 15,
          message: 'ピカチュウの でんきショック！15のダメージ！',
          created_at: '2025-07-02 10:02:00'
        }
      ];

      const { BattleRepository } = await import('../db/battleRepository');
      const mockBattleRepo = BattleRepository.prototype;
      
      vi.mocked(mockBattleRepo.バトルセッション取得).mockResolvedValue(mockSession);
      vi.mocked(mockBattleRepo.参戦ポケモン取得)
        .mockResolvedValueOnce(mockPlayerPokemon)
        .mockResolvedValueOnce(mockEnemyPokemon);
      vi.mocked(mockBattleRepo.バトルログ取得).mockResolvedValue(mockLogs);

      const request = new Request('http://localhost/api/battle/battle-123/status', {
        method: 'GET'
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.battle.session.battle_id).toBe('battle-123');
      expect(result.battle.player_pokemon.current_hp).toBe(30);
      expect(result.battle.enemy_pokemon.current_hp).toBe(20);
      expect(result.battle.recent_logs).toHaveLength(1);
    });

    it('存在しないバトルIDの場合エラーを返す', async () => {
      const { BattleRepository } = await import('../db/battleRepository');
      const mockBattleRepo = BattleRepository.prototype;
      
      vi.mocked(mockBattleRepo.バトルセッション取得).mockResolvedValue(null);

      const request = new Request('http://localhost/api/battle/invalid-id/status', {
        method: 'GET'
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.success).toBe(false);
      expect(result.error).toBe('バトルが見つかりません');
    });
  });

  describe('POST /api/battle/:battleId/end', () => {
    it('バトルを正常に終了できる', async () => {
      const mockSession = {
        battle_id: 'battle-123',
        player_id: 'player-001',
        player_pokemon_id: 'pokemon-001',
        enemy_pokemon_id: 'wild-16',
        battle_type: '野生',
        status: '進行中',
        current_turn: 5,
        phase: 'コマンド選択',
        created_at: '2025-07-02 10:00:00'
      };

      const { BattleRepository } = await import('../db/battleRepository');
      const mockBattleRepo = BattleRepository.prototype;
      
      vi.mocked(mockBattleRepo.バトルセッション取得).mockResolvedValue(mockSession);
      vi.mocked(mockBattleRepo.バトルセッション更新).mockResolvedValue();
      vi.mocked(mockBattleRepo.バトルログ記録).mockResolvedValue();

      const request = new Request('http://localhost/api/battle/battle-123/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'プレイヤーが逃げ出した' })
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.message).toBe('バトルを終了しました');
      
      expect(mockBattleRepo.バトルセッション更新).toHaveBeenCalledWith(
        'battle-123',
        expect.objectContaining({
          status: '終了',
          ended_at: expect.any(String)
        })
      );
    });
  });

  describe('GET /api/battle/moves', () => {
    it('全技データを取得できる', async () => {
      const mockMoves = [
        {
          move_id: 1,
          name: 'たいあたり',
          type: 'ノーマル',
          power: 40,
          accuracy: 100,
          pp: 35,
          category: '物理',
          description: '全身で相手にぶつかって攻撃する。',
          created_at: '2025-07-02 00:00:00',
          updated_at: '2025-07-02 00:00:00'
        },
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
          updated_at: '2025-07-02 00:00:00'
        }
      ];

      const { BattleRepository } = await import('../db/battleRepository');
      const mockBattleRepo = BattleRepository.prototype;
      
      vi.mocked(mockBattleRepo.全技取得).mockResolvedValue(mockMoves);

      const request = new Request('http://localhost/api/battle/moves', {
        method: 'GET'
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.moves).toHaveLength(2);
      expect(result.count).toBe(2);
    });
  });
});