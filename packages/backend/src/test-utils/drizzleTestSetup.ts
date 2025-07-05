// 初学者向け：Drizzle ORM対応のテスト用セットアップ
// 型安全なテスト環境を提供

import { beforeEach, afterEach } from 'vitest';
import { DrizzleDatabaseAdapter } from '../adapters/drizzleDatabaseAdapter';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';

// テスト用のデータベースインスタンスを保持
let testDb: DrizzleDatabaseAdapter | null = null;

/**
 * 各テスト実行前にDrizzleデータベースを初期化
 * メモリ内SQLiteで高速かつ型安全なテストを実現
 */
beforeEach(async () => {
  try {
    console.log('🧪 Drizzleテスト用データベースを初期化中...');
    
    // 新しいメモリ内データベースを作成
    testDb = new DrizzleDatabaseAdapter();
    
    console.log('✅ Drizzleテスト用データベース準備完了');
  } catch (error) {
    console.error('❌ Drizzleテスト用データベース初期化エラー:', error);
    throw new Error(`Drizzleテスト用データベース初期化に失敗: ${error}`);
  }
});

/**
 * 各テスト実行後にデータベースをクリーンアップ
 * メモリリークを防ぐため確実にクローズ
 */
afterEach(() => {
  try {
    if (testDb) {
      testDb.close();
      testDb = null;
      console.log('🧹 Drizzleテスト用データベースをクリーンアップしました');
    }
  } catch (error) {
    console.error('❌ Drizzleテスト用データベースクリーンアップエラー:', error);
  }
});

/**
 * Drizzle対応テスト用データベースインスタンスを取得
 * 型安全なクエリ操作が可能
 * @returns 現在のテスト用データベース（Drizzle対応）
 */
export function getDrizzleTestDatabase(): DrizzleDatabaseAdapter {
  if (!testDb) {
    throw new Error('Drizzleテスト用データベースが初期化されていません。beforeEachが実行されているか確認してください。');
  }
  return testDb;
}

/**
 * Drizzleデータベースインスタンスを直接取得
 * 型安全なクエリ記述が可能
 * @returns Drizzleデータベースインスタンス
 */
export function getDrizzleDb() {
  const adapter = getDrizzleTestDatabase();
  return adapter.getDrizzleDb();
}

/**
 * テスト用プレイヤーを型安全に作成
 * @param playerData プレイヤーデータ（部分的でも可）
 * @returns 作成されたプレイヤーデータ
 */
export async function createTestPlayerWithDrizzle(
  playerData: Partial<typeof schema.playersTable.$inferInsert> & { id: string }
): Promise<typeof schema.playersTable.$inferSelect> {
  try {
    const db = getDrizzleDb();
    
    const fullPlayerData = {
      name: 'テストプレイヤー',
      positionX: 10,
      positionY: 7,
      direction: 'down',
      sprite: 'player.png',
      ...playerData
    };
    
    // Drizzleで型安全にプレイヤーを作成
    await db.insert(schema.playersTable).values(fullPlayerData);
    
    // 作成されたプレイヤーを取得
    const createdPlayer = await db
      .select()
      .from(schema.playersTable)
      .where(eq(schema.playersTable.id, fullPlayerData.id))
      .get();
    
    if (!createdPlayer) {
      throw new Error('プレイヤーの作成に失敗しました');
    }
    
    console.log(`👤 Drizzleでテストプレイヤーを作成: ${createdPlayer.id}`);
    return createdPlayer;
  } catch (error) {
    console.error('❌ Drizzleテストプレイヤー作成エラー:', error);
    throw new Error(`Drizzleテストプレイヤー作成に失敗: ${error}`);
  }
}

/**
 * テスト用アイテムをプレイヤーインベントリに追加
 * @param playerId プレイヤーID
 * @param itemId アイテムID
 * @param quantity 数量
 */
export async function addTestItemToInventory(
  playerId: string,
  itemId: number,
  quantity: number = 1
): Promise<void> {
  try {
    const db = getDrizzleDb();
    
    // 型安全なアイテム追加
    await db.insert(schema.playerInventoryTable).values({
      playerId,
      itemId,
      quantity
    });
    
    console.log(`📦 テストアイテムを追加: プレイヤー ${playerId} にアイテム ${itemId} x${quantity}`);
  } catch (error) {
    console.error('❌ テストアイテム追加エラー:', error);
    throw new Error(`テストアイテム追加に失敗: ${error}`);
  }
}

/**
 * テスト用ポケモンをプレイヤーに追加
 * @param playerId プレイヤーID
 * @param speciesId 種族ID
 * @param nickname ニックネーム
 * @param level レベル
 */
export async function addTestPokemonToPlayer(
  playerId: string,
  speciesId: number,
  nickname?: string,
  level: number = 1
): Promise<typeof schema.ownedPokemonTable.$inferSelect> {
  try {
    const db = getDrizzleDb();
    
    // ポケモンマスターデータから基礎HP取得
    const pokemonMaster = await db
      .select()
      .from(schema.pokemonMasterTable)
      .where(eq(schema.pokemonMasterTable.speciesId, speciesId))
      .get();
    
    if (!pokemonMaster) {
      throw new Error(`ポケモンマスターデータが見つかりません: speciesId ${speciesId}`);
    }
    
    const pokemonData = {
      pokemonId: `test-pokemon-${Date.now()}`,
      playerId,
      speciesId,
      nickname: nickname || pokemonMaster.name,
      level,
      currentHp: pokemonMaster.hp
    };
    
    // 型安全なポケモン追加
    await db.insert(schema.ownedPokemonTable).values(pokemonData);
    
    // 作成されたポケモンを取得
    const createdPokemon = await db
      .select()
      .from(schema.ownedPokemonTable)
      .where(eq(schema.ownedPokemonTable.pokemonId, pokemonData.pokemonId))
      .get();
    
    if (!createdPokemon) {
      throw new Error('ポケモンの作成に失敗しました');
    }
    
    console.log(`🐾 テストポケモンを追加: ${createdPokemon.nickname} (${pokemonMaster.name})`);
    return createdPokemon;
  } catch (error) {
    console.error('❌ テストポケモン追加エラー:', error);
    throw new Error(`テストポケモン追加に失敗: ${error}`);
  }
}

/**
 * プレイヤーの所持アイテム一覧を型安全に取得
 * @param playerId プレイヤーID
 * @returns アイテム一覧（アイテムマスター情報も含む）
 */
export async function getPlayerItemsWithDrizzle(playerId: string) {
  const db = getDrizzleDb();
  
  return await db
    .select({
      playerId: schema.playerInventoryTable.playerId,
      itemId: schema.playerInventoryTable.itemId,
      quantity: schema.playerInventoryTable.quantity,
      acquiredAt: schema.playerInventoryTable.acquiredAt,
      name: schema.itemMasterTable.name,
      category: schema.itemMasterTable.category,
      description: schema.itemMasterTable.description
    })
    .from(schema.playerInventoryTable)
    .innerJoin(
      schema.itemMasterTable,
      eq(schema.playerInventoryTable.itemId, schema.itemMasterTable.itemId)
    )
    .where(eq(schema.playerInventoryTable.playerId, playerId));
}

/**
 * プレイヤーの所持ポケモン一覧を型安全に取得
 * @param playerId プレイヤーID
 * @returns ポケモン一覧（種族情報も含む）
 */
export async function getPlayerPokemonWithDrizzle(playerId: string) {
  const db = getDrizzleDb();
  
  return await db
    .select({
      pokemonId: schema.ownedPokemonTable.pokemonId,
      playerId: schema.ownedPokemonTable.playerId,
      speciesId: schema.ownedPokemonTable.speciesId,
      nickname: schema.ownedPokemonTable.nickname,
      level: schema.ownedPokemonTable.level,
      currentHp: schema.ownedPokemonTable.currentHp,
      caughtAt: schema.ownedPokemonTable.caughtAt,
      speciesName: schema.pokemonMasterTable.name,
      baseHp: schema.pokemonMasterTable.hp,
      baseAttack: schema.pokemonMasterTable.attack,
      baseDefense: schema.pokemonMasterTable.defense
    })
    .from(schema.ownedPokemonTable)
    .innerJoin(
      schema.pokemonMasterTable,
      eq(schema.ownedPokemonTable.speciesId, schema.pokemonMasterTable.speciesId)
    )
    .where(eq(schema.ownedPokemonTable.playerId, playerId));
}

/**
 * テストデータのクリーンアップ（型安全）
 * @param tables クリアするテーブル（指定しない場合は全プレイヤーデータ）
 */
export async function clearTestDataWithDrizzle(tables?: string[]): Promise<void> {
  try {
    const db = getDrizzleDb();
    
    // デフォルトでプレイヤー関連データのみクリア
    if (!tables) {
      await db.delete(schema.playerPartyTable);
      await db.delete(schema.ownedPokemonTable);
      await db.delete(schema.playerInventoryTable);
      await db.delete(schema.playerMoneyTable);
      await db.delete(schema.playersTable);
      console.log('✅ Drizzleテストデータクリア完了（プレイヤーデータのみ）');
    } else {
      // 指定されたテーブルをクリア（手動実装が必要）
      console.log('⚠️ 特定テーブルクリアは手動実装が必要です');
    }
  } catch (error) {
    console.error('❌ Drizzleテストデータクリアエラー:', error);
    throw new Error(`Drizzleテストデータクリアに失敗: ${error}`);
  }
}