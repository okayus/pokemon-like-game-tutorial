// 初学者向け：Drizzle ORM対応のデータベースアダプター
// 型安全なクエリ操作を提供する統一インターフェース

import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema';

/**
 * Drizzleベースのデータベースアダプター
 * 型安全なクエリ操作を提供
 */
export abstract class DrizzleAdapter {
  protected db: ReturnType<typeof drizzle>;

  constructor(connection: any) {
    this.db = drizzle(connection, { schema });
  }

  /**
   * データベース接続を閉じる
   */
  abstract close?(): void;

  /**
   * Drizzleデータベースインスタンスを取得
   * 型安全なクエリ操作に使用
   */
  getDrizzleDb() {
    return this.db;
  }

  /**
   * テーブルスキーマへのアクセス
   */
  get schema() {
    return schema;
  }
}