// 初学者向け：アイテムリポジトリのテスト
// TDDアプローチでテストを先に作成し、その後実装を行う

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { アイテムリポジトリ } from './itemRepository';
import type { D1Database } from '@cloudflare/workers-types';
import type { インベントリフィルター } from '@pokemon-like-game-tutorial/shared';

// テスト用のD1データベースモック
class MockD1Database {
  private data: Map<string, unknown[]> = new Map();

  constructor() {
    // テスト用の初期データを設定
    this.data.set('item_master', [
      {
        item_id: 1,
        name: 'きずぐすり',
        description: 'ポケモンのHPを20回復する基本的な薬',
        category: '回復',
        buy_price: 300,
        sell_price: 150,
        usable: true,
        effect_type: 'HP回復',
        effect_value: 20,
        icon_url: '/icons/items/potion.png',
        max_stack: 99,
        created_at: '2025-07-01 10:00:00',
        updated_at: '2025-07-01 10:00:00',
      },
      {
        item_id: 11,
        name: 'モンスターボール',
        description: '野生のポケモンを捕まえるための基本的なボール',
        category: 'ボール',
        buy_price: 200,
        sell_price: 100,
        usable: true,
        effect_type: '捕獲',
        effect_value: 1,
        icon_url: '/icons/items/poke_ball.png',
        max_stack: 99,
        created_at: '2025-07-01 10:00:00',
        updated_at: '2025-07-01 10:00:00',
      },
    ]);

    this.data.set('player_inventory', [
      {
        player_id: 'test-player-001',
        item_id: 1,
        quantity: 5,
        obtained_at: '2025-07-01 10:00:00',
        updated_at: '2025-07-01 10:00:00',
      },
      {
        player_id: 'test-player-001',
        item_id: 11,
        quantity: 10,
        obtained_at: '2025-07-01 10:00:00',
        updated_at: '2025-07-01 10:00:00',
      },
    ]);

    this.data.set('player_money', [
      {
        player_id: 'test-player-001',
        amount: 3000,
        updated_at: '2025-07-01 10:00:00',
      },
    ]);
  }

  prepare(sql: string) {
    return {
      bind: (...params: unknown[]) => ({
        all: async () => ({ results: this.executeQuery(sql, params) }),
        first: async () => this.executeQuery(sql, params)[0] || null,
        run: async () => ({ success: true, meta: { changes: 1 } }),
      }),
      all: async () => ({ results: this.executeQuery(sql) }),
      first: async () => this.executeQuery(sql)[0] || null,
      run: async () => ({ success: true, meta: { changes: 1 } }),
    };
  }

  private executeQuery(sql: string): unknown[] {
    // 簡単なSQLパースとデータ返却（テスト用）
    if (sql.includes('FROM item_master')) {
      return this.data.get('item_master') || [];
    }
    if (sql.includes('FROM player_inventory')) {
      if (sql.includes('JOIN item_master')) {
        // インベントリとアイテムマスターのJOIN結果を模擬
        const inventory = this.data.get('player_inventory') || [];
        const items = this.data.get('item_master') || [];
        return inventory.map((inv) => {
          const item = items.find((i) => i.item_id === inv.item_id);
          return { ...item, ...inv };
        });
      }
      return this.data.get('player_inventory') || [];
    }
    if (sql.includes('FROM player_money')) {
      return this.data.get('player_money') || [];
    }
    return [];
  }

  batch(statements: unknown[]) {
    return Promise.resolve(statements.map(() => ({ success: true })));
  }
}

describe('アイテムリポジトリ', () => {
  let repository: アイテムリポジトリ;
  let mockDb: MockD1Database;

  beforeEach(() => {
    mockDb = new MockD1Database();
    repository = new アイテムリポジトリ(mockDb as unknown as D1Database);
  });

  describe('アイテムマスター関連', () => {
    it('全アイテムマスターを取得できる', async () => {
      // 初学者向け：データベースから全てのアイテム情報を取得するテスト
      const result = await repository.全アイテムマスター取得();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        item_id: 1,
        name: 'きずぐすり',
        category: '回復',
      });
      expect(result[1]).toMatchObject({
        item_id: 11,
        name: 'モンスターボール',
        category: 'ボール',
      });
    });

    it('アイテムIDで特定のアイテムを取得できる', async () => {
      // 初学者向け：特定のアイテムの詳細情報を取得するテスト
      const result = await repository.アイテムマスター取得(1);

      expect(result).toMatchObject({
        item_id: 1,
        name: 'きずぐすり',
        description: 'ポケモンのHPを20回復する基本的な薬',
        category: '回復',
        buy_price: 300,
        sell_price: 150,
        effect_type: 'HP回復',
        effect_value: 20,
      });
    });

    it('存在しないアイテムIDの場合はnullを返す', async () => {
      // 初学者向け：データが見つからない場合のエラーハンドリングテスト
      const result = await repository.アイテムマスター取得(999);

      expect(result).toBeNull();
    });

    it('カテゴリでアイテムをフィルタリングできる', async () => {
      // 初学者向け：特定のカテゴリのアイテムのみ取得するテスト
      const result = await repository.カテゴリ別アイテム取得('回復');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        item_id: 1,
        name: 'きずぐすり',
        category: '回復',
      });
    });
  });

  describe('プレイヤーインベントリ関連', () => {
    it('プレイヤーのインベントリを取得できる', async () => {
      // 初学者向け：プレイヤーが持っているアイテム一覧を取得するテスト
      const result = await repository.プレイヤーインベントリ取得('test-player-001');

      expect(result).toHaveLength(2);

      // きずぐすりの確認
      const potion = result.find((item) => item.item_id === 1);
      expect(potion).toMatchObject({
        item_id: 1,
        name: 'きずぐすり',
        quantity: 5,
        player_id: 'test-player-001',
      });

      // モンスターボールの確認
      const pokeball = result.find((item) => item.item_id === 11);
      expect(pokeball).toMatchObject({
        item_id: 11,
        name: 'モンスターボール',
        quantity: 10,
        player_id: 'test-player-001',
      });
    });

    it('フィルター条件でインベントリを絞り込める', async () => {
      // 初学者向け：検索条件を指定してアイテムを絞り込むテスト
      const filter: インベントリフィルター = {
        category: '回復',
        search_keyword: 'きず',
      };

      const result = await repository.フィルター付きインベントリ取得('test-player-001', filter);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        item_id: 1,
        name: 'きずぐすり',
        category: '回復',
      });
      expect(result.total_count).toBe(1);
    });

    it('空のインベントリの場合は空配列を返す', async () => {
      // 初学者向け：アイテムを何も持っていないプレイヤーのテスト
      const result = await repository.プレイヤーインベントリ取得('empty-player');

      expect(result).toHaveLength(0);
    });

    it('特定のアイテムの所持個数を取得できる', async () => {
      // 初学者向け：特定アイテムの所持数確認テスト
      const quantity = await repository.アイテム所持数取得('test-player-001', 1);

      expect(quantity).toBe(5);
    });

    it('所持していないアイテムの個数は0を返す', async () => {
      // 初学者向け：未所持アイテムの個数確認テスト
      const quantity = await repository.アイテム所持数取得('test-player-001', 999);

      expect(quantity).toBe(0);
    });
  });

  describe('アイテム操作関連', () => {
    it('アイテムを追加できる', async () => {
      // 初学者向け：新しいアイテムをインベントリに追加するテスト
      const result = await repository.アイテム追加('test-player-001', 2, 3);

      expect(result.success).toBe(true);
      expect(result.new_quantity).toBe(3);
    });

    it('既存アイテムの個数を増やせる', async () => {
      // 初学者向け：既に持っているアイテムの個数を増加させるテスト
      const result = await repository.アイテム追加('test-player-001', 1, 3);

      expect(result.success).toBe(true);
      expect(result.new_quantity).toBe(8); // 既存5個 + 追加3個
    });

    it('アイテムを使用できる', async () => {
      // 初学者向け：アイテムを使用して個数を減らすテスト
      const result = await repository.アイテム使用('test-player-001', 1, 2);

      expect(result.success).toBe(true);
      expect(result.remaining_quantity).toBe(3); // 5個 - 2個
    });

    it('所持数を超えてアイテムを使用しようとするとエラー', async () => {
      // 初学者向け：不正な使用に対するエラーハンドリングテスト
      const result = await repository.アイテム使用('test-player-001', 1, 10);

      expect(result.success).toBe(false);
      expect(result.error).toBe('アイテムの所持数が不足しています');
    });

    it('存在しないアイテムを使用しようとするとエラー', async () => {
      // 初学者向け：未所持アイテムの使用エラーハンドリングテスト
      const result = await repository.アイテム使用('test-player-001', 999, 1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('指定されたアイテムを所持していません');
    });
  });

  describe('所持金関連', () => {
    it('プレイヤーの所持金を取得できる', async () => {
      // 初学者向け：プレイヤーの現在の所持金を確認するテスト
      const amount = await repository.所持金取得('test-player-001');

      expect(amount).toBe(3000);
    });

    it('所持金データがない場合は0を返す', async () => {
      // 初学者向け：新規プレイヤーの所持金確認テスト
      const amount = await repository.所持金取得('new-player');

      expect(amount).toBe(0);
    });

    it('所持金を更新できる', async () => {
      // 初学者向け：アイテム購入・売却による所持金変更テスト
      const result = await repository.所持金更新('test-player-001', 2500);

      expect(result.success).toBe(true);
      expect(result.new_amount).toBe(2500);
    });

    it('負の所持金には設定できない', async () => {
      // 初学者向け：不正な所持金設定のエラーハンドリングテスト
      const result = await repository.所持金更新('test-player-001', -100);

      expect(result.success).toBe(false);
      expect(result.error).toBe('所持金は0以上である必要があります');
    });
  });

  describe('ショップ機能関連', () => {
    it('アイテムを購入できる', async () => {
      // 初学者向け：ショップでアイテムを購入するテスト
      const result = await repository.アイテム購入('test-player-001', 2, 2); // いいきずぐすり 2個

      expect(result.success).toBe(true);
      expect(result.transaction_amount).toBe(1400); // 700 × 2
      expect(result.new_money_amount).toBe(1600); // 3000 - 1400
      expect(result.new_item_quantity).toBe(2);
    });

    it('所持金不足の場合は購入できない', async () => {
      // 初学者向け：お金が足りない場合のエラーハンドリングテスト
      const result = await repository.アイテム購入('test-player-001', 2, 10); // 高額購入

      expect(result.success).toBe(false);
      expect(result.error).toBe('所持金が不足しています');
    });

    it('アイテムを売却できる', async () => {
      // 初学者向け：所持アイテムを売却するテスト
      const result = await repository.アイテム売却('test-player-001', 1, 2); // きずぐすり 2個売却

      expect(result.success).toBe(true);
      expect(result.transaction_amount).toBe(300); // 150 × 2
      expect(result.new_money_amount).toBe(3300); // 3000 + 300
      expect(result.new_item_quantity).toBe(3); // 5 - 2
    });

    it('所持数を超えて売却しようとするとエラー', async () => {
      // 初学者向け：不正な売却に対するエラーハンドリングテスト
      const result = await repository.アイテム売却('test-player-001', 1, 10);

      expect(result.success).toBe(false);
      expect(result.error).toBe('売却しようとする個数が所持数を超えています');
    });

    it('売却不可アイテムは売却できない', async () => {
      // 初学者向け：売却価格0のアイテムの売却エラーテスト
      // この場合は実装で判定する必要がある
      const result = await repository.アイテム売却('test-player-001', 31, 1); // 図鑑（売却不可）

      expect(result.success).toBe(false);
      expect(result.error).toBe('このアイテムは売却できません');
    });
  });

  afterEach(() => {
    // テスト後のクリーンアップ
    // 初学者向け：各テスト間でデータが混在しないよう初期化
  });
});
