// 初学者向け：データベースファクトリパターン
// 環境に応じて適切なデータベースアダプターを作成する責務を持つ

import { DatabaseAdapter } from '../types/database';
import { SQLiteAdapter } from '../adapters/sqliteAdapter';
import { D1Adapter } from '../adapters/d1Adapter';
import { MockAdapter } from '../adapters/mockAdapter';
import { SimplifiedMockAdapter } from '../adapters/simplifiedMockAdapter';

/**
 * データベース接続を環境に応じて作成するファクトリクラス
 * Factory Pattern（生成パターン）を使用
 */
export class DatabaseFactory {
  /**
   * 環境変数に基づいてデータベースアダプターを作成
   * @param env Cloudflare Workers環境変数
   * @returns 適切なデータベースアダプター
   */
  static create(env: Env): DatabaseAdapter {
    const environment = env.ENVIRONMENT || 'development';

    console.log(`🎯 データベース環境: ${environment}`);

    switch (environment) {
      case 'production':
        // 本番環境：Cloudflare D1を使用
        if (!env.DB) {
          throw new Error('本番環境でD1データベースが設定されていません');
        }
        console.log('🚀 Cloudflare D1に接続します...');
        return new D1Adapter(env.DB);
        
      case 'test':
        // テスト環境：信頼性の高いシンプルモックアダプターを使用
        console.log('🧪 テスト用シンプルモックアダプターに接続します...');
        return new SimplifiedMockAdapter();
        
      case 'development':
      default:
        // 開発環境：ローカルSQLiteファイルを使用
        console.log('🛠️ 開発用SQLiteファイルに接続します...');
        const dbPath = process.env.SQLITE_DB_PATH || './dev.db';
        return new SQLiteAdapter(dbPath);
    }
  }

  /**
   * テスト専用のデータベースインスタンスを作成
   * 各テストで独立したデータベースが必要な場合に使用
   * @returns メモリ内SQLiteアダプター
   */
  static createTestDatabase(): DatabaseAdapter {
    console.log('🧪 独立したテスト用データベースを作成します...');
    return new SimplifiedMockAdapter();
  }

  /**
   * カスタムSQLiteファイルでデータベースを作成
   * 特定のファイル名でデータベースを作りたい場合に使用
   * @param filename SQLiteファイル名
   * @returns SQLiteアダプター
   */
  static createSQLiteDatabase(filename: string): DatabaseAdapter {
    console.log(`📁 カスタムSQLiteデータベースを作成します: ${filename}`);
    return new SQLiteAdapter(filename);
  }

  /**
   * 環境判定のヘルパーメソッド
   * @param env 環境変数
   * @returns 環境情報
   */
  static getEnvironmentInfo(env: Env): {
    environment: string;
    isProduction: boolean;
    isDevelopment: boolean;
    isTest: boolean;
    databaseType: 'D1' | 'SQLite';
  } {
    const environment = env.ENVIRONMENT || 'development';
    
    return {
      environment,
      isProduction: environment === 'production',
      isDevelopment: environment === 'development',
      isTest: environment === 'test',
      databaseType: environment === 'production' ? 'D1' : 'SQLite',
    };
  }
}