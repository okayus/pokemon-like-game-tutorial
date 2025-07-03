// 初学者向け：新しいデータベース環境のテスト
// SQLiteアダプターとマイグレーションの基本動作を確認

import { describe, it, expect } from 'vitest';
import { getTestDatabase, createTestEnv, createCustomTestDatabase } from './dbSetup';
import { DatabaseFactory } from '../database/factory';

describe('データベース環境分離テスト', () => {
  describe('DatabaseFactory', () => {
    it('テスト環境でSQLiteアダプターを作成できる', () => {
      const env = createTestEnv();
      const db = DatabaseFactory.create(env);
      
      expect(db).toBeDefined();
      console.log('✅ SQLiteアダプター作成成功');
    });

    it('環境情報を正しく取得できる', () => {
      const env = createTestEnv();
      const info = DatabaseFactory.getEnvironmentInfo(env);
      
      expect(info.environment).toBe('test');
      expect(info.isTest).toBe(true);
      expect(info.databaseType).toBe('SQLite');
    });
  });

  describe('テスト用データベース操作', () => {
    it('基本的なSQLクエリが実行できる', async () => {
      const db = getTestDatabase();
      
      // シンプルなクエリを実行
      const result = await db.prepare('SELECT 1 as test').first<{ test: number }>();
      
      expect(result).toEqual({ test: 1 });
      console.log('✅ 基本SQLクエリ実行成功');
    });

    it('アイテムマスターデータが存在する', async () => {
      const db = getTestDatabase();
      
      // アイテムマスターデータの存在確認
      const result = await db.prepare(`
        SELECT * FROM item_master WHERE item_id = ?
      `).bind(1).first<any>();
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('きずぐすり');
      console.log('✅ アイテムマスターデータ確認成功');
    });

    it('ポケモン種族データが存在する', async () => {
      const db = getTestDatabase();
      
      // ポケモン種族データの存在確認
      const result = await db.prepare(`
        SELECT * FROM pokemon_species WHERE id = ?
      `).bind(25).first<any>();
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('ピカチュウ');
      console.log('✅ ポケモン種族データ確認成功');
    });

    it('プレイヤーデータの挿入と取得ができる', async () => {
      const db = getTestDatabase();
      
      // テストプレイヤーを挿入
      const insertResult = await db.prepare(`
        INSERT INTO players (id, name, position_x, position_y, direction, sprite)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind('test-player-001', 'テストプレイヤー', 10, 7, 'down', 'player.png').run();
      
      expect(insertResult.success).toBe(true);
      expect(insertResult.meta.changes).toBe(1);
      
      // 挿入したプレイヤーを取得
      const player = await db.prepare(`
        SELECT * FROM players WHERE id = ?
      `).bind('test-player-001').first<any>();
      
      expect(player).toMatchObject({
        id: 'test-player-001',
        name: 'テストプレイヤー',
        position_x: 10,
        position_y: 7,
      });
      
      console.log('✅ プレイヤーデータ操作成功');
    });
  });

  describe('カスタムテストデータベース', () => {
    it('独立したデータベースインスタンスを作成できる', async () => {
      const customDb = await createCustomTestDatabase();
      
      expect(customDb).toBeDefined();
      
      // 独立性の確認
      await customDb.prepare(`
        INSERT INTO players (id, name, position_x, position_y, direction, sprite)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind('custom-player', 'カスタムプレイヤー', 5, 5, 'up', 'custom.png').run();
      
      const customPlayer = await customDb.first<any>(`
        SELECT * FROM players WHERE id = 'custom-player'
      `);
      
      expect(customPlayer?.name).toBe('カスタムプレイヤー');
      
      // メインテストDBには影響していないことを確認
      const mainDb = getTestDatabase();
      const mainPlayer = await mainDb.prepare(`
        SELECT * FROM players WHERE id = 'custom-player'
      `).first();
      
      expect(mainPlayer).toBeNull();
      
      customDb.close?.();
      console.log('✅ 独立したデータベース動作確認成功');
    });
  });
});