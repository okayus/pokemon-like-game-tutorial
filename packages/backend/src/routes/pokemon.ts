// 初学者向け：ポケモン管理APIルート
// シンプルなポケモンライクゲームのAPIエンドポイント集

import { Hono } from 'hono';
import { Env } from '../types/env';
import { シンプルポケモンリポジトリ } from '../db/simplePokemonRepository';
import type { ポケモン捕獲リクエスト, パーティ編成リクエスト, ポケモン更新リクエスト } from '../types/pokemon';

// 初学者向け：ポケモン関連のAPIルートを管理するHonoアプリ
const pokemonRoutes = new Hono<{ Bindings: Env }>();

/**
 * ポケモンマスタデータ一覧取得
 * 初学者向け：ゲーム内の全ポケモン種族の基本情報を取得
 */
pokemonRoutes.get('/species', async (c) => {
  try {
    const リポジトリ = new シンプルポケモンリポジトリ(c.env.DB);
    const マスタデータ一覧 = await リポジトリ.全マスタデータ取得();
    
    return c.json({
      success: true,
      data: マスタデータ一覧,
      count: マスタデータ一覧.length
    });
  } catch (error) {
    console.error('ポケモンマスタデータ取得エラー:', error);
    return c.json({ 
      success: false, 
      error: 'ポケモンマスタデータの取得に失敗しました' 
    }, 500);
  }
});

/**
 * 特定ポケモン種族の詳細取得
 * 初学者向け：指定したIDの種族データを取得
 */
pokemonRoutes.get('/species/:speciesId', async (c) => {
  const speciesId = parseInt(c.req.param('speciesId'));
  
  if (isNaN(speciesId)) {
    return c.json({ 
      success: false, 
      error: '無効な種族IDです' 
    }, 400);
  }
  
  try {
    const リポジトリ = new シンプルポケモンリポジトリ(c.env.DB);
    const マスタデータ = await リポジトリ.マスタデータ取得(speciesId);
    
    if (!マスタデータ) {
      return c.json({ 
        success: false, 
        error: '指定された種族が見つかりません' 
      }, 404);
    }
    
    return c.json({
      success: true,
      data: マスタデータ
    });
  } catch (error) {
    console.error('ポケモン種族データ取得エラー:', error);
    return c.json({ 
      success: false, 
      error: 'ポケモン種族データの取得に失敗しました' 
    }, 500);
  }
});

/**
 * プレイヤーの所有ポケモン一覧取得
 * 初学者向け：そのプレイヤーが捕まえたポケモンの一覧を表示
 */
pokemonRoutes.get('/owned/:playerId', async (c) => {
  const playerId = c.req.param('playerId');
  
  // クエリパラメータでフィルタリング機能を提供
  const species_name = c.req.query('species_name');
  const level_min = c.req.query('level_min');
  const level_max = c.req.query('level_max');
  const page = c.req.query('page');
  const limit = c.req.query('limit');
  
  try {
    const リポジトリ = new シンプルポケモンリポジトリ(c.env.DB);
    
    // フィルター条件を構築
    const フィルター = {
      species_name: species_name || undefined,
      level_min: level_min ? parseInt(level_min) : undefined,
      level_max: level_max ? parseInt(level_max) : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined
    };
    
    const 所有ポケモン一覧 = await リポジトリ.所有ポケモン一覧取得(playerId, フィルター);
    
    return c.json({
      success: true,
      data: 所有ポケモン一覧,
      count: 所有ポケモン一覧.length,
      filters: フィルター
    });
  } catch (error) {
    console.error('所有ポケモン取得エラー:', error);
    return c.json({ 
      success: false, 
      error: '所有ポケモンの取得に失敗しました' 
    }, 500);
  }
});

/**
 * 特定ポケモンの詳細取得
 * 初学者向け：一匹のポケモンの詳細情報を取得
 */
pokemonRoutes.get('/owned/detail/:pokemonId', async (c) => {
  const pokemonId = c.req.param('pokemonId');
  
  try {
    const リポジトリ = new シンプルポケモンリポジトリ(c.env.DB);
    const ポケモン詳細 = await リポジトリ.ポケモン詳細取得(pokemonId);
    
    if (!ポケモン詳細) {
      return c.json({ 
        success: false, 
        error: '指定されたポケモンが見つかりません' 
      }, 404);
    }
    
    return c.json({
      success: true,
      data: ポケモン詳細
    });
  } catch (error) {
    console.error('ポケモン詳細取得エラー:', error);
    return c.json({ 
      success: false, 
      error: 'ポケモン詳細の取得に失敗しました' 
    }, 500);
  }
});

/**
 * ポケモン捕獲
 * 初学者向け：野生のポケモンを捕まえて自分のポケモンにする
 */
pokemonRoutes.post('/catch/:playerId', async (c) => {
  const playerId = c.req.param('playerId');
  
  try {
    const body = await c.req.json();
    
    // リクエストデータの検証
    if (!body.species_id || !body.level) {
      return c.json({ 
        success: false, 
        error: 'species_idとlevelは必須です' 
      }, 400);
    }
    
    if (body.level < 1 || body.level > 100) {
      return c.json({ 
        success: false, 
        error: 'レベルは1〜100の範囲で指定してください' 
      }, 400);
    }
    
    const 捕獲リクエスト: ポケモン捕獲リクエスト = {
      species_id: body.species_id,
      level: body.level,
      nickname: body.nickname
    };
    
    const リポジトリ = new シンプルポケモンリポジトリ(c.env.DB);
    const 捕獲されたポケモン = await リポジトリ.ポケモン捕獲(playerId, 捕獲リクエスト);
    
    return c.json({
      success: true,
      data: 捕獲されたポケモン,
      message: `${捕獲されたポケモン.species.name}を捕まえました！`
    }, 201);
  } catch (error) {
    console.error('ポケモン捕獲エラー:', error);
    
    // エラーメッセージに応じて適切なステータスコードを返す
    if (error instanceof Error && error.message === '指定された種族が見つかりません') {
      return c.json({ 
        success: false, 
        error: error.message 
      }, 404);
    }
    
    return c.json({ 
      success: false, 
      error: 'ポケモンの捕獲に失敗しました' 
    }, 500);
  }
});

/**
 * ポケモン情報更新
 * 初学者向け：ニックネームや現在HPなどを変更
 */
pokemonRoutes.put('/owned/:pokemonId', async (c) => {
  const pokemonId = c.req.param('pokemonId');
  
  try {
    const body = await c.req.json();
    
    const 更新リクエスト: ポケモン更新リクエスト = {
      nickname: body.nickname,
      current_hp: body.current_hp
    };
    
    // 現在HPの検証
    if (更新リクエスト.current_hp !== undefined) {
      if (更新リクエスト.current_hp < 0) {
        return c.json({ 
          success: false, 
          error: '現在HPは0以上である必要があります' 
        }, 400);
      }
    }
    
    const リポジトリ = new シンプルポケモンリポジトリ(c.env.DB);
    
    // ポケモンの存在確認
    const 既存ポケモン = await リポジトリ.ポケモン詳細取得(pokemonId);
    if (!既存ポケモン) {
      return c.json({ 
        success: false, 
        error: '指定されたポケモンが見つかりません' 
      }, 404);
    }
    
    // 現在HPが最大HPを超えないようにチェック
    if (更新リクエスト.current_hp !== undefined && 更新リクエスト.current_hp > 既存ポケモン.stats.max_hp) {
      return c.json({ 
        success: false, 
        error: `現在HPは最大HP（${既存ポケモン.stats.max_hp}）を超えることはできません` 
      }, 400);
    }
    
    await リポジトリ.ポケモン更新(pokemonId, 更新リクエスト);
    
    // 更新後のデータを取得して返す
    const 更新されたポケモン = await リポジトリ.ポケモン詳細取得(pokemonId);
    
    return c.json({
      success: true,
      data: 更新されたポケモン,
      message: 'ポケモンの情報を更新しました'
    });
  } catch (error) {
    console.error('ポケモン更新エラー:', error);
    return c.json({ 
      success: false, 
      error: 'ポケモン情報の更新に失敗しました' 
    }, 500);
  }
});

/**
 * プレイヤーのパーティ取得
 * 初学者向け：手持ちポケモン（最大6体）の情報を取得
 */
pokemonRoutes.get('/party/:playerId', async (c) => {
  const playerId = c.req.param('playerId');
  
  try {
    const リポジトリ = new シンプルポケモンリポジトリ(c.env.DB);
    const パーティ = await リポジトリ.パーティ取得(playerId);
    
    return c.json({
      success: true,
      data: パーティ,
      count: パーティ.length
    });
  } catch (error) {
    console.error('パーティ取得エラー:', error);
    return c.json({ 
      success: false, 
      error: 'パーティの取得に失敗しました' 
    }, 500);
  }
});

/**
 * パーティ編成
 * 初学者向け：手持ちポケモンの並び順を変更・追加・削除
 */
pokemonRoutes.put('/party/:playerId', async (c) => {
  const playerId = c.req.param('playerId');
  
  try {
    const body = await c.req.json();
    
    // リクエストデータの検証
    if (!body.position || body.position < 1 || body.position > 6) {
      return c.json({ 
        success: false, 
        error: 'positionは1〜6の範囲で指定してください' 
      }, 400);
    }
    
    const 編成リクエスト: パーティ編成リクエスト = {
      position: body.position,
      pokemon_id: body.pokemon_id
    };
    
    const リポジトリ = new シンプルポケモンリポジトリ(c.env.DB);
    
    // ポケモンIDが指定されている場合、そのポケモンが存在するか確認
    if (編成リクエスト.pokemon_id) {
      const ポケモン = await リポジトリ.ポケモン詳細取得(編成リクエスト.pokemon_id);
      if (!ポケモン) {
        return c.json({ 
          success: false, 
          error: '指定されたポケモンが見つかりません' 
        }, 404);
      }
      
      // ポケモンの所有者が正しいか確認
      if (ポケモン.player_id !== playerId) {
        return c.json({ 
          success: false, 
          error: 'このポケモンは他のプレイヤーが所有しています' 
        }, 403);
      }
    }
    
    await リポジトリ.パーティ編成(playerId, 編成リクエスト);
    
    // 更新後のパーティを取得して返す
    const 更新されたパーティ = await リポジトリ.パーティ取得(playerId);
    
    const メッセージ = 編成リクエスト.pokemon_id 
      ? `位置${編成リクエスト.position}にポケモンを配置しました`
      : `位置${編成リクエスト.position}からポケモンを外しました`;
    
    return c.json({
      success: true,
      data: 更新されたパーティ,
      message: メッセージ
    });
  } catch (error) {
    console.error('パーティ編成エラー:', error);
    
    // エラーメッセージに応じて適切なステータスコードを返す
    if (error instanceof Error) {
      if (error.message === '指定されたポケモンが見つからないか、権限がありません') {
        return c.json({ 
          success: false, 
          error: error.message 
        }, 403);
      }
    }
    
    return c.json({ 
      success: false, 
      error: 'パーティ編成に失敗しました' 
    }, 500);
  }
});

export default pokemonRoutes;