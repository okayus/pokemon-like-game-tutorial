// 初学者向け：ポケモン関連のテーブル定義
// Drizzle ORMを使用して型安全なスキーマを定義

import { sqliteTable, text, integer, index, primaryKey } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { playersTable } from './players';

/**
 * ポケモンマスターテーブル
 * ゲーム内の全ポケモン種族の定義情報を管理
 */
export const pokemonMasterTable = sqliteTable('pokemon_master', {
  // 種族ID
  speciesId: integer('species_id').primaryKey(),
  // ポケモン名
  name: text('name').notNull(),
  // 基礎HP
  hp: integer('hp').notNull(),
  // 基礎攻撃力
  attack: integer('attack').notNull(),
  // 基礎防御力
  defense: integer('defense').notNull(),
  // スプライト画像URL
  spriteUrl: text('sprite_url').notNull(),
  // 作成日時
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

/**
 * 所有ポケモンテーブル
 * プレイヤーが捕獲したポケモンの個体情報を管理
 */
export const ownedPokemonTable = sqliteTable('owned_pokemon', {
  // ポケモン個体ID（UUID形式）
  pokemonId: text('pokemon_id').primaryKey(),
  // 所有プレイヤーID（外部キー）
  playerId: text('player_id').notNull().references(() => playersTable.id),
  // 種族ID（外部キー）
  speciesId: integer('species_id').notNull().references(() => pokemonMasterTable.speciesId),
  // ニックネーム
  nickname: text('nickname'),
  // 現在のレベル
  level: integer('level').notNull().default(1),
  // 現在のHP
  currentHp: integer('current_hp').notNull(),
  // 捕獲日時
  caughtAt: text('caught_at').notNull().default('CURRENT_TIMESTAMP'),
  // 更新日時
  updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
}, (table) => ({
  // プレイヤーIDでの検索を高速化するインデックス
  playerIdx: index('idx_owned_pokemon_player').on(table.playerId),
}));

/**
 * プレイヤーパーティテーブル
 * プレイヤーの戦闘パーティ（最大6体）を管理
 */
export const playerPartyTable = sqliteTable('player_party', {
  // プレイヤーID（複合主キーの一部）
  playerId: text('player_id').notNull().references(() => playersTable.id),
  // パーティ内の位置（1-6、複合主キーの一部）
  position: integer('position').notNull(),
  // ポケモン個体ID（外部キー）
  pokemonId: text('pokemon_id').notNull().references(() => ownedPokemonTable.pokemonId),
}, (table) => ({
  // 複合主キー定義
  pk: primaryKey({ columns: [table.playerId, table.position] }),
}));

// 旧システムとの互換性のためのテーブル（将来削除予定）
export const pokemonSpeciesTable = sqliteTable('pokemon_species', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  hp: integer('hp').notNull(),
  attack: integer('attack').notNull(),
  defense: integer('defense').notNull(),
  speed: integer('speed').notNull(),
  type1: text('type1').notNull(),
  type2: text('type2'),
  sprite: text('sprite').notNull(),
});

// Zodスキーマの生成（バリデーション用）
export const insertPokemonMasterSchema = createInsertSchema(pokemonMasterTable, {
  speciesId: z.number().int().positive(),
  name: z.string().min(1).max(20),
  hp: z.number().int().min(1).max(999),
  attack: z.number().int().min(1).max(999),
  defense: z.number().int().min(1).max(999),
  spriteUrl: z.string().url(),
});

export const selectPokemonMasterSchema = createSelectSchema(pokemonMasterTable);

export const insertOwnedPokemonSchema = createInsertSchema(ownedPokemonTable, {
  pokemonId: z.string().uuid(),
  playerId: z.string().uuid(),
  speciesId: z.number().int().positive(),
  nickname: z.string().min(1).max(20).optional(),
  level: z.number().int().min(1).max(100),
  currentHp: z.number().int().min(0),
});

export const selectOwnedPokemonSchema = createSelectSchema(ownedPokemonTable);

export const insertPlayerPartySchema = createInsertSchema(playerPartyTable, {
  playerId: z.string().uuid(),
  position: z.number().int().min(1).max(6),
  pokemonId: z.string().uuid(),
});

export const selectPlayerPartySchema = createSelectSchema(playerPartyTable);

// 型定義のエクスポート
export type PokemonMaster = z.infer<typeof selectPokemonMasterSchema>;
export type NewPokemonMaster = z.infer<typeof insertPokemonMasterSchema>;
export type OwnedPokemon = z.infer<typeof selectOwnedPokemonSchema>;
export type NewOwnedPokemon = z.infer<typeof insertOwnedPokemonSchema>;
export type PlayerParty = z.infer<typeof selectPlayerPartySchema>;
export type NewPlayerParty = z.infer<typeof insertPlayerPartySchema>;