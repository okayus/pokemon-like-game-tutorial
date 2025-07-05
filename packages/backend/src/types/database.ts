// 初学者向け：データベース操作の共通インターフェース定義
// SQLiteとCloudflare D1の両方で使える統一された型定義

import type { D1Database } from '@cloudflare/workers-types';

/**
 * データベースアダプターの基底インターフェース
 * SQLiteとCloudflare D1の操作を統一化
 */
export interface DatabaseAdapter {
  /**
   * プリペアドステートメント（SQLインジェクション対策）の作成
   * @param sql 実行するSQLクエリ
   * @returns プリペアドステートメント
   */
  prepare(sql: string): PreparedStatement;

  /**
   * 複数のSQL文をトランザクションで実行
   * @param statements 実行するステートメント配列
   * @returns バッチ実行結果
   */
  batch(statements: Statement[]): Promise<BatchResult>;

  /**
   * 生SQLの直接実行（マイグレーション用）
   * @param sql 実行するSQL文
   * @returns 実行結果
   */
  exec(sql: string): Promise<ExecResult>;

  /**
   * 1件のレコードを取得するショートカット
   * @param sql 実行するSQLクエリ
   * @returns 取得したレコードまたはnull
   */
  first<T>(sql: string): Promise<T | null>;

  /**
   * データベース接続を閉じる（SQLiteのみ）
   * D1では不要だが、統一インターフェースのため存在
   */
  close?(): void;
}

/**
 * プリペアドステートメント操作のインターフェース
 * パラメータバインディングとクエリ実行を提供
 */
export interface PreparedStatement {
  /**
   * パラメータをバインド（SQLインジェクション対策）
   * @param params バインドするパラメータ
   * @returns バインド済みステートメント
   */
  bind(...params: unknown[]): PreparedStatement;

  /**
   * 1件のレコードを取得
   * @returns 取得したレコードまたはnull
   */
  first<T = unknown>(): Promise<T | null>;

  /**
   * 全レコードを取得
   * @returns 取得したレコード配列
   */
  all<T = unknown>(): Promise<{ results: T[] }>;

  /**
   * INSERT/UPDATE/DELETE文を実行
   * @returns 実行結果（変更行数など）
   */
  run(): Promise<RunResult>;
}

/**
 * SQL実行結果の型定義
 */
export interface RunResult {
  /** 実行が成功したかどうか */
  success: boolean;
  /** メタデータ（変更行数、最後に挿入されたID等） */
  meta: {
    /** 変更された行数 */
    changes: number;
    /** 最後に挿入されたレコードのID（AUTO_INCREMENTの場合） */
    lastRowId?: number;
  };
}

/**
 * バッチ実行結果の型定義
 */
export interface BatchResult {
  /** 各ステートメントの実行結果 */
  results: RunResult[];
}

/**
 * 生SQL実行結果の型定義
 */
export interface ExecResult {
  /** 処理されたレコード数 */
  count: number;
  /** 実行時間（ミリ秒） */
  duration: number;
}

/**
 * バッチ実行用のステートメント型
 * ジェネリック型として定義（実装依存）
 */
export type Statement = unknown;

/**
 * 環境設定の型定義
 * CloudflareのEnv型を拡張
 */
export interface DatabaseEnv {
  /** 実行環境（development/test/production） */
  ENVIRONMENT: string;
  /** Cloudflare D1データベースインスタンス（本番環境のみ） */
  DB?: D1Database;
}

/**
 * Cloudflare Workers環境変数の型定義
 * 実行環境で使用される環境変数
 */
export interface Env extends DatabaseEnv {
  /** Cloudflare D1データベースインスタンス */
  DB: D1Database;
  /** その他の環境変数 */
  [key: string]: unknown;
}

/**
 * マイグレーション情報の型定義
 */
export interface Migration {
  /** マイグレーションファイル名 */
  filename: string;
  /** マイグレーション内容（SQL） */
  sql: string;
  /** 実行日時 */
  executedAt?: string;
}