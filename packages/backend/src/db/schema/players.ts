// 初学者向け：プレイヤー関連のテーブル定義
// Drizzle ORMを使用して型安全なスキーマを定義

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

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

// Zodスキーマの生成（バリデーション用）
export const insertPlayerSchema = createInsertSchema(playersTable, {
  id: z.string().uuid(),
  name: z.string().min(1).max(20),
  positionX: z.number().int().min(0).max(100),
  positionY: z.number().int().min(0).max(100),
  direction: z.enum(['up', 'down', 'left', 'right']),
});

export const selectPlayerSchema = createSelectSchema(playersTable);

export const insertPlayerMoneySchema = createInsertSchema(playerMoneyTable, {
  playerId: z.string().uuid(),
  amount: z.number().int().min(0).max(9999999),
});

export const selectPlayerMoneySchema = createSelectSchema(playerMoneyTable);

export const insertPlayerInventorySchema = createInsertSchema(playerInventoryTable, {
  playerId: z.string().uuid(),
  itemId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(999),
});

export const selectPlayerInventorySchema = createSelectSchema(playerInventoryTable);

// 型定義のエクスポート
export type Player = z.infer<typeof selectPlayerSchema>;
export type NewPlayer = z.infer<typeof insertPlayerSchema>;
export type PlayerMoney = z.infer<typeof selectPlayerMoneySchema>;
export type NewPlayerMoney = z.infer<typeof insertPlayerMoneySchema>;
export type PlayerInventory = z.infer<typeof selectPlayerInventorySchema>;
export type NewPlayerInventory = z.infer<typeof insertPlayerInventorySchema>;