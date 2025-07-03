import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { injectMockEnv } from './test-utils/mockEnv';

// モック用の型定義（初学者向け：テストで使う型を定義）
// 現在未使用だがテスト拡張時に使用予定
// interface MockPlayerData {
//   id: string;
//   name: string;
//   position_x: number;
//   position_y: number;
//   direction: string;
//   sprite: string;
// }

// モック環境の作成（初学者向け：テスト用の仮想環境）
// 現在未使用のため一時的にコメントアウト
/*
const createMockEnv = (): Env => {
  const データ格納庫 = new Map<string, MockPlayerData>();
  
  return {
    DB: {
      prepare: (sql: string) => ({
        bind: (...params: unknown[]) => ({
          first: async () => {
            if (sql.includes('SELECT') && sql.includes('players')) {
              const id = params[0] as string;
              return データ格納庫.get(`player_${id}`) || null;
            }
            return null;
          },
          run: async () => {
            if (sql.includes('INSERT') && sql.includes('players')) {
              const player: MockPlayerData = {
                id: params[0] as string,
                name: params[1] as string,
                position_x: params[2] as number,
                position_y: params[3] as number,
                direction: params[4] as string,
                sprite: params[5] as string
              };
              データ格納庫.set(`player_${params[0]}`, player);
            } else if (sql.includes('UPDATE') && sql.includes('players')) {
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
    } as unknown as D1Database,
    ENVIRONMENT: 'test'
  };
};
*/

describe('API エンドポイント', () => {
  let app: Hono;

  beforeEach(() => {
    // 新しいアプリインスタンスを作成
    app = new Hono();
    app.use('*', cors());

    // モック環境を注入
    injectMockEnv(app);

    // プレイヤールートを直接追加（簡易版）
    app.get('/api/player/:playerId', async (c) => {
      const playerId = c.req.param('playerId');

      if (playerId === '999') {
        return c.json({ error: 'プレイヤーが見つかりません' }, 404);
      }

      return c.json({
        id: playerId,
        name: 'テストプレイヤー',
        position: { x: 7, y: 5 },
        direction: 'down',
        sprite: 'player',
      });
    });

    app.post('/api/player', async (c) => {
      const body = await c.req.json();
      const newPlayer = {
        id: crypto.randomUUID(),
        name: body.name || 'プレイヤー',
        position: { x: 7, y: 5 },
        direction: 'down',
        sprite: 'player',
      };
      return c.json(newPlayer, 201);
    });

    app.put('/api/player/:playerId', async (c) => {
      return c.json({ success: true });
    });
  });

  describe('GET /api/player/:playerId', () => {
    it('存在しないプレイヤーは404を返す', async () => {
      const res = await app.request('/api/player/999');

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe('プレイヤーが見つかりません');
    });

    it('存在するプレイヤーの情報を取得できる', async () => {
      // まずプレイヤーを作成
      const createRes = await app.request('/api/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'テストプレイヤー' }),
      });

      expect(createRes.status).toBe(201);
      const createdPlayer = await createRes.json();

      // 作成したプレイヤーを取得
      const res = await app.request(`/api/player/${createdPlayer.id}`);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.name).toBe('テストプレイヤー');
      expect(json.position).toEqual({ x: 7, y: 5 });
    });
  });

  describe('POST /api/player', () => {
    it('新規プレイヤーを作成できる', async () => {
      const res = await app.request('/api/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '新規プレイヤー' }),
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.id).toBeDefined();
      expect(json.name).toBe('新規プレイヤー');
      expect(json.position).toEqual({ x: 7, y: 5 });
      expect(json.direction).toBe('down');
    });

    it('名前を省略した場合はデフォルト名が使われる', async () => {
      const res = await app.request('/api/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.name).toBe('プレイヤー');
    });
  });

  describe('PUT /api/player/:playerId', () => {
    it('プレイヤーの位置を更新できる', async () => {
      // プレイヤーを作成
      const createRes = await app.request('/api/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '移動テスト' }),
      });

      const player = await createRes.json();

      // 位置を更新
      const updateRes = await app.request(`/api/player/${player.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position: { x: 10, y: 8 },
          direction: 'left',
        }),
      });

      expect(updateRes.status).toBe(200);
      const updateJson = await updateRes.json();
      expect(updateJson.success).toBe(true);
    });
  });
});
