// 初学者向け：アイテム・インベントリAPIのテスト
// TDDアプローチでAPIの動作をテストする

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { アイテムルート } from './items';
import { injectMockEnv } from '../test-utils/mockEnv';

// モック環境のインポートを使用

describe('アイテムAPIルート', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    
    // モック環境を注入
    injectMockEnv(app);
    
    // アイテムルートを追加
    app.route('/api/items', アイテムルート);
  });

  describe('GET /api/items/master', () => {
    it('全アイテムマスターデータを取得できる', async () => {
      // 初学者向け：全てのアイテム情報を取得するAPIのテスト
      const res = await app.request('/api/items/master');
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.items).toHaveLength(1);
      expect(data.items[0]).toMatchObject({
        item_id: 1,
        name: 'きずぐすり',
        category: '回復'
      });
    });

    it('カテゴリでフィルタリングできる', async () => {
      // 初学者向け：特定カテゴリのアイテムのみ取得するテスト
      const res = await app.request('/api/items/master?category=回復');
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].category).toBe('回復');
    });
  });

  describe('GET /api/items/master/:itemId', () => {
    it('特定のアイテムマスターデータを取得できる', async () => {
      // 初学者向け：アイテムIDを指定して詳細情報を取得するテスト
      const res = await app.request('/api/items/master/1');
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.item).toMatchObject({
        item_id: 1,
        name: 'きずぐすり',
        description: 'ポケモンのHPを20回復する基本的な薬'
      });
    });

    it('存在しないアイテムIDの場合は404エラー', async () => {
      // 初学者向け：存在しないアイテムのリクエストエラーハンドリングテスト
      const res = await app.request('/api/items/master/999');
      
      expect(res.status).toBe(404);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('アイテムが見つかりません');
    });

    it('不正なアイテムIDの場合は400エラー', async () => {
      // 初学者向け：無効なパラメータのバリデーションテスト
      const res = await app.request('/api/items/master/invalid');
      
      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('無効なアイテムIDです');
    });
  });

  describe('GET /api/items/inventory/:playerId', () => {
    it('プレイヤーのインベントリを取得できる', async () => {
      // 初学者向け：プレイヤーの所持アイテム一覧を取得するテスト
      const res = await app.request('/api/items/inventory/test-player-001');
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.items).toHaveLength(1);
      expect(data.items[0]).toMatchObject({
        item_id: 1,
        name: 'きずぐすり',
        quantity: 5
      });
      expect(data.player_money).toBe(3000);
    });

    it('フィルター条件でインベントリを絞り込める', async () => {
      // 初学者向け：検索条件付きでアイテムを取得するテスト
      const res = await app.request('/api/items/inventory/test-player-001?category=回復&search=きず');
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.items).toHaveLength(1);
    });

    it('ページネーションが動作する', async () => {
      // 初学者向け：ページング機能のテスト
      const res = await app.request('/api/items/inventory/test-player-001?page=1&limit=10');
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.current_page).toBe(1);
      expect(data.total_pages).toBeGreaterThanOrEqual(1);
    });

    it('存在しないプレイヤーの場合は空のインベントリを返す', async () => {
      // 初学者向け：存在しないプレイヤーのエラーハンドリングテスト
      const res = await app.request('/api/items/inventory/non-existent-player');
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.items).toHaveLength(0);
    });
  });

  describe('POST /api/items/use', () => {
    it('アイテムを使用できる', async () => {
      // 初学者向け：アイテム使用APIのテスト
      const requestBody = {
        player_id: 'test-player-001',
        item_id: 1,
        quantity: 1,
        target_id: 'pokemon-001'
      };
      
      const res = await app.request('/api/items/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('使用しました');
      expect(data.remaining_quantity).toBe(4);
    });

    it('必須パラメータが不足している場合は400エラー', async () => {
      // 初学者向け：不正なリクエストのバリデーションテスト
      const requestBody = {
        player_id: 'test-player-001'
        // item_id と quantity が不足
      };
      
      const res = await app.request('/api/items/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('必須パラメータ');
    });

    it('使用不可アイテムの場合は400エラー', async () => {
      // 初学者向け：使用できないアイテムのエラーハンドリングテスト
      const requestBody = {
        player_id: 'test-player-001',
        item_id: 31, // 図鑑（使用不可）
        quantity: 1
      };
      
      const res = await app.request('/api/items/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('このアイテムは使用できません');
    });
  });

  describe('POST /api/items/purchase', () => {
    it('アイテムを購入できる', async () => {
      // 初学者向け：アイテム購入APIのテスト
      const requestBody = {
        player_id: 'test-player-001',
        item_id: 1,
        quantity: 2
      };
      
      const res = await app.request('/api/items/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('購入しました');
      expect(data.transaction_amount).toBe(600); // 300 × 2
      expect(data.new_money_amount).toBe(2400); // 3000 - 600
    });

    it('所持金不足の場合は400エラー', async () => {
      // 初学者向け：所持金不足のエラーハンドリングテスト
      const requestBody = {
        player_id: 'test-player-001',
        item_id: 1,
        quantity: 20 // 高額購入（6000円）
      };
      
      const res = await app.request('/api/items/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('所持金が不足しています');
    });
  });

  describe('POST /api/items/sell', () => {
    it('アイテムを売却できる', async () => {
      // 初学者向け：アイテム売却APIのテスト
      const requestBody = {
        player_id: 'test-player-001',
        item_id: 1,
        quantity: 2
      };
      
      const res = await app.request('/api/items/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('売却しました');
      expect(data.transaction_amount).toBe(300); // 150 × 2
      expect(data.new_money_amount).toBe(3300); // 3000 + 300
    });

    it('所持数不足の場合は400エラー', async () => {
      // 初学者向け：所持数不足のエラーハンドリングテスト
      const requestBody = {
        player_id: 'test-player-001',
        item_id: 1,
        quantity: 10 // 所持数（5個）を超える売却
      };
      
      const res = await app.request('/api/items/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('売却しようとする個数が所持数を超えています');
    });
  });

  describe('GET /api/items/money/:playerId', () => {
    it('プレイヤーの所持金を取得できる', async () => {
      // 初学者向け：所持金取得APIのテスト
      const res = await app.request('/api/items/money/test-player-001');
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.amount).toBe(3000);
      expect(data.player_id).toBe('test-player-001');
    });

    it('存在しないプレイヤーの場合は0円を返す', async () => {
      // 初学者向け：新規プレイヤーの所持金確認テスト
      const res = await app.request('/api/items/money/new-player');
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.amount).toBe(0);
    });
  });
});