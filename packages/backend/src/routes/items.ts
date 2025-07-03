// 初学者向け：アイテム・インベントリシステムのAPIルート
// フロントエンドからのリクエストを処理するエンドポイント群

import { Hono } from 'hono';
import type { D1Database } from '@cloudflare/workers-types';
import { アイテムリポジトリ } from '../db/itemRepository';
import type { 
  アイテム使用リクエスト, 
  アイテム購入リクエスト, 
  アイテム売却リクエスト,
  インベントリフィルター,
  アイテムカテゴリ 
} from '@pokemon-like-game-tutorial/shared';

// 環境変数の型定義
type Bindings = {
  DB: D1Database;
};

/**
 * アイテム関連のAPIルート
 * 初学者向け：RESTful APIの実装例
 */
export const アイテムルート = new Hono<{ Bindings: Bindings }>();

/**
 * 全アイテムマスターデータ取得
 * GET /api/items/master
 * 初学者向け：ゲーム内の全アイテム情報を取得する
 */
アイテムルート.get('/master', async (c) => {
  try {
    const repository = new アイテムリポジトリ(c.env.DB);
    
    // クエリパラメータの取得
    const category = c.req.query('category');
    
    let items;
    if (category) {
      // カテゴリ指定がある場合はフィルタリング
      items = await repository.カテゴリ別アイテム取得(category);
    } else {
      // 全アイテム取得
      items = await repository.全アイテムマスター取得();
    }
    
    return c.json({
      success: true,
      items,
      total_count: items.length
    });
  } catch (error) {
    console.error('アイテムマスター取得エラー:', error);
    return c.json({
      success: false,
      error: 'アイテムマスターデータの取得に失敗しました'
    }, 500);
  }
});

/**
 * 特定アイテムマスターデータ取得
 * GET /api/items/master/:itemId
 * 初学者向け：特定のアイテムの詳細情報を取得する
 */
アイテムルート.get('/master/:itemId', async (c) => {
  try {
    const itemIdParam = c.req.param('itemId');
    const itemId = parseInt(itemIdParam);
    
    // アイテムIDのバリデーション
    if (isNaN(itemId) || itemId <= 0) {
      return c.json({
        success: false,
        error: '無効なアイテムIDです'
      }, 400);
    }
    
    const repository = new アイテムリポジトリ(c.env.DB);
    const item = await repository.アイテムマスター取得(itemId);
    
    if (!item) {
      return c.json({
        success: false,
        error: 'アイテムが見つかりません'
      }, 404);
    }
    
    return c.json({
      success: true,
      item
    });
  } catch (error) {
    console.error('アイテム詳細取得エラー:', error);
    return c.json({
      success: false,
      error: 'アイテム詳細の取得に失敗しました'
    }, 500);
  }
});

/**
 * プレイヤーインベントリ取得
 * GET /api/items/inventory/:playerId
 * 初学者向け：プレイヤーの所持アイテム一覧を取得する
 */
アイテムルート.get('/inventory/:playerId', async (c) => {
  try {
    const playerId = c.req.param('playerId');
    const repository = new アイテムリポジトリ(c.env.DB);
    
    // クエリパラメータからフィルター条件を構築
    const filter: インベントリフィルター = {
      search_keyword: c.req.query('search') || undefined,
      category: (c.req.query('category') as アイテムカテゴリ) || undefined,
      sort_by: (c.req.query('sort_by') as 'name' | 'category' | 'quantity' | 'obtained_at') || 'obtained_at',
      sort_order: (c.req.query('sort_order') as 'asc' | 'desc') || 'desc',
      page: parseInt(c.req.query('page') || '1'),
      limit: parseInt(c.req.query('limit') || '20')
    };
    
    const result = await repository.フィルター付きインベントリ取得(playerId, filter);
    
    return c.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('インベントリ取得エラー:', error);
    return c.json({
      success: false,
      error: 'インベントリの取得に失敗しました'
    }, 500);
  }
});

/**
 * アイテム使用
 * POST /api/items/use
 * 初学者向け：プレイヤーがアイテムを使用する処理
 */
アイテムルート.post('/use', async (c) => {
  try {
    const body = await c.req.json() as アイテム使用リクエスト;
    
    // 必須パラメータのバリデーション
    if (!body.player_id || !body.item_id || !body.quantity) {
      return c.json({
        success: false,
        error: '必須パラメータが不足しています (player_id, item_id, quantity)'
      }, 400);
    }
    
    if (body.quantity <= 0) {
      return c.json({
        success: false,
        error: '使用個数は1以上である必要があります'
      }, 400);
    }
    
    const repository = new アイテムリポジトリ(c.env.DB);
    
    // アイテムマスターの確認
    const itemMaster = await repository.アイテムマスター取得(body.item_id);
    if (!itemMaster) {
      return c.json({
        success: false,
        error: '指定されたアイテムは存在しません'
      }, 404);
    }
    
    // 使用可能かチェック
    if (!itemMaster.usable) {
      return c.json({
        success: false,
        error: 'このアイテムは使用できません'
      }, 400);
    }
    
    // アイテム使用実行
    const result = await repository.アイテム使用(body.player_id, body.item_id, body.quantity);
    
    if (!result.success) {
      return c.json({
        success: false,
        error: result.error
      }, 400);
    }
    
    // 成功レスポンス
    return c.json({
      success: true,
      message: `${itemMaster.name}を${body.quantity}個使用しました`,
      remaining_quantity: result.remaining_quantity,
      effect_details: {
        target_name: body.target_id || 'プレイヤー',
        effect_value: itemMaster.effect_value,
        effect_type: itemMaster.effect_type
      }
    });
  } catch (error) {
    console.error('アイテム使用エラー:', error);
    return c.json({
      success: false,
      error: 'アイテムの使用に失敗しました'
    }, 500);
  }
});

/**
 * アイテム購入
 * POST /api/items/purchase
 * 初学者向け：ショップでアイテムを購入する処理
 */
アイテムルート.post('/purchase', async (c) => {
  try {
    const body = await c.req.json() as アイテム購入リクエスト;
    
    // 必須パラメータのバリデーション
    if (!body.player_id || !body.item_id || !body.quantity) {
      return c.json({
        success: false,
        error: '必須パラメータが不足しています (player_id, item_id, quantity)'
      }, 400);
    }
    
    if (body.quantity <= 0) {
      return c.json({
        success: false,
        error: '購入個数は1以上である必要があります'
      }, 400);
    }
    
    const repository = new アイテムリポジトリ(c.env.DB);
    
    // アイテムマスターの確認
    const itemMaster = await repository.アイテムマスター取得(body.item_id);
    if (!itemMaster) {
      return c.json({
        success: false,
        error: '指定されたアイテムは存在しません'
      }, 404);
    }
    
    // 購入可能かチェック
    if (itemMaster.buy_price === 0) {
      return c.json({
        success: false,
        error: 'このアイテムは購入できません'
      }, 400);
    }
    
    // アイテム購入実行
    const result = await repository.アイテム購入(body.player_id, body.item_id, body.quantity);
    
    if (!result.success) {
      return c.json({
        success: false,
        error: result.error
      }, 400);
    }
    
    // 成功レスポンス
    return c.json({
      success: true,
      message: `${itemMaster.name}を${body.quantity}個購入しました`,
      transaction_amount: result.transaction_amount,
      new_money_amount: result.new_money_amount,
      new_item_quantity: result.new_item_quantity
    });
  } catch (error) {
    console.error('アイテム購入エラー:', error);
    return c.json({
      success: false,
      error: 'アイテムの購入に失敗しました'
    }, 500);
  }
});

/**
 * アイテム売却
 * POST /api/items/sell
 * 初学者向け：所持アイテムを売却する処理
 */
アイテムルート.post('/sell', async (c) => {
  try {
    const body = await c.req.json() as アイテム売却リクエスト;
    
    // 必須パラメータのバリデーション
    if (!body.player_id || !body.item_id || !body.quantity) {
      return c.json({
        success: false,
        error: '必須パラメータが不足しています (player_id, item_id, quantity)'
      }, 400);
    }
    
    if (body.quantity <= 0) {
      return c.json({
        success: false,
        error: '売却個数は1以上である必要があります'
      }, 400);
    }
    
    const repository = new アイテムリポジトリ(c.env.DB);
    
    // アイテムマスターの確認
    const itemMaster = await repository.アイテムマスター取得(body.item_id);
    if (!itemMaster) {
      return c.json({
        success: false,
        error: '指定されたアイテムは存在しません'
      }, 404);
    }
    
    // 売却可能かチェック
    if (itemMaster.sell_price === 0) {
      return c.json({
        success: false,
        error: 'このアイテムは売却できません'
      }, 400);
    }
    
    // アイテム売却実行
    const result = await repository.アイテム売却(body.player_id, body.item_id, body.quantity);
    
    if (!result.success) {
      return c.json({
        success: false,
        error: result.error
      }, 400);
    }
    
    // 成功レスポンス
    return c.json({
      success: true,
      message: `${itemMaster.name}を${body.quantity}個売却しました`,
      transaction_amount: result.transaction_amount,
      new_money_amount: result.new_money_amount,
      new_item_quantity: result.new_item_quantity
    });
  } catch (error) {
    console.error('アイテム売却エラー:', error);
    return c.json({
      success: false,
      error: 'アイテムの売却に失敗しました'
    }, 500);
  }
});

/**
 * プレイヤー所持金取得
 * GET /api/items/money/:playerId
 * 初学者向け：プレイヤーの現在の所持金を確認する
 */
アイテムルート.get('/money/:playerId', async (c) => {
  try {
    const playerId = c.req.param('playerId');
    const repository = new アイテムリポジトリ(c.env.DB);
    
    const amount = await repository.所持金取得(playerId);
    
    return c.json({
      success: true,
      player_id: playerId,
      amount
    });
  } catch (error) {
    console.error('所持金取得エラー:', error);
    return c.json({
      success: false,
      error: '所持金の取得に失敗しました'
    }, 500);
  }
});

/**
 * アイテム取得（報酬・拾得用）
 * POST /api/items/obtain
 * 初学者向け：マップでアイテムを取得した時やクエスト報酬で使用
 */
アイテムルート.post('/obtain', async (c) => {
  try {
    const body = await c.req.json();
    
    // 必須パラメータのバリデーション
    if (!body.player_id || !body.item_id || !body.quantity) {
      return c.json({
        success: false,
        error: '必須パラメータが不足しています (player_id, item_id, quantity)'
      }, 400);
    }
    
    if (body.quantity <= 0) {
      return c.json({
        success: false,
        error: '取得個数は1以上である必要があります'
      }, 400);
    }
    
    const repository = new アイテムリポジトリ(c.env.DB);
    
    // アイテムマスターの確認
    const itemMaster = await repository.アイテムマスター取得(body.item_id);
    if (!itemMaster) {
      return c.json({
        success: false,
        error: '指定されたアイテムは存在しません'
      }, 404);
    }
    
    // アイテム追加実行
    const result = await repository.アイテム追加(body.player_id, body.item_id, body.quantity);
    
    if (!result.success) {
      return c.json({
        success: false,
        error: result.error
      }, 400);
    }
    
    // 成功レスポンス
    return c.json({
      success: true,
      message: `${itemMaster.name}を${body.quantity}個取得しました`,
      new_quantity: result.new_quantity,
      item_name: itemMaster.name,
      item_icon: itemMaster.icon_url
    });
  } catch (error) {
    console.error('アイテム取得エラー:', error);
    return c.json({
      success: false,
      error: 'アイテムの取得に失敗しました'
    }, 500);
  }
});