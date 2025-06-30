import { describe, it, expect, beforeEach } from 'vitest';
import { D1Database } from '@cloudflare/workers-types';
import { プレイヤー情報取得, プレイヤー情報保存, プレイヤー情報更新 } from './playerRepository';

// モック用の型定義（初学者向け：テストで使う型を定義）
interface MockPlayerData {
  id: string;
  name: string;
  position_x: number;
  position_y: number;
  direction: string;
  sprite: string;
}

// モックD1データベース（初学者向け：テスト用の仮想データベース）
const createMockD1 = (): D1Database => {
  const データ格納庫 = new Map<string, MockPlayerData>();
  
  return {
    prepare: (sql: string) => ({
      bind: (...params: unknown[]) => ({
        first: async () => {
          // SELECT文の簡易実装
          if (sql.includes('SELECT')) {
            const id = params[0] as string;
            return データ格納庫.get(`player_${id}`) || null;
          }
          return null;
        },
        run: async () => {
          // INSERT/UPDATE文の簡易実装
          if (sql.includes('INSERT')) {
            const player: MockPlayerData = {
              id: params[0] as string,
              name: params[1] as string,
              position_x: params[2] as number,
              position_y: params[3] as number,
              direction: params[4] as string,
              sprite: params[5] as string
            };
            データ格納庫.set(`player_${params[0]}`, player);
          } else if (sql.includes('UPDATE')) {
            const existing = データ格納庫.get(`player_${params[5]}` as string);
            if (existing) {
              existing.name = params[0] as string;
              existing.position_x = params[1] as number;
              existing.position_y = params[2] as number;
              existing.direction = params[3] as string;
              existing.sprite = params[4] as string;
            }
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

describe('プレイヤーリポジトリ', () => {
  let db: D1Database;
  
  beforeEach(() => {
    db = createMockD1();
  });
  
  describe('プレイヤー情報取得', () => {
    it('存在するプレイヤーを取得できる', async () => {
      // 事前にデータを保存
      await プレイヤー情報保存(db, {
        id: '1',
        name: 'テストプレイヤー',
        position: { x: 5, y: 3 },
        direction: 'up',
        sprite: 'player'
      });
      
      // 取得テスト
      const プレイヤー = await プレイヤー情報取得(db, '1');
      
      expect(プレイヤー).toEqual({
        id: '1',
        name: 'テストプレイヤー',
        position: { x: 5, y: 3 },
        direction: 'up',
        sprite: 'player'
      });
    });
    
    it('存在しないプレイヤーはnullを返す', async () => {
      const プレイヤー = await プレイヤー情報取得(db, '999');
      expect(プレイヤー).toBeNull();
    });
  });
  
  describe('プレイヤー情報保存', () => {
    it('新規プレイヤーを保存できる', async () => {
      const 新規プレイヤー = {
        id: '2',
        name: '新しいプレイヤー',
        position: { x: 7, y: 5 },
        direction: 'down' as const,
        sprite: 'player'
      };
      
      await プレイヤー情報保存(db, 新規プレイヤー);
      
      const 保存されたプレイヤー = await プレイヤー情報取得(db, '2');
      expect(保存されたプレイヤー).toEqual(新規プレイヤー);
    });
  });
  
  describe('プレイヤー情報更新', () => {
    it('既存プレイヤーの情報を更新できる', async () => {
      // 初期データ
      await プレイヤー情報保存(db, {
        id: '3',
        name: '既存プレイヤー',
        position: { x: 1, y: 1 },
        direction: 'right',
        sprite: 'player'
      });
      
      // 更新
      await プレイヤー情報更新(db, '3', {
        position: { x: 10, y: 8 },
        direction: 'left'
      });
      
      const 更新後 = await プレイヤー情報取得(db, '3');
      expect(更新後?.position).toEqual({ x: 10, y: 8 });
      expect(更新後?.direction).toBe('left');
      expect(更新後?.name).toBe('既存プレイヤー'); // 名前は変更されない
    });
  });
});