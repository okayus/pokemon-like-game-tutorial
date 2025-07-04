// 初学者向け：Drizzle ORM対応のデータベース型定義
// 型安全なクエリ操作のための統一インターフェース

import type { D1Database } from '@cloudflare/workers-types';
import type { DrizzleAdapter } from '../adapters/drizzleAdapter';

/**
 * Drizzle対応データベースアダプターのインターフェース
 * 型安全なクエリ操作を提供
 */
export interface DrizzleDatabaseAdapter {
  /**
   * Drizzleデータベースインスタンスを取得
   * 型安全なクエリ操作に使用
   */
  getDrizzleDb(): ReturnType<DrizzleAdapter['getDrizzleDb']>;

  /**
   * テーブルスキーマへのアクセス
   */
  readonly schema: typeof import('../db/schema');

  /**
   * データベース接続を閉じる（SQLiteのみ）
   * D1では不要だが、統一インターフェースのため存在
   */
  close?(): void;
}

/**
 * 環境設定の型定義（Drizzle対応）
 * CloudflareのEnv型を拡張
 */
export interface DrizzleDatabaseEnv {
  /** 実行環境（development/test/production） */
  ENVIRONMENT: string;
  /** Cloudflare D1データベースインスタンス（本番環境のみ） */
  DB?: D1Database;
}

/**
 * Cloudflare Workers環境変数の型定義（Drizzle対応）
 * 実行環境で使用される環境変数
 */
export interface DrizzleEnv extends DrizzleDatabaseEnv {
  /** Cloudflare D1データベースインスタンス */
  DB: D1Database;
  /** その他の環境変数 */
  [key: string]: unknown;
}