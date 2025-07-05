// 初学者向け：Drizzle ORM対応のデータベースファクトリー
// 環境に応じて適切なDrizzleアダプターを提供

import { DrizzleMockAdapter } from '../adapters/drizzleMockAdapter';
import type { DrizzleDatabaseAdapter, DrizzleDatabaseEnv } from '../types/drizzleDatabase';

/**
 * Drizzle対応データベースファクトリークラス
 * 環境に応じて適切なデータベースアダプターを作成
 */
export class DrizzleDatabaseFactory {
  /**
   * 環境に応じたデータベースアダプターを作成
   * @param env 環境設定
   * @returns 適切なデータベースアダプター
   */
  static create(env: DrizzleDatabaseEnv): DrizzleDatabaseAdapter {
    const environment = env.ENVIRONMENT || 'development';
    
    console.log(`🔧 Drizzle Database Factory: ${environment}環境用アダプターを作成中...`);

    switch (environment) {
      case 'production':
        if (!env.DB) {
          throw new Error('本番環境ではCloudflare D1データベースが必要です');
        }
        // TODO: DrizzleD1Adapterを実装
        throw new Error('DrizzleD1Adapterは未実装です');

      case 'test':
        console.log('📝 テスト環境: DrizzleMockAdapterを使用');
        return new DrizzleMockAdapter();

      case 'development':
      default:
        console.log('🛠️ 開発環境: DrizzleMockAdapterを使用（SQLiteAdapter実装予定）');
        return new DrizzleMockAdapter();
    }
  }

  /**
   * テスト専用のデータベースアダプターを作成
   * 各テストで独立したインスタンスを使用
   * @returns テスト用アダプター
   */
  static createTestDatabase(): DrizzleDatabaseAdapter {
    console.log('🧪 テスト専用: DrizzleMockAdapterを作成');
    return new DrizzleMockAdapter();
  }

  /**
   * 現在の環境情報を取得
   * デバッグ用の情報提供
   * @param env 環境設定
   * @returns 環境情報
   */
  static getEnvironmentInfo(env: DrizzleDatabaseEnv) {
    const environment = env.ENVIRONMENT || 'development';
    
    return {
      environment,
      isProduction: environment === 'production',
      isDevelopment: environment === 'development',
      isTest: environment === 'test',
      databaseType: environment === 'production' ? 'Cloudflare D1' : 'SQLite',
      hasD1Connection: !!env.DB,
    };
  }
}