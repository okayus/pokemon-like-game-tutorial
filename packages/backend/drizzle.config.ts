// 初学者向け：Drizzle ORM設定ファイル
// マイグレーション生成とスキーマ管理を設定

import type { Config } from 'drizzle-kit';

export default {
  // スキーマファイルの場所を指定
  schema: './src/db/schema/index.ts',
  
  // 出力先ディレクトリ（マイグレーションファイルが生成される場所）
  out: './drizzle',
  
  // データベースのタイプ
  dialect: 'sqlite',
  
  // データベース接続設定
  dbCredentials: {
    // 開発環境用SQLiteファイル
    url: './dev.db',
  },
  
  // 詳細ログを出力
  verbose: true,
  
  // SQLファイルを厳密にチェック
  strict: true,
} satisfies Config;