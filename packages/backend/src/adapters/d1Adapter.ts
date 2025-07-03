// 初学者向け：Cloudflare D1データベースアダプター
// 本番環境でCloudflare D1に接続するための透過的なアダプター

import { DatabaseAdapter, PreparedStatement, RunResult, BatchResult, ExecResult } from '../types/database';

/**
 * Cloudflare D1データベースへのアダプター実装
 * 本番環境（production）で使用される
 */
export class D1Adapter implements DatabaseAdapter {
  /**
   * D1アダプターのコンストラクタ
   * @param d1 Cloudflare D1データベースインスタンス
   */
  constructor(private d1: D1Database) {
    console.log('☁️ Cloudflare D1データベースに接続しました');
  }

  /**
   * プリペアドステートメントを作成
   * D1の prepare メソッドを直接使用
   */
  prepare(sql: string): PreparedStatement {
    try {
      const stmt = this.d1.prepare(sql);
      return new D1PreparedStatement(stmt);
    } catch (error) {
      console.error('❌ D1 SQLプリペア エラー:', { sql, error });
      throw new Error(`D1 SQLの準備に失敗しました: ${error}`);
    }
  }

  /**
   * 複数のSQL文をトランザクションで実行
   * D1のバッチ機能を使用
   */
  async batch(statements: any[]): Promise<BatchResult> {
    try {
      const result = await this.d1.batch(statements);
      console.log(`✅ D1バッチ実行完了: ${statements.length}件のSQL文`);
      return result;
    } catch (error) {
      console.error('❌ D1バッチ実行エラー:', error);
      throw new Error(`D1バッチ実行に失敗しました: ${error}`);
    }
  }

  /**
   * 生SQLを直接実行（マイグレーション用）
   * D1のexec機能を使用
   */
  async exec(sql: string): Promise<ExecResult> {
    try {
      const start = Date.now();
      const result = await this.d1.exec(sql);
      const duration = Date.now() - start;
      
      console.log(`⚡ D1 SQL実行完了: ${duration}ms`);
      return {
        count: result.count || 0,
        duration,
      };
    } catch (error) {
      console.error('❌ D1 SQL実行エラー:', { sql: sql.substring(0, 100) + '...', error });
      throw new Error(`D1 SQL実行に失敗しました: ${error}`);
    }
  }

  /**
   * 1件のレコードを取得するショートカット
   * @param sql 実行するSQLクエリ
   * @returns 取得したレコードまたはnull
   */
  async first<T>(sql: string): Promise<T | null> {
    const stmt = this.prepare(sql);
    return await stmt.first<T>();
  }

  /**
   * 接続を閉じる機能
   * D1では不要だが、統一インターフェースのため実装
   * 何もしない（no-op）
   */
  close?(): void {
    // D1は自動的に管理されるため、明示的なclose処理は不要
    console.log('ℹ️ D1は自動管理のため、close処理をスキップします');
  }
}

/**
 * D1用のプリペアドステートメント実装
 * D1のPreparedStatementを透過的にラップ
 */
class D1PreparedStatement implements PreparedStatement {
  /**
   * D1PreparedStatementのコンストラクタ
   * @param stmt D1のプリペアドステートメント
   */
  constructor(private stmt: any) {}

  /**
   * パラメータをバインド
   * D1のbindメソッドを直接使用
   */
  bind(...params: unknown[]): PreparedStatement {
    try {
      const boundStmt = this.stmt.bind(...params);
      return new D1PreparedStatement(boundStmt);
    } catch (error) {
      console.error('❌ D1バインドエラー:', { params, error });
      throw new Error(`D1パラメータバインドに失敗しました: ${error}`);
    }
  }

  /**
   * 1件のレコードを取得
   * D1のfirstメソッドを直接使用
   */
  async first<T = unknown>(): Promise<T | null> {
    try {
      const result = await this.stmt.first<T>();
      return result;
    } catch (error) {
      console.error('❌ D1 first()実行エラー:', error);
      throw new Error(`D1レコード取得に失敗しました: ${error}`);
    }
  }

  /**
   * 全レコードを取得
   * D1のallメソッドを直接使用
   */
  async all<T = unknown>(): Promise<{ results: T[] }> {
    try {
      const result = await this.stmt.all<T>();
      return result;
    } catch (error) {
      console.error('❌ D1 all()実行エラー:', error);
      throw new Error(`D1レコード一覧取得に失敗しました: ${error}`);
    }
  }

  /**
   * INSERT/UPDATE/DELETE文を実行
   * D1のrunメソッドを直接使用
   */
  async run(): Promise<RunResult> {
    try {
      const result = await this.stmt.run();
      return result;
    } catch (error) {
      console.error('❌ D1 run()実行エラー:', error);
      throw new Error(`D1 SQL実行に失敗しました: ${error}`);
    }
  }
}