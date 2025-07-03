// 初学者向け：テスト用データベースセットアップ
// 各テストで独立したSQLiteメモリデータベースを使用

import { beforeEach, afterEach } from 'vitest';
import { DatabaseFactory } from '../database/factory';
import { DatabaseAdapter, Env } from '../types/database';
import { Migrator } from '../database/migrator';

// テスト用のデータベースインスタンスを保持
let testDb: DatabaseAdapter | null = null;

/**
 * 各テスト実行前にデータベースを初期化
 * メモリ内SQLiteで高速テストを実現
 */
beforeEach(async () => {
  try {
    console.log('🧪 テスト用データベースを初期化中...');
    
    // 新しいメモリ内データベースを作成
    testDb = DatabaseFactory.createTestDatabase();
    
    // MockAdapterの場合はマイグレーションをスキップ（すでにスキーマとデータが設定済み）
    // 本来のSQLiteの場合はマイグレーションを実行
    // const migrator = new Migrator(testDb);
    // await migrator.runMigrations();
    
    console.log('✅ テスト用データベース準備完了');
  } catch (error) {
    console.error('❌ テスト用データベース初期化エラー:', error);
    throw new Error(`テスト用データベース初期化に失敗: ${error}`);
  }
});

/**
 * 各テスト実行後にデータベースをクリーンアップ
 * メモリリークを防ぐため確実にクローズ
 */
afterEach(() => {
  try {
    if (testDb) {
      testDb.close?.();
      testDb = null;
      console.log('🧹 テスト用データベースをクリーンアップしました');
    }
  } catch (error) {
    console.error('❌ テスト用データベースクリーンアップエラー:', error);
  }
});

/**
 * テスト用データベースインスタンスを取得
 * テストファイルからこの関数を呼び出してDBアクセス
 * @returns 現在のテスト用データベース
 */
export function getTestDatabase(): DatabaseAdapter {
  if (!testDb) {
    throw new Error('テスト用データベースが初期化されていません。beforeEachが実行されているか確認してください。');
  }
  return testDb;
}

/**
 * テスト用のモック環境変数を作成
 * Cloudflare Workers環境をシミュレート
 * @returns テスト用環境変数
 */
export function createTestEnv(): Env {
  return {
    ENVIRONMENT: 'test',
    DB: null as any, // テストではSQLiteを使用するためnull
  };
}

/**
 * テスト用のカスタムデータベースを作成
 * 特別な設定やデータが必要なテストで使用
 * @param withMigrations マイグレーションを実行するかどうか
 * @returns カスタムテスト用データベース
 */
export async function createCustomTestDatabase(withMigrations: boolean = true): Promise<DatabaseAdapter> {
  try {
    const db = DatabaseFactory.createTestDatabase();
    
    if (withMigrations) {
      // MockAdapterの場合はマイグレーションをスキップ
      // const migrator = new Migrator(db);
      // await migrator.runMigrations();
    }
    
    return db;
  } catch (error) {
    console.error('❌ カスタムテスト用データベース作成エラー:', error);
    throw new Error(`カスタムテスト用データベース作成に失敗: ${error}`);
  }
}

/**
 * テストデータ投入のヘルパー関数
 * よく使用されるテストデータをセットアップ
 * @param db データベースインスタンス
 */
export async function setupTestData(db: DatabaseAdapter): Promise<void> {
  try {
    console.log('📋 テストデータを投入中...');
    
    // プレイヤーデータの投入
    await db.prepare(`
      INSERT INTO players (id, name, position_x, position_y, direction, sprite)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind('test-player-001', 'テストプレイヤー', 10, 7, 'down', 'player.png').run();
    
    // アイテムマスターデータの投入（一部のみ）
    await db.prepare(`
      INSERT INTO item_master (item_id, name, category, effect_type, effect_value, buy_price, sell_price, usable, max_stack, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(1, 'きずぐすり', '回復', 'HP回復', 20, 300, 150, 1, 99, 'テスト用きずぐすり').run();
    
    console.log('✅ テストデータ投入完了');
  } catch (error) {
    console.error('❌ テストデータ投入エラー:', error);
    throw new Error(`テストデータ投入に失敗: ${error}`);
  }
}

/**
 * テスト用のプレイヤーデータを作成
 * @param playerId プレイヤーID
 * @param customData カスタマイズデータ
 * @returns 作成されたプレイヤーデータ
 */
export async function createTestPlayer(
  db: DatabaseAdapter,
  playerId: string = 'test-player',
  customData: {
    name?: string;
    position_x?: number;
    position_y?: number;
    direction?: string;
  } = {}
): Promise<{ id: string; name: string; position_x: number; position_y: number }> {
  try {
    const playerData = {
      id: playerId,
      name: customData.name || 'テストプレイヤー',
      position_x: customData.position_x || 10,
      position_y: customData.position_y || 7,
      direction: customData.direction || 'down',
      sprite: 'player.png',
    };
    
    await db.prepare(`
      INSERT INTO players (id, name, position_x, position_y, direction, sprite)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      playerData.id,
      playerData.name,
      playerData.position_x,
      playerData.position_y,
      playerData.direction,
      playerData.sprite
    ).run();
    
    console.log(`👤 テストプレイヤーを作成: ${playerData.id}`);
    return playerData;
  } catch (error) {
    console.error('❌ テストプレイヤー作成エラー:', error);
    throw new Error(`テストプレイヤー作成に失敗: ${error}`);
  }
}

/**
 * データベース状態をクリアするヘルパー
 * テスト中にデータをリセットしたい場合に使用
 * @param db データベースインスタンス
 * @param tables クリアするテーブル名（未指定で全テーブル）
 */
export async function clearTestData(db: DatabaseAdapter, tables?: string[]): Promise<void> {
  try {
    // マスターデータテーブルは保持し、プレイヤー関連データのみクリア
    const targetTables = tables || [
      'players',
      'player_inventory',
      'player_money',
      'owned_pokemon',
      'player_party',
      'battle_sessions'
      // item_master と pokemon_species はマスターデータなので保持
    ];
    
    for (const table of targetTables) {
      try {
        await db.prepare(`DELETE FROM ${table}`).run();
        console.log(`🧹 テーブルクリア: ${table}`);
      } catch (error) {
        // テーブルが存在しない場合はスキップ
        console.log(`⏭️ テーブルスキップ（未存在）: ${table}`);
      }
    }
    
    console.log('✅ テストデータクリア完了');
  } catch (error) {
    console.error('❌ テストデータクリアエラー:', error);
    throw new Error(`テストデータクリアに失敗: ${error}`);
  }
}