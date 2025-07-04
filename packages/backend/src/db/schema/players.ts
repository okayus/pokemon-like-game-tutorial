// 初学者向け：プレイヤー関連のテーブル定義
// Drizzle ORMを使用して型安全なスキーマを定義

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * プレイヤー基本情報テーブル
 * ゲーム内のプレイヤーキャラクターの情報を管理
 */
export const playersTable = sqliteTable('players', {
  // プレイヤーID（UUID形式）
  id: text('id').primaryKey(),
  // プレイヤー名
  name: text('name').notNull(),
  // マップ上のX座標
  positionX: integer('position_x').notNull().default(10),
  // マップ上のY座標
  positionY: integer('position_y').notNull().default(7),
  // 向いている方向（up, down, left, right）
  direction: text('direction').notNull().default('down'),
  // スプライト画像のパス
  sprite: text('sprite').notNull().default('player.png'),
  // 作成日時
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  // 更新日時
  updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
});

/**
 * プレイヤー所持金テーブル
 * プレイヤーの所持金情報を管理
 */
export const playerMoneyTable = sqliteTable('player_money', {
  // プレイヤーID（外部キー）
  playerId: text('player_id').primaryKey().references(() => playersTable.id),
  // 所持金額
  amount: integer('amount').notNull().default(0),
  // 更新日時
  updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
});

/**
 * プレイヤーインベントリテーブル
 * プレイヤーが所持するアイテムを管理
 */
export const playerInventoryTable = sqliteTable('player_inventory', {
  // プレイヤーID（複合主キーの一部）
  playerId: text('player_id').notNull().references(() => playersTable.id),
  // アイテムID（複合主キーの一部）
  itemId: integer('item_id').notNull(),
  // 所持数量
  quantity: integer('quantity').notNull().default(1),
  // 取得日時
  acquiredAt: text('acquired_at').notNull().default('CURRENT_TIMESTAMP'),
});

// 型定義のエクスポート（Drizzleの型推論を使用）
export type Player = typeof playersTable.$inferSelect;
export type NewPlayer = typeof playersTable.$inferInsert;
export type PlayerMoney = typeof playerMoneyTable.$inferSelect;
export type NewPlayerMoney = typeof playerMoneyTable.$inferInsert;
export type PlayerInventory = typeof playerInventoryTable.$inferSelect;
export type NewPlayerInventory = typeof playerInventoryTable.$inferInsert;