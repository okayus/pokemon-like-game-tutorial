// 初学者向け：テスト用の環境変数モック
// Cloudflare WorkersのBindingsをテスト環境で模擬

// import { vi } from 'vitest'; // 未使用のため一時的にコメントアウト

// モックD1Databaseクラス
export class MockD1Database {
  private data: Map<string, Record<string, unknown>[]> = new Map();

  constructor() {
    this.setupInitialData();
  }

  prepare(sql: string) {
    // const self = this; // ESLintエラー回避のため直接thisを使用
    return {
      bind: (...params: unknown[]) => ({
        all: async () => ({ results: this.executeQuery(sql, params) }),
        first: async () => this.executeQuery(sql, params)[0] || null,
        run: async () => {
          this.executeQuery(sql, params);
          return { success: true, meta: { changes: 1 } };
        },
      }),
      all: async () => ({ results: this.executeQuery(sql) }),
      first: async () => this.executeQuery(sql)[0] || null,
      run: async () => {
        this.executeQuery(sql);
        return { success: true, meta: { changes: 1 } };
      },
    };
  }

  batch(statements: unknown[]) {
    return Promise.resolve(statements.map(() => ({ success: true })));
  }

  private executeQuery(sql: string, params: unknown[] = []): Record<string, unknown>[] {
    // INSERT文の処理
    if (sql.includes('INSERT INTO')) {
      if (sql.includes('INSERT INTO players')) {
        const newPlayer = {
          id: params[0] || `player-${Date.now()}`,
          name: params[1] || 'プレイヤー',
          position_x: params[2] || 7,
          position_y: params[3] || 5,
          direction: params[4] || 'down',
          sprite: params[5] || 'player.png',
        };
        const players = this.data.get('players') || [];
        players.push(newPlayer);
        this.data.set('players', players);
        return [newPlayer];
      }
      if (sql.includes('INSERT INTO owned_pokemon')) {
        const newPokemon = {
          pokemon_id: params[0],
          player_id: params[1],
          species_id: params[2],
          nickname: params[3],
          level: params[4],
          current_hp: params[5],
          max_hp: params[6],
          created_at: new Date().toISOString(),
        };
        const owned = this.data.get('owned_pokemon') || [];
        owned.push(newPokemon);
        this.data.set('owned_pokemon', owned);
        return [newPokemon];
      }
      return [];
    }

    // シンプルなSQLパーサー（テスト用）
    if (sql.includes('FROM pokemon_master') || sql.includes('pokemon_species')) {
      const results = this.data.get('pokemon_master') || [];
      if (sql.includes('WHERE species_id = ?') && params[0]) {
        return results.filter((p) => p.species_id === params[0]);
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
    if (sql.includes('JOIN item_master') && sql.includes('player_inventory')) {
      // インベントリとアイテムマスターの結合クエリ
      const inventory = this.data.get('player_inventory') || [];
      const items = this.data.get('item_master') || [];
      return inventory.map((inv) => {
        const item = items.find((i) => i.item_id === inv.item_id);
        return { ...item, ...inv };
      });
    }
    if (sql.includes('FROM player_inventory')) {
      return this.data.get('player_inventory') || [];
    }
    if (sql.includes('FROM player_money')) {
      const results = this.data.get('player_money') || [];
      if (params[0]) {
        return results.filter((p) => p.player_id === params[0]);
      }
      return results;
    }
    if (sql.includes('FROM players')) {
      const results = this.data.get('players') || [];
      if (sql.includes('WHERE') && params[0]) {
        return results.filter((p) => p.player_id === params[0]);
      }
      return results;
    }
    return [];
  }

  private setupInitialData() {
    // ポケモンマスターデータ
    this.data.set('pokemon_master', [
      {
        species_id: 1,
        name: 'フシギダネ',
        type1: 'くさ',
        type2: 'どく',
        base_hp: 45,
        base_attack: 49,
        base_defense: 49,
        base_speed: 45,
        description: '背中の種から養分をもらって大きくなる。',
        sprite_url: '/sprites/bulbasaur.png',
        created_at: '2025-07-01 00:00:00',
        updated_at: '2025-07-01 00:00:00',
      },
      {
        species_id: 7,
        name: 'ゼニガメ',
        type1: 'みず',
        type2: null,
        base_hp: 44,
        base_attack: 48,
        base_defense: 65,
        base_speed: 43,
        description: '甲羅に閉じこもって身を守る。',
        sprite_url: '/sprites/squirtle.png',
        created_at: '2025-07-01 00:00:00',
        updated_at: '2025-07-01 00:00:00',
      },
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
        updated_at: '2025-07-01 00:00:00',
      },
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
        updated_at: '2025-07-01 00:00:00',
      },
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
        updated_at: '2025-07-01 00:00:00',
      },
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
        updated_at: '2025-07-01 00:00:00',
      },
    ]);

    // プレイヤー所持金
    this.data.set('player_money', [
      {
        player_id: 'test-player-123',
        amount: 3000,
        updated_at: '2025-07-01 00:00:00',
      },
      {
        player_id: 'test-player-001',
        amount: 3000,
        updated_at: '2025-07-01 00:00:00',
      },
    ]);

    // プレイヤーインベントリ
    this.data.set('player_inventory', [
      {
        player_id: 'test-player-001',
        item_id: 1,
        quantity: 5,
        obtained_at: '2025-07-01 10:00:00',
      },
    ]);
  }
}

// テスト用の環境変数を作成
export function createMockEnv() {
  const mockDB = new MockD1Database();

  return {
    DB: mockDB,
    ENVIRONMENT: 'test',
  };
}

// Honoアプリにモック環境を注入するヘルパー
export function injectMockEnv(app: {
  use: (
    pattern: string,
    handler: (c: { env?: unknown }, next: () => Promise<void>) => Promise<void>
  ) => void;
}) {
  const mockEnv = createMockEnv();

  // すべてのルートハンドラーでenv.DBが使えるようにする
  app.use('*', async (c: { env?: unknown }, next: () => Promise<void>) => {
    c.env = mockEnv;
    await next();
  });

  return mockEnv;
}
