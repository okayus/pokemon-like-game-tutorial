// 初学者向け：Drizzle ORM対応テスト用データベースセットアップ
// 各テストで独立した型安全なデータベースを使用

import { beforeEach, afterEach } from 'vitest';
import { DrizzleDatabaseFactory } from '../database/drizzleFactory';
import type { DrizzleDatabaseAdapter, DrizzleDatabaseEnv } from '../types/drizzleDatabase';

// テスト用のデータベースインスタンスを保持
let testDb: DrizzleDatabaseAdapter | null = null;

/**
 * 各テスト実行前にDrizzleデータベースを初期化
 * メモリ内SQLiteで高速テストを実現
 */
beforeEach(async () => {
  try {
    console.log('🧪 Drizzleテスト用データベースを初期化中...');
    
    // 新しいメモリ内データベースを作成
    testDb = DrizzleDatabaseFactory.createTestDatabase();
    
    console.log('✅ Drizzleテスト用データベース準備完了');
  } catch (error) {
    console.error('❌ Drizzleテスト用データベース初期化エラー:', error);
    throw new Error(`Drizzleテスト用データベース初期化に失敗: ${error}`);
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
      console.log('🧹 Drizzleテスト用データベースをクリーンアップしました');
    }
  } catch (error) {
    console.error('❌ Drizzleテスト用データベースクリーンアップエラー:', error);
  }
});

/**
 * テスト用データベースインスタンスを取得
 * テストファイルからこの関数を呼び出してDBアクセス
 * @returns 現在のテスト用データベース
 */
export function getDrizzleTestDatabase(): DrizzleDatabaseAdapter {
  if (!testDb) {
    throw new Error('Drizzleテスト用データベースが初期化されていません。beforeEachが実行されているか確認してください。');
  }
  return testDb;
}

/**
 * テスト用のモック環境変数を作成
 * Drizzle環境をシミュレート
 * @returns テスト用環境変数
 */
export function createDrizzleTestEnv(): DrizzleDatabaseEnv {
  return {
    ENVIRONMENT: 'test',
  };
}

/**
 * テスト用のカスタムデータベースを作成
 * 特別な設定やデータが必要なテストで使用
 * @returns カスタムテスト用データベース
 */
export async function createCustomDrizzleTestDatabase(): Promise<DrizzleDatabaseAdapter> {
  try {
    const db = DrizzleDatabaseFactory.createTestDatabase();
    return db;
  } catch (error) {
    console.error('❌ カスタムDrizzleテスト用データベース作成エラー:', error);
    throw new Error(`カスタムDrizzleテスト用データベース作成に失敗: ${error}`);
  }
}