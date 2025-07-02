// 初学者向け：アイテムAPIサービスのテスト
// TDDアプローチでテストを先に作成

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { アイテムAPIサービス } from './itemApi';
import type { 
  アイテムマスタ, 
  インベントリフィルター,
  アイテム使用リクエスト,
  アイテム購入リクエスト,
  アイテム売却リクエスト 
} from '@pokemon-like-game-tutorial/shared';

// グローバルfetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('アイテムAPIサービス', () => {
  let apiService: アイテムAPIサービス;

  beforeEach(() => {
    apiService = new アイテムAPIサービス('http://localhost:8788');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('全アイテムマスター取得', () => {
    it('正常にアイテムマスターデータを取得できる', async () => {
      const mockResponse: アイテムマスタ[] = [
        {
          item_id: 1,
          name: 'きずぐすり',
          description: 'ポケモンのHPを20回復する',
          category: '回復',
          buy_price: 300,
          sell_price: 150,
          usable: true,
          effect_type: 'HP回復',
          effect_value: 20,
          icon_url: '/icons/item_default.png',
          max_stack: 99,
          created_at: '2025-07-01 00:00:00',
          updated_at: '2025-07-01 00:00:00'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, items: mockResponse })
      });

      const result = await apiService.全アイテムマスター取得();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8788/api/items/master');
      expect(result).toEqual(mockResponse);
    });

    it('カテゴリフィルター付きで取得できる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, items: [] })
      });

      await apiService.全アイテムマスター取得('回復');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8788/api/items/master?category=%E5%9B%9E%E5%BE%A9'
      );
    });

    it('HTTPエラー時にエラーを投げる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(apiService.全アイテムマスター取得()).rejects.toThrow(
        'アイテムマスターデータの取得に失敗しました'
      );
    });

    it('APIレスポンスエラー時にエラーを投げる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'データが見つかりません' })
      });

      await expect(apiService.全アイテムマスター取得()).rejects.toThrow(
        'アイテムマスターデータの取得に失敗しました'
      );
    });
  });

  describe('インベントリ取得', () => {
    it('正常にインベントリデータを取得できる', async () => {
      const mockResponseData = {
        items: [
          {
            quantity: 5,
            obtained_at: '2025-07-01 10:00:00',
            item_id: 1,
            name: 'きずぐすり',
            description: 'ポケモンのHPを20回復する',
            category: '回復',
            buy_price: 300,
            sell_price: 150,
            usable: true,
            effect_type: 'HP回復',
            effect_value: 20,
            icon_url: '/icons/item_default.png',
            max_stack: 99
          }
        ],
        player_money: 5000,
        total_count: 1,
        total_pages: 1,
        current_page: 1
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, ...mockResponseData })
      });

      const result = await apiService.インベントリ取得('test-player');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8788/api/items/inventory/test-player'
      );
      expect(result).toEqual({
        items: mockResponseData.items,
        total_count: mockResponseData.total_count,
        current_page: mockResponseData.current_page,
        total_pages: mockResponseData.total_pages,
        player_money: mockResponseData.player_money
      });
    });

    it('フィルター条件付きで取得できる', async () => {
      const filter: インベントリフィルター = {
        search_keyword: 'きず',
        category: '回復',
        page: 2,
        limit: 10
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, items: [], player_money: 0, total_count: 0, total_pages: 0, current_page: 2 })
      });

      await apiService.インベントリ取得('test-player', filter);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8788/api/items/inventory/test-player?search=%E3%81%8D%E3%81%9A&category=%E5%9B%9E%E5%BE%A9&page=2&limit=10'
      );
    });
  });

  describe('アイテム使用', () => {
    it('正常にアイテム使用ができる', async () => {
      const request: アイテム使用リクエスト = {
        player_id: 'test-player',
        item_id: 1,
        quantity: 1,
        target_id: 'pokemon-1'
      };

      const mockResponse = {
        success: true,
        message: 'アイテムを使用しました'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiService.アイテム使用(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8788/api/items/use',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request)
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('使用失敗時にエラーレスポンスを返す', async () => {
      const request: アイテム使用リクエスト = {
        player_id: 'test-player',
        item_id: 1,
        quantity: 1,
        target_id: 'pokemon-1'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, message: 'アイテムが不足しています' })
      });

      const result = await apiService.アイテム使用(request);

      expect(result.success).toBe(false);
      expect(result.message).toBe('アイテムの使用に失敗しました');
    });
  });

  describe('アイテム購入', () => {
    it('正常にアイテム購入ができる', async () => {
      const request: アイテム購入リクエスト = {
        player_id: 'test-player',
        item_id: 1,
        quantity: 2
      };

      const mockResponse = {
        success: true,
        message: 'アイテムを購入しました',
        new_item_quantity: 7,
        new_money_amount: 4400,
        transaction_amount: 600
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiService.アイテム購入(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8788/api/items/purchase',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request)
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('アイテム売却', () => {
    it('正常にアイテム売却ができる', async () => {
      const request: アイテム売却リクエスト = {
        player_id: 'test-player',
        item_id: 1,
        quantity: 1
      };

      const mockResponse = {
        success: true,
        message: 'アイテムを売却しました',
        new_item_quantity: 4,
        new_money_amount: 5150,
        transaction_amount: 150
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiService.アイテム売却(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8788/api/items/sell',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request)
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('所持金取得', () => {
    it('正常に所持金を取得できる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, amount: 5000 })
      });

      const result = await apiService.所持金取得('test-player');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8788/api/items/money/test-player'
      );
      expect(result).toBe(5000);
    });

    it('取得失敗時にエラーを投げる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'プレイヤーが見つかりません' })
      });

      await expect(apiService.所持金取得('invalid-player')).rejects.toThrow(
        '所持金の取得に失敗しました'
      );
    });
  });

  describe('ネットワークエラーハンドリング', () => {
    it('fetch失敗時にエラーを投げる', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'));

      await expect(apiService.全アイテムマスター取得()).rejects.toThrow(
        'アイテムマスターデータの取得に失敗しました'
      );
    });
  });
});