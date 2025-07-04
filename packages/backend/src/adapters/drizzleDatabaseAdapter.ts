// 初学者向け：Drizzle ORMラッパーアダプター
// 既存のDatabaseAdapterインターフェースを維持しつつDrizzleの機能を提供

import { DatabaseAdapter, PreparedStatement, BatchResult, ExecResult, RunResult, Statement } from '../types/database';
import { DrizzleMockAdapter } from './drizzleMockAdapter';

/**
 * DrizzleMockAdapterを既存のDatabaseAdapterインターフェースでラップ
 * 段階的移行のための互換性レイヤー
 */
export class DrizzleDatabaseAdapter implements DatabaseAdapter {
  private drizzleAdapter: DrizzleMockAdapter;

  constructor() {
    this.drizzleAdapter = new DrizzleMockAdapter();
  }

  /**
   * プリペアドステートメントの作成
   * 注意：Drizzle移行中は最小限の実装
   */
  prepare(sql: string): PreparedStatement {
    const db = this.drizzleAdapter.getDrizzleDb();
    
    return {
      bind: (...params: unknown[]) => {
        return {
          bind: () => ({ bind: () => ({}) } as any),
          first: async <T = unknown>(): Promise<T | null> => {
            // Drizzle移行により、この操作は今後不要
            return null;
          },
          all: async <T = unknown>(): Promise<{ results: T[] }> => {
            // Drizzle移行により、この操作は今後不要
            return { results: [] };
          },
          run: async (): Promise<RunResult> => {
            // Drizzle移行により、この操作は今後不要
            return {
              success: true,
              meta: { changes: 0, lastRowId: 0 }
            };
          }
        };
      },
      first: async <T = unknown>(): Promise<T | null> => {
        return null;
      },
      all: async <T = unknown>(): Promise<{ results: T[] }> => {
        return { results: [] };
      },
      run: async (): Promise<RunResult> => {
        return {
          success: true,
          meta: { changes: 0, lastRowId: 0 }
        };
      }
    };
  }

  /**
   * バッチ実行
   * 注意：Drizzle移行中は最小限の実装
   */
  async batch(statements: Statement[]): Promise<BatchResult> {
    return {
      results: statements.map(() => ({
        success: true,
        meta: { changes: 0, lastRowId: 0 }
      }))
    };
  }

  /**
   * 生SQL実行
   * 注意：Drizzle移行中は最小限の実装
   */
  async exec(sql: string): Promise<ExecResult> {
    return {
      count: 0,
      duration: 0
    };
  }

  /**
   * 1件取得ショートカット
   */
  async first<T>(sql: string): Promise<T | null> {
    return null;
  }

  /**
   * 接続を閉じる
   */
  close(): void {
    this.drizzleAdapter.close();
  }

  /**
   * Drizzleデータベースインスタンスを取得
   * 新しいコードはこのメソッドを使用してDrizzleクエリを実行
   */
  getDrizzleDb() {
    return this.drizzleAdapter.getDrizzleDb();
  }

  /**
   * Drizzleスキーマへのアクセス
   */
  get schema() {
    return this.drizzleAdapter.schema;
  }
}