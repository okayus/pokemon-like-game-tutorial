// 初学者向け：アイテム・インベントリAPI通信サービス
// バックエンドAPIとの通信を担当するサービスクラス

import { API_ENDPOINTS } from '../config/api';
import type {
  アイテムマスタ,
  インベントリ応答,
  アイテム使用リクエスト,
  アイテム使用結果,
  アイテム購入リクエスト,
  アイテム売却リクエスト,
  取引結果,
  インベントリフィルター,
} from '@pokemon-like-game-tutorial/shared';

/**
 * アイテムAPIサービスクラス
 * 初学者向け：アイテム関連のAPI呼び出しを担当
 */
export class アイテムAPIサービス {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_ENDPOINTS.ITEMS.MASTER.replace('/master', '');
  }

  /**
   * 全アイテムマスターデータを取得
   * 初学者向け：ゲーム内の全アイテム情報を取得する
   */
  async 全アイテムマスター取得(category?: string): Promise<アイテムマスタ[]> {
    try {
      const url = new URL(`${this.baseUrl}/api/items/master`);
      if (category) {
        url.searchParams.set('category', category);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'アイテムマスターデータの取得に失敗しました');
      }

      return data.items;
    } catch (error) {
      console.error('アイテムマスター取得エラー:', error);
      throw new Error('アイテムマスターデータの取得に失敗しました');
    }
  }

  /**
   * 特定アイテムの詳細を取得
   * 初学者向け：アイテムIDを指定して詳細情報を取得する
   */
  async アイテム詳細取得(itemId: number): Promise<アイテムマスタ> {
    try {
      const response = await fetch(`${this.baseUrl}/api/items/master/${itemId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('指定されたアイテムが見つかりません');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'アイテム詳細の取得に失敗しました');
      }

      return data.item;
    } catch (error) {
      console.error('アイテム詳細取得エラー:', error);
      throw error;
    }
  }

  /**
   * プレイヤーのインベントリを取得
   * 初学者向け：プレイヤーの所持アイテム一覧を取得する
   */
  async インベントリ取得(
    playerId: string,
    filter?: インベントリフィルター
  ): Promise<インベントリ応答> {
    try {
      const url = new URL(`${this.baseUrl}/api/items/inventory/${playerId}`);

      // フィルター条件をクエリパラメータに追加
      if (filter) {
        if (filter.search_keyword) {
          url.searchParams.set('search', filter.search_keyword);
        }
        if (filter.category) {
          url.searchParams.set('category', filter.category);
        }
        if (filter.sort_by) {
          url.searchParams.set('sort_by', filter.sort_by);
        }
        if (filter.sort_order) {
          url.searchParams.set('sort_order', filter.sort_order);
        }
        if (filter.page) {
          url.searchParams.set('page', filter.page.toString());
        }
        if (filter.limit) {
          url.searchParams.set('limit', filter.limit.toString());
        }
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'インベントリの取得に失敗しました');
      }

      return {
        items: data.items,
        total_count: data.total_count,
        current_page: data.current_page,
        total_pages: data.total_pages,
        player_money: data.player_money,
      };
    } catch (error) {
      console.error('インベントリ取得エラー:', error);
      throw new Error('インベントリの取得に失敗しました');
    }
  }

  /**
   * アイテムを使用する
   * 初学者向け：プレイヤーがアイテムを使用する処理
   */
  async アイテム使用(request: アイテム使用リクエスト): Promise<アイテム使用結果> {
    try {
      const response = await fetch(`${this.baseUrl}/api/items/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'アイテムの使用に失敗しました');
      }

      return {
        success: true,
        message: data.message,
        remaining_quantity: data.remaining_quantity,
        effect_details: data.effect_details,
      };
    } catch (error) {
      console.error('アイテム使用エラー:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'アイテムの使用に失敗しました',
        remaining_quantity: 0,
      };
    }
  }

  /**
   * アイテムを購入する
   * 初学者向け：ショップでアイテムを購入する処理
   */
  async アイテム購入(request: アイテム購入リクエスト): Promise<取引結果> {
    try {
      const response = await fetch(`${this.baseUrl}/api/items/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'アイテムの購入に失敗しました');
      }

      return {
        success: true,
        message: data.message,
        new_money_amount: data.new_money_amount,
        new_item_quantity: data.new_item_quantity,
        transaction_amount: data.transaction_amount,
      };
    } catch (error) {
      console.error('アイテム購入エラー:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'アイテムの購入に失敗しました',
        new_money_amount: 0,
        new_item_quantity: 0,
        transaction_amount: 0,
      };
    }
  }

  /**
   * アイテムを売却する
   * 初学者向け：所持アイテムを売却する処理
   */
  async アイテム売却(request: アイテム売却リクエスト): Promise<取引結果> {
    try {
      const response = await fetch(`${this.baseUrl}/api/items/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'アイテムの売却に失敗しました');
      }

      return {
        success: true,
        message: data.message,
        new_money_amount: data.new_money_amount,
        new_item_quantity: data.new_item_quantity,
        transaction_amount: data.transaction_amount,
      };
    } catch (error) {
      console.error('アイテム売却エラー:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'アイテムの売却に失敗しました',
        new_money_amount: 0,
        new_item_quantity: 0,
        transaction_amount: 0,
      };
    }
  }

  /**
   * プレイヤーの所持金を取得
   * 初学者向け：プレイヤーの現在の所持金を確認する
   */
  async 所持金取得(playerId: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/api/items/money/${playerId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '所持金の取得に失敗しました');
      }

      return data.amount;
    } catch (error) {
      console.error('所持金取得エラー:', error);
      throw new Error('所持金の取得に失敗しました');
    }
  }

  /**
   * アイテムを取得する（報酬・拾得用）
   * 初学者向け：マップでアイテムを取得した時やクエスト報酬で使用
   */
  async アイテム取得(
    playerId: string,
    itemId: number,
    quantity: number
  ): Promise<{ success: boolean; message: string; new_quantity?: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/items/obtain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player_id: playerId,
          item_id: itemId,
          quantity: quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'アイテムの取得に失敗しました');
      }

      return {
        success: true,
        message: data.message,
        new_quantity: data.new_quantity,
      };
    } catch (error) {
      console.error('アイテム取得エラー:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'アイテムの取得に失敗しました',
      };
    }
  }
}

// デフォルトのAPIサービスインスタンス
// 初学者向け：アプリケーション全体で使用する共通インスタンス
export const デフォルトアイテムAPIサービス = new アイテムAPIサービス();
