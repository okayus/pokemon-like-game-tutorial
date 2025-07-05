// 初学者向け：アイテム関連のテーブル定義
// Drizzle ORMを使用して型安全なスキーマを定義

import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

/**
 * アイテムマスターテーブル
 * ゲーム内の全アイテムの定義情報を管理
 */
export const itemMasterTable = sqliteTable('item_master', {
  // アイテムID
  itemId: integer('item_id').primaryKey(),
  // アイテム名
  name: text('name').notNull(),
  // カテゴリー（回復、ボール、戦闘、重要など）
  category: text('category').notNull(),
  // 効果タイプ（HP回復、状態異常回復、ポケモン捕獲など）
  effectType: text('effect_type').notNull(),
  // 効果値（回復量、捕獲率など）
  effectValue: integer('effect_value').notNull().default(0),
  // 購入価格
  buyPrice: integer('buy_price').notNull().default(0),
  // 売却価格
  sellPrice: integer('sell_price').notNull().default(0),
  // 使用可能フラグ（0: 使用不可、1: 使用可能）
  usable: integer('usable').notNull().default(1),
  // 最大スタック数
  maxStack: integer('max_stack').notNull().default(99),
  // アイテム説明
  description: text('description').notNull(),
  // アイコン画像URL
  iconUrl: text('icon_url'),
  // 作成日時
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  // 更新日時
  updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
}, (table) => ({
  // カテゴリーでの検索を高速化するインデックス
  categoryIdx: index('idx_item_category').on(table.category),
}));

// 型定義のエクスポート（Drizzleの型推論を使用）
export type ItemMaster = typeof itemMasterTable.$inferSelect;
export type NewItemMaster = typeof itemMasterTable.$inferInsert;