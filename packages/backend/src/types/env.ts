// Cloudflare Workers環境の型定義（初学者向け：環境変数やデータベースの型を定義）
import { D1Database } from '@cloudflare/workers-types';

export interface Env {
  // データベース接続（初学者向け：D1データベースへのアクセス）
  DB: D1Database;

  // 環境変数（初学者向け：開発環境か本番環境かを判定）
  ENVIRONMENT: string;
}

// 初学者向け：Database型をエクスポート（後方互換性のため）
export type Database = D1Database;
