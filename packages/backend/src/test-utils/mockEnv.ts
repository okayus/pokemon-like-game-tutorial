// 初学者向け：テスト用の環境変数モック
// Cloudflare WorkersのBindingsをテスト環境で模擬

import { vi } from 'vitest';

// モックD1Databaseクラス
export class MockD1Database {
  private data: Map<string, any[]> = new Map();

  constructor() {
    this.setupInitialData();
  }

  prepare(sql: string) {
    const self = this;
    return {
      bind: (...params: any[]) => ({
        all: async () => ({ results: self.executeQuery(sql, params) }),
        first: async () => self.executeQuery(sql, params)[0] || null,
        run: async () => ({ success: true, meta: { changes: 1 } })
      }),
      all: async () => ({ results: self.executeQuery(sql) }),
      first: async () => self.executeQuery(sql)[0] || null,
      run: async () => ({ success: true, meta: { changes: 1 } })
    };
  }

  batch(statements: any[]) {
    return Promise.resolve(statements.map(() => ({ success: true })));
  }

  private executeQuery(sql: string, params: any[] = []): any[] {
    // シンプルなSQLパーサー（テスト用）
    if (sql.includes('FROM pokemon_master')) {
      const results = this.data.get('pokemon_master') || [];
      if (sql.includes('WHERE species_id = ?') && params[0]) {
        return results.filter(p => p.species_id === params[0]);
      }
      return results;
    }
    if (sql.includes('FROM owned_pokemon')) {
      return this.data.get('owned_pokemon') || [];
    }
    if (sql.includes('FROM battle_sessions')) {
      return this.data.get('battle_sessions') || [];
    }
    if (sql.includes('FROM moves_master')) {
      return this.data.get('moves_master') || [];
    }
    if (sql.includes('FROM item_master')) {
      return this.data.get('item_master') || [];
    }
    if (sql.includes('FROM player_inventory')) {
      return this.data.get('player_inventory') || [];
    }
    if (sql.includes('FROM player_money')) {
      return this.data.get('player_money') || [];
    }
    if (sql.includes('FROM players')) {
      return this.data.get('players') || [];
    }
    return [];
  }

  private setupInitialData() {
    // ポケモンマスターデータ
    this.data.set('pokemon_master', [
      {
        species_id: 25,
        name: 'ピカチュウ',
        type1: 'でんき',
        type2: null,
        base_hp: 35,
        base_attack: 55,
        base_defense: 40,
        base_speed: 90,
        description: 'ほっぺたの電気袋に電気をためる。',
        sprite_url: '/sprites/pikachu.png',
        created_at: '2025-07-01 00:00:00',
        updated_at: '2025-07-01 00:00:00'
      }
    ]);

    // プレイヤーデータ
    this.data.set('players', [
      {
        player_id: 'test-player-123',
        name: 'テストプレイヤー',
        money: 3000,
        play_time: 3600,
        badges: 0,
        created_at: '2025-07-01 00:00:00',
        updated_at: '2025-07-01 00:00:00'
      }
    ]);

    // 技マスターデータ
    this.data.set('moves_master', [
      {
        move_id: 1,
        name: 'でんきショック',
        type: 'でんき',
        category: '特殊',
        power: 40,
        accuracy: 100,
        pp: 30,
        description: '電気の刺激で相手を攻撃',
        created_at: '2025-07-01 00:00:00',
        updated_at: '2025-07-01 00:00:00'
      }
    ]);

    // アイテムマスターデータ
    this.data.set('item_master', [
      {
        item_id: 1,
        name: 'きずぐすり',
        description: 'HPを20回復',
        category: '回復',
        buy_price: 300,
        sell_price: 150,
        usable: true,
        effect_type: 'HP回復',
        effect_value: 20,
        icon_url: '/icons/potion.png',
        max_stack: 99,
        created_at: '2025-07-01 00:00:00',
        updated_at: '2025-07-01 00:00:00'
      }
    ]);

    // プレイヤー所持金
    this.data.set('player_money', [
      {
        player_id: 'test-player-123',
        amount: 3000,
        updated_at: '2025-07-01 00:00:00'
      }
    ]);
  }
}

// テスト用の環境変数を作成
export function createMockEnv() {
  const mockDB = new MockD1Database();
  
  return {
    DB: mockDB,
    ENVIRONMENT: 'test'
  };
}

// Honoアプリにモック環境を注入するヘルパー
export function injectMockEnv(app: any) {
  const mockEnv = createMockEnv();
  
  // すべてのルートハンドラーでenv.DBが使えるようにする
  app.use('*', async (c: any, next: any) => {
    c.env = mockEnv;
    await next();
  });
  
  return mockEnv;
}