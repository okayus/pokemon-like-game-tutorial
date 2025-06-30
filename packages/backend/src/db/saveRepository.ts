// セーブデータのデータベース操作（初学者向け：セーブデータの保存と読み込みを担当）
import { D1Database } from '@cloudflare/workers-types';
import { セーブデータ, セーブスロット } from '@pokemon-like-game-tutorial/shared';

/**
 * セーブデータを保存する（初学者向け：ゲームの状態をデータベースに保存）
 * @param db - D1データベースインスタンス
 * @param ユーザーID - ユーザーのID
 * @param スロット番号 - セーブスロット（1〜3）
 * @param データ - 保存するセーブデータ
 */
export async function セーブデータ保存(
  db: D1Database,
  ユーザーID: number,
  スロット番号: number,
  データ: セーブデータ
): Promise<void> {
  // INSERT OR REPLACEで既存データがある場合は上書き（初学者向け：同じスロットに保存すると上書き）
  await db
    .prepare(`
      INSERT OR REPLACE INTO saves (user_id, slot, data, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `)
    .bind(ユーザーID, スロット番号, JSON.stringify(データ))
    .run();
}

/**
 * セーブデータを取得する（初学者向け：保存されたゲームデータを読み込み）
 * @param db - D1データベースインスタンス
 * @param ユーザーID - ユーザーのID
 * @param スロット番号 - セーブスロット（1〜3）
 * @returns セーブデータまたはnull
 */
export async function セーブデータ取得(
  db: D1Database,
  ユーザーID: number,
  スロット番号: number
): Promise<セーブデータ | null> {
  const 結果 = await db
    .prepare(`
      SELECT data 
      FROM saves 
      WHERE user_id = ? AND slot = ?
    `)
    .bind(ユーザーID, スロット番号)
    .first();
  
  if (!結果 || !結果.data) {
    return null;
  }
  
  // JSON文字列をオブジェクトに変換
  return JSON.parse(結果.data as string) as セーブデータ;
}

/**
 * ユーザーの全セーブデータを取得する（初学者向け：全スロットの情報を一覧取得）
 * @param db - D1データベースインスタンス
 * @param ユーザーID - ユーザーのID
 * @returns セーブスロットの配列
 */
export async function ユーザーの全セーブデータ取得(
  db: D1Database,
  ユーザーID: number
): Promise<セーブスロット[]> {
  const 結果 = await db
    .prepare(`
      SELECT slot, data, updated_at
      FROM saves 
      WHERE user_id = ?
      ORDER BY slot
    `)
    .bind(ユーザーID)
    .all();
  
  if (!結果.results) {
    return [];
  }
  
  // データベースの結果をセーブスロット型に変換
  return 結果.results.map(row => ({
    slot: row.slot as number,
    data: JSON.parse(row.data as string) as セーブデータ,
    updatedAt: row.updated_at as string
  }));
}

/**
 * セーブデータを削除する（初学者向け：指定スロットのデータを削除）
 * @param db - D1データベースインスタンス
 * @param ユーザーID - ユーザーのID
 * @param スロット番号 - セーブスロット（1〜3）
 */
export async function セーブデータ削除(
  db: D1Database,
  ユーザーID: number,
  スロット番号: number
): Promise<void> {
  await db
    .prepare(`
      DELETE FROM saves 
      WHERE user_id = ? AND slot = ?
    `)
    .bind(ユーザーID, スロット番号)
    .run();
}