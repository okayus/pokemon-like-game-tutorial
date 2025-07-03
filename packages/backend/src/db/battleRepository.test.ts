// 初学者向け：バトルリポジトリのテスト
// TDDアプローチでバトルシステムのデータベース操作をテスト

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BattleRepository } from './battleRepository';
import type { D1Database } from '@cloudflare/workers-types';
import type { 技データ, バトルセッション, 習得技詳細 } from '@pokemon-like-game-tutorial/shared';

// D1Databaseのモック作成
const createMockD1 = () => {
  const mockResults = {
    results: [],
    success: true,
    meta: {},
  };

  const mockStatement = {
    bind: vi.fn().mockReturnThis(),
    all: vi.fn().mockResolvedValue(mockResults),
    first: vi.fn().mockResolvedValue(null),
    run: vi.fn().mockResolvedValue({ success: true, meta: {} }),
  };

  return {
    prepare: vi.fn().mockReturnValue(mockStatement),
    batch: vi.fn().mockResolvedValue([]),
    dump: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    exec: vi.fn().mockResolvedValue({ count: 0 }),
    _mockStatement: mockStatement,
    _mockResults: mockResults,
  } as unknown as D1Database & {
    _mockStatement: unknown;
    _mockResults: unknown;
  };
};

describe('BattleRepository', () => {
  let mockDB: D1Database & { _mockStatement: unknown; _mockResults: unknown };
  let repository: BattleRepository;

  beforeEach(() => {
    mockDB = createMockD1();
    repository = new BattleRepository(mockDB);
  });

  describe('技データ操作', () => {
    it('全技取得が正しく動作する', async () => {
      const mockMoves: 技データ[] = [
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
          updated_at: '2025-07-02 00:00:00',
        },
      ];

      mockDB._mockResults.results = mockMoves;

      const result = await repository.全技取得();

      expect(mockDB.prepare).toHaveBeenCalledWith('SELECT * FROM move_master ORDER BY move_id');
      expect(result).toEqual(mockMoves);
    });

    it('技IDから技データを取得できる', async () => {
      const mockMove: 技データ = {
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
      };

      mockDB._mockStatement.first.mockResolvedValue(mockMove);

      const result = await repository.技取得(4);

      expect(mockDB.prepare).toHaveBeenCalledWith('SELECT * FROM move_master WHERE move_id = ?');
      expect(mockDB._mockStatement.bind).toHaveBeenCalledWith(4);
      expect(result).toEqual(mockMove);
    });

    it('存在しない技IDの場合nullを返す', async () => {
      mockDB._mockStatement.first.mockResolvedValue(null);

      const result = await repository.技取得(999);

      expect(result).toBeNull();
    });
  });

  describe('ポケモン習得技操作', () => {
    it('ポケモンの習得技を正しく取得できる', async () => {
      const mockMoves: 習得技詳細[] = [
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
          current_pp: 25,
        },
      ];

      mockDB._mockResults.results = mockMoves;

      const result = await repository.ポケモン習得技取得('test-pokemon-001');

      expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('pokemon_moves'));
      expect(mockDB._mockStatement.bind).toHaveBeenCalledWith('test-pokemon-001');
      expect(result).toEqual(mockMoves);
    });

    it('技習得が正しく実行される', async () => {
      const mockMove: 技データ = {
        move_id: 1,
        name: 'たいあたり',
        type: 'ノーマル',
        power: 40,
        accuracy: 100,
        pp: 35,
        category: '物理',
        description: '全身で相手にぶつかって攻撃する。',
        created_at: '2025-07-02 00:00:00',
        updated_at: '2025-07-02 00:00:00',
      };

      // 技取得のモック設定
      mockDB._mockStatement.first.mockResolvedValue(mockMove);

      await repository.技習得('test-pokemon-001', 1);

      expect(mockDB.prepare).toHaveBeenCalledTimes(2); // 技取得と技習得
      expect(mockDB._mockStatement.run).toHaveBeenCalled();
    });

    it('存在しない技を習得しようとするとエラーになる', async () => {
      mockDB._mockStatement.first.mockResolvedValue(null);

      await expect(repository.技習得('test-pokemon-001', 999)).rejects.toThrow(
        '技ID 999 が見つかりません'
      );
    });
  });

  describe('バトルセッション操作', () => {
    it('バトルセッションを作成できる', async () => {
      const result = await repository.バトルセッション作成(
        'battle-123',
        'player-001',
        'pokemon-001',
        'wild-25',
        '野生'
      );

      expect(mockDB.prepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO battle_sessions')
      );
      expect(result).toMatchObject({
        battle_id: 'battle-123',
        player_id: 'player-001',
        player_pokemon_id: 'pokemon-001',
        enemy_pokemon_id: 'wild-25',
        battle_type: '野生',
        status: '進行中',
        current_turn: 1,
        phase: 'コマンド選択',
      });
    });

    it('バトルセッションを取得できる', async () => {
      const mockSession: バトルセッション = {
        battle_id: 'battle-123',
        player_id: 'player-001',
        player_pokemon_id: 'pokemon-001',
        enemy_pokemon_id: 'wild-25',
        battle_type: '野生',
        status: '進行中',
        current_turn: 3,
        phase: 'コマンド選択',
        created_at: '2025-07-02 10:00:00',
      };

      mockDB._mockStatement.first.mockResolvedValue(mockSession);

      const result = await repository.バトルセッション取得('battle-123');

      expect(mockDB.prepare).toHaveBeenCalledWith(
        'SELECT * FROM battle_sessions WHERE battle_id = ?'
      );
      expect(result).toEqual(mockSession);
    });

    it('バトルセッションを更新できる', async () => {
      await repository.バトルセッション更新('battle-123', {
        current_turn: 5,
        phase: '技実行確認',
        status: '終了',
        winner: '味方',
      });

      expect(mockDB.prepare).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE battle_sessions')
      );
      expect(mockDB._mockStatement.bind).toHaveBeenCalledWith(
        5,
        '技実行確認',
        '終了',
        '味方',
        'battle-123'
      );
    });
  });

  describe('バトルログ操作', () => {
    it('バトルログを記録できる', async () => {
      await repository.バトルログ記録(
        'battle-123',
        1,
        '技使用',
        'ピカチュウ',
        'ピカチュウの でんきショック！',
        4,
        18
      );

      expect(mockDB.prepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO battle_logs')
      );
      expect(mockDB._mockStatement.bind).toHaveBeenCalledWith(
        'battle-123',
        1,
        '技使用',
        'ピカチュウ',
        4,
        18,
        'ピカチュウの でんきショック！'
      );
    });

    it('バトルログを取得できる', async () => {
      const mockLogs = [
        {
          log_id: 1,
          battle_id: 'battle-123',
          turn_number: 1,
          action_type: '技使用',
          acting_pokemon: 'ピカチュウ',
          move_id: 4,
          damage_dealt: 18,
          message: 'ピカチュウの でんきショック！',
          created_at: '2025-07-02 10:00:00',
        },
      ];

      mockDB._mockResults.results = mockLogs;

      const result = await repository.バトルログ取得('battle-123', 5);

      expect(mockDB.prepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM battle_logs')
      );
      expect(result).toEqual(mockLogs);
    });
  });

  describe('ポケモンHP更新', () => {
    it('通常のポケモンのHPを更新できる', async () => {
      await repository.ポケモンHP更新('pokemon-001', 30);

      expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE owned_pokemon'));
      expect(mockDB._mockStatement.bind).toHaveBeenCalledWith(30, 'pokemon-001');
    });

    it('野生ポケモンのHP更新はスキップされる', async () => {
      await repository.ポケモンHP更新('wild-25-123456', 30);

      expect(mockDB.prepare).not.toHaveBeenCalled();
    });
  });

  describe('アクティブバトル取得', () => {
    it('進行中のバトルを取得できる', async () => {
      const mockSession: バトルセッション = {
        battle_id: 'battle-123',
        player_id: 'player-001',
        player_pokemon_id: 'pokemon-001',
        enemy_pokemon_id: 'wild-25',
        battle_type: '野生',
        status: '進行中',
        current_turn: 1,
        phase: 'コマンド選択',
        created_at: '2025-07-02 10:00:00',
      };

      mockDB._mockStatement.first.mockResolvedValue(mockSession);

      const result = await repository.アクティブバトル取得('player-001');

      expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining("status = '進行中'"));
      expect(result).toEqual(mockSession);
    });

    it('進行中のバトルがない場合nullを返す', async () => {
      mockDB._mockStatement.first.mockResolvedValue(null);

      const result = await repository.アクティブバトル取得('player-001');

      expect(result).toBeNull();
    });
  });
});
