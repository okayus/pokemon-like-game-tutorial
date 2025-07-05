// 初学者向け：リポジトリパターンの基底クラス
// 全てのリポジトリが共通で使用するデータベース操作を定義

import { DatabaseAdapter } from '../types/database';

/**
 * リポジトリパターンの基底クラス
 * データベース操作の共通機能を提供し、DRY原則を実現
 */
export abstract class BaseRepository {
  /**
   * ベースリポジトリのコンストラクタ
   * @param db データベースアダプター（SQLiteまたはD1）
   */
  constructor(protected db: DatabaseAdapter) {
    // protectedにより、継承先クラスからアクセス可能
  }

  /**
   * 単一レコード取得のヘルパーメソッド
   * @param sql 実行するSQLクエリ
   * @param params バインドパラメータ
   * @returns 取得したレコードまたはnull
   */
  protected async executeQuery<T>(sql: string, params: unknown[] = []): Promise<T | null> {
    try {
      const stmt = this.db.prepare(sql);
      const result = await stmt.bind(...params).first<T>();
      return result;
    } catch (error) {
      console.error('❌ クエリ実行エラー:', { sql, params, error });
      throw new Error(`クエリ実行に失敗しました: ${error}`);
    }
  }

  /**
   * 複数レコード取得のヘルパーメソッド
   * @param sql 実行するSQLクエリ
   * @param params バインドパラメータ
   * @returns 取得したレコード配列
   */
  protected async executeQueryAll<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    try {
      const stmt = this.db.prepare(sql);
      const result = await stmt.bind(...params).all<T>();
      return result.results;
    } catch (error) {
      console.error('❌ 一覧クエリ実行エラー:', { sql, params, error });
      throw new Error(`一覧クエリ実行に失敗しました: ${error}`);
    }
  }

  /**
   * データ更新系のヘルパーメソッド（INSERT/UPDATE/DELETE）
   * @param sql 実行するSQLクエリ
   * @param params バインドパラメータ
   * @returns 実行結果（変更行数など）
   */
  protected async executeUpdate(sql: string, params: unknown[] = []) {
    try {
      const stmt = this.db.prepare(sql);
      const result = await stmt.bind(...params).run();
      return result;
    } catch (error) {
      console.error('❌ 更新クエリ実行エラー:', { sql, params, error });
      throw new Error(`更新クエリ実行に失敗しました: ${error}`);
    }
  }

  /**
   * レコードの存在確認ヘルパーメソッド
   * @param sql 存在確認用SQLクエリ（COUNT(*)を使用）
   * @param params バインドパラメータ
   * @returns レコードが存在するかどうか
   */
  protected async exists(sql: string, params: unknown[] = []): Promise<boolean> {
    try {
      const result = await this.executeQuery<{ count: number }>(sql, params);
      return (result?.count || 0) > 0;
    } catch (error) {
      console.error('❌ 存在確認エラー:', { sql, params, error });
      throw new Error(`存在確認に失敗しました: ${error}`);
    }
  }

  /**
   * ページネーション対応の取得メソッド
   * @param sql ベースとなるSQLクエリ
   * @param params バインドパラメータ
   * @param page ページ番号（1から開始）
   * @param limit 1ページあたりの件数
   * @returns ページネーション結果
   */
  protected async executeQueryWithPagination<T>(
    sql: string,
    params: unknown[] = [],
    page: number = 1,
    limit: number = 10
  ): Promise<{
    items: T[];
    pagination: {
      page: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    try {
      // OFFSET値を計算
      const offset = (page - 1) * limit;
      
      // LIMIT/OFFSET句を追加
      const paginatedSql = `${sql} LIMIT ? OFFSET ?`;
      const paginatedParams = [...params, limit + 1, offset]; // +1で次ページの存在を確認
      
      const results = await this.executeQueryAll<T>(paginatedSql, paginatedParams);
      
      // 次ページの存在確認
      const hasMore = results.length > limit;
      const items = hasMore ? results.slice(0, limit) : results;
      
      return {
        items,
        pagination: {
          page,
          limit,
          offset,
          hasMore,
        },
      };
    } catch (error) {
      console.error('❌ ページネーションクエリエラー:', { sql, params, page, limit, error });
      throw new Error(`ページネーションクエリに失敗しました: ${error}`);
    }
  }

  /**
   * トランザクション実行のヘルパーメソッド
   * 複数の操作を原子的に実行する場合に使用
   * @param operations 実行する操作の配列
   * @returns バッチ実行結果
   */
  protected async executeTransaction(operations: Array<{ sql: string; params: unknown[] }>) {
    try {
      // プリペアドステートメントを作成
      const statements = operations.map(op => {
        const stmt = this.db.prepare(op.sql);
        return stmt.bind(...op.params);
      });
      
      // バッチ実行
      const result = await this.db.batch(statements);
      console.log(`✅ トランザクション完了: ${operations.length}件の操作`);
      return result;
    } catch (error) {
      console.error('❌ トランザクション実行エラー:', { operations, error });
      throw new Error(`トランザクション実行に失敗しました: ${error}`);
    }
  }

  /**
   * 安全な数値変換ヘルパー
   * SQLiteは数値を文字列として返すことがあるため
   * @param value 変換対象の値
   * @param defaultValue デフォルト値
   * @returns 数値
   */
  protected toNumber(value: unknown, defaultValue: number = 0): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
  }

  /**
   * 安全な文字列変換ヘルパー
   * @param value 変換対象の値
   * @param defaultValue デフォルト値
   * @returns 文字列
   */
  protected toString(value: unknown, defaultValue: string = ''): string {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return defaultValue;
    return String(value);
  }
}