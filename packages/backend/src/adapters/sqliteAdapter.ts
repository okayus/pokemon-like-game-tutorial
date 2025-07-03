// 初学者向け：SQLiteデータベースアダプター
// better-sqlite3を使用してSQLiteに接続し、統一インターフェースを提供

import Database from 'better-sqlite3';
import { DatabaseAdapter, PreparedStatement, RunResult, BatchResult, ExecResult } from '../types/database';

/**
 * SQLiteデータベースへのアダプター実装
 * 開発環境とテスト環境で使用される
 */
export class SQLiteAdapter implements DatabaseAdapter {
  private db: Database.Database;
  private isClosed = false;

  /**
   * SQLiteアダプターのコンストラクタ
   * @param filename データベースファイル名（':memory:'でメモリ内DB）
   */
  constructor(filename: string = ':memory:') {
    try {
      this.db = new Database(filename);
      
      // パフォーマンス最適化設定
      this.db.pragma('journal_mode = WAL'); // Write-Ahead Logging
      this.db.pragma('synchronous = NORMAL'); // 適度な安全性とパフォーマンス
      this.db.pragma('cache_size = 1000'); // キャッシュサイズ
      this.db.pragma('temp_store = memory'); // 一時データをメモリに保存
      
      console.log(`📁 SQLiteデータベースに接続しました: ${filename}`);
    } catch (error) {
      console.error('❌ SQLiteデータベース接続エラー:', error);
      throw new Error(`SQLiteデータベースの初期化に失敗しました: ${error}`);
    }
  }

  /**
   * プリペアドステートメントを作成
   * SQLインジェクション対策として必須
   */
  prepare(sql: string): PreparedStatement {
    this.チェック接続状態();
    
    try {
      const stmt = this.db.prepare(sql);
      return new SQLitePreparedStatement(stmt);
    } catch (error) {
      console.error('❌ SQLプリペア エラー:', { sql, error });
      throw new Error(`SQLの準備に失敗しました: ${error}`);
    }
  }

  /**
   * 複数のSQL文をトランザクションで実行
   * 全て成功するか、全て失敗するかのいずれか
   */
  async batch(statements: any[]): Promise<BatchResult> {
    this.チェック接続状態();
    
    try {
      // トランザクション関数を作成
      const transaction = this.db.transaction(() => {
        return statements.map((stmt) => {
          if (typeof stmt.run === 'function') {
            return stmt.run();
          } else {
            throw new Error('無効なステートメント: run メソッドがありません');
          }
        });
      });

      // トランザクションを実行
      const results = transaction();
      
      console.log(`✅ バッチ実行完了: ${statements.length}件のSQL文`);
      return { results };
    } catch (error) {
      console.error('❌ バッチ実行エラー:', error);
      throw new Error(`バッチ実行に失敗しました: ${error}`);
    }
  }

  /**
   * 生SQLを直接実行（マイグレーション用）
   * 複数のSQL文を含む場合があるため、exec を使用
   */
  async exec(sql: string): Promise<ExecResult> {
    this.チェック接続状態();
    
    const start = Date.now();
    
    try {
      // SQLを実行（複数文対応）
      const result = this.db.exec(sql);
      const duration = Date.now() - start;
      
      console.log(`⚡ SQL実行完了: ${duration}ms`);
      return {
        count: result.length,
        duration,
      };
    } catch (error) {
      console.error('❌ SQL実行エラー:', { sql: sql.substring(0, 100) + '...', error });
      throw new Error(`SQL実行に失敗しました: ${error}`);
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
   * データベース接続を閉じる
   * アプリケーション終了時やテスト後に呼び出し
   */
  close(): void {
    if (!this.isClosed && this.db) {
      try {
        this.db.close();
        this.isClosed = true;
        console.log('🔐 SQLiteデータベース接続を閉じました');
      } catch (error) {
        console.error('❌ データベースクローズエラー:', error);
      }
    }
  }

  /**
   * 接続状態をチェック（プライベートメソッド）
   */
  private チェック接続状態(): void {
    if (this.isClosed) {
      throw new Error('データベース接続が閉じられています');
    }
  }
}

/**
 * SQLite用のプリペアドステートメント実装
 * better-sqlite3のStatementオブジェクトをラップ
 */
class SQLitePreparedStatement implements PreparedStatement {
  private boundParams: unknown[] = [];

  constructor(private stmt: Database.Statement) {}

  /**
   * パラメータをバインド
   * SQLインジェクション対策の核心部分
   */
  bind(...params: unknown[]): PreparedStatement {
    this.boundParams = params;
    return this;
  }

  /**
   * 1件のレコードを取得
   * SELECT文で最初の1件のみ必要な場合に使用
   */
  async first<T = unknown>(): Promise<T | null> {
    try {
      const result = this.stmt.get(...this.boundParams) as T;
      return result || null;
    } catch (error) {
      console.error('❌ first()実行エラー:', { params: this.boundParams, error });
      throw new Error(`レコード取得に失敗しました: ${error}`);
    }
  }

  /**
   * 全レコードを取得
   * SELECT文で複数件取得する場合に使用
   */
  async all<T = unknown>(): Promise<{ results: T[] }> {
    try {
      const results = this.stmt.all(...this.boundParams) as T[];
      return { results };
    } catch (error) {
      console.error('❌ all()実行エラー:', { params: this.boundParams, error });
      throw new Error(`レコード一覧取得に失敗しました: ${error}`);
    }
  }

  /**
   * INSERT/UPDATE/DELETE文を実行
   * データ変更系の操作で使用
   */
  async run(): Promise<RunResult> {
    try {
      const result = this.stmt.run(...this.boundParams);
      
      return {
        success: true,
        meta: {
          changes: result.changes,
          lastRowId: result.lastInsertRowid as number,
        },
      };
    } catch (error) {
      console.error('❌ run()実行エラー:', { params: this.boundParams, error });
      throw new Error(`SQL実行に失敗しました: ${error}`);
    }
  }
}