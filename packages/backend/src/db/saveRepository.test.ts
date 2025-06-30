import { describe, it, expect, beforeEach } from 'vitest';
import { D1Database } from '@cloudflare/workers-types';
import { セーブデータ取得, セーブデータ保存, セーブデータ削除, ユーザーの全セーブデータ取得 } from './saveRepository';

// モック用の型定義（初学者向け：テストで使う型を定義）
interface MockSaveData {
  id: number;
  user_id: number;
  slot: number;
  data: string;
  updated_at: string;
}

// モックD1データベース（初学者向け：テスト用の仮想データベース）
const createMockD1 = (): D1Database => {
  const データ格納庫 = new Map<string, MockSaveData>();
  let 次のID = 1;
  
  return {
    prepare: (sql: string) => ({
      bind: (...params: unknown[]) => ({
        first: async () => {
          // SELECT文の簡易実装
          if (sql.includes('SELECT') && sql.includes('WHERE user_id = ? AND slot = ?')) {
            const userId = params[0] as number;
            const slot = params[1] as number;
            const key = `save_${userId}_${slot}`;
            return データ格納庫.get(key) || null;
          }
          return null;
        },
        all: async () => {
          // SELECT文で全件取得の簡易実装
          if (sql.includes('SELECT') && sql.includes('WHERE user_id = ?')) {
            const userId = params[0] as number;
            const results: MockSaveData[] = [];
            データ格納庫.forEach((value, key) => {
              if (key.startsWith(`save_${userId}_`)) {
                results.push(value);
              }
            });
            return { results };
          }
          return { results: [] };
        },
        run: async () => {
          // INSERT OR REPLACE文の簡易実装
          if (sql.includes('INSERT OR REPLACE')) {
            const save: MockSaveData = {
              id: 次のID++,
              user_id: params[0] as number,
              slot: params[1] as number,
              data: params[2] as string,
              updated_at: new Date().toISOString()
            };
            const key = `save_${params[0]}_${params[1]}`;
            データ格納庫.set(key, save);
          } else if (sql.includes('DELETE')) {
            const userId = params[0] as number;
            const slot = params[1] as number;
            const key = `save_${userId}_${slot}`;
            データ格納庫.delete(key);
          }
          return { success: true };
        }
      })
    }),
    batch: async () => [],
    dump: async () => new ArrayBuffer(0),
    exec: async () => ({ count: 0, duration: 0 })
  } as unknown as D1Database;
};

describe('セーブリポジトリ', () => {
  let db: D1Database;
  
  beforeEach(() => {
    db = createMockD1();
  });
  
  describe('セーブデータ保存', () => {
    it('新規セーブデータを保存できる', async () => {
      const セーブデータ = {
        version: '1.0.0',
        player: {
          name: 'テストプレイヤー',
          position: { x: 5, y: 3 },
          direction: 'up'
        },
        currentMap: 'town',
        playTime: 1234,
        savedAt: new Date().toISOString()
      };
      
      await セーブデータ保存(db, 1, 1, セーブデータ);
      
      const 保存されたデータ = await セーブデータ取得(db, 1, 1);
      expect(保存されたデータ).toEqual(セーブデータ);
    });
    
    it('既存のセーブデータを上書きできる', async () => {
      // 初回保存
      const 初回データ = {
        version: '1.0.0',
        player: {
          name: '初回プレイヤー',
          position: { x: 1, y: 1 },
          direction: 'down'
        },
        currentMap: 'town',
        playTime: 100,
        savedAt: new Date().toISOString()
      };
      await セーブデータ保存(db, 1, 1, 初回データ);
      
      // 上書き保存
      const 更新データ = {
        version: '1.0.0',
        player: {
          name: '更新プレイヤー',
          position: { x: 10, y: 10 },
          direction: 'left'
        },
        currentMap: 'dungeon',
        playTime: 5000,
        savedAt: new Date().toISOString()
      };
      await セーブデータ保存(db, 1, 1, 更新データ);
      
      const 保存されたデータ = await セーブデータ取得(db, 1, 1);
      expect(保存されたデータ).toEqual(更新データ);
    });
  });
  
  describe('セーブデータ取得', () => {
    it('存在しないセーブデータはnullを返す', async () => {
      const データ = await セーブデータ取得(db, 999, 1);
      expect(データ).toBeNull();
    });
  });
  
  describe('ユーザーの全セーブデータ取得', () => {
    it('複数スロットのセーブデータを取得できる', async () => {
      // 3つのスロットにデータを保存
      const データ1 = {
        version: '1.0.0',
        player: { name: 'スロット1', position: { x: 1, y: 1 }, direction: 'down' },
        currentMap: 'town',
        playTime: 100,
        savedAt: new Date().toISOString()
      };
      const データ2 = {
        version: '1.0.0',
        player: { name: 'スロット2', position: { x: 2, y: 2 }, direction: 'up' },
        currentMap: 'town',
        playTime: 200,
        savedAt: new Date().toISOString()
      };
      
      await セーブデータ保存(db, 1, 1, データ1);
      await セーブデータ保存(db, 1, 2, データ2);
      
      const 全データ = await ユーザーの全セーブデータ取得(db, 1);
      
      expect(全データ).toHaveLength(2);
      expect(全データ[0]).toEqual({ slot: 1, data: データ1, updatedAt: expect.any(String) });
      expect(全データ[1]).toEqual({ slot: 2, data: データ2, updatedAt: expect.any(String) });
    });
  });
  
  describe('セーブデータ削除', () => {
    it('指定したスロットのデータを削除できる', async () => {
      const データ = {
        version: '1.0.0',
        player: { name: '削除テスト', position: { x: 1, y: 1 }, direction: 'down' },
        currentMap: 'town',
        playTime: 100,
        savedAt: new Date().toISOString()
      };
      
      await セーブデータ保存(db, 1, 1, データ);
      await セーブデータ削除(db, 1, 1);
      
      const 削除後 = await セーブデータ取得(db, 1, 1);
      expect(削除後).toBeNull();
    });
  });
});