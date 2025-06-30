// プレイヤー情報のデータベース操作（初学者向け：データベースとのやり取りを担当）
import { D1Database } from '@cloudflare/workers-types';
import { Character } from '@pokemon-like-game-tutorial/shared';

/**
 * プレイヤー情報を取得する
 * @param db - D1データベースインスタンス
 * @param プレイヤーID - 取得するプレイヤーのID
 * @returns プレイヤー情報またはnull
 */
export async function プレイヤー情報取得(
  db: D1Database,
  プレイヤーID: string
): Promise<Character | null> {
  // SQL文を準備（初学者向け：データベースから特定のプレイヤーを検索）
  const 結果 = await db
    .prepare(`
      SELECT id, name, position_x, position_y, direction, sprite 
      FROM players 
      WHERE id = ?
    `)
    .bind(プレイヤーID)
    .first();
  
  if (!結果) {
    return null;
  }
  
  // データベースの形式からアプリケーションの形式に変換
  return {
    id: 結果.id as string,
    name: 結果.name as string,
    position: {
      x: 結果.position_x as number,
      y: 結果.position_y as number
    },
    direction: 結果.direction as string,
    sprite: 結果.sprite as string
  };
}

/**
 * プレイヤー情報を保存する（新規作成）
 * @param db - D1データベースインスタンス
 * @param プレイヤー - 保存するプレイヤー情報
 */
export async function プレイヤー情報保存(
  db: D1Database,
  プレイヤー: Character
): Promise<void> {
  // SQL文でデータを挿入（初学者向け：新しいプレイヤーをデータベースに保存）
  await db
    .prepare(`
      INSERT INTO players (id, name, position_x, position_y, direction, sprite)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    .bind(
      プレイヤー.id,
      プレイヤー.name,
      プレイヤー.position.x,
      プレイヤー.position.y,
      プレイヤー.direction,
      プレイヤー.sprite
    )
    .run();
}

/**
 * プレイヤー情報を更新する
 * @param db - D1データベースインスタンス
 * @param プレイヤーID - 更新するプレイヤーのID
 * @param 更新内容 - 更新する項目
 */
export async function プレイヤー情報更新(
  db: D1Database,
  プレイヤーID: string,
  更新内容: Partial<Omit<Character, 'id'>>
): Promise<void> {
  // 現在の情報を取得
  const 現在の情報 = await プレイヤー情報取得(db, プレイヤーID);
  if (!現在の情報) {
    throw new Error(`プレイヤーID ${プレイヤーID} が見つかりません`);
  }
  
  // 更新内容をマージ
  const 更新後 = {
    ...現在の情報,
    ...更新内容,
    position: 更新内容.position || 現在の情報.position
  };
  
  // SQL文で更新（初学者向け：既存のプレイヤー情報を更新）
  await db
    .prepare(`
      UPDATE players 
      SET name = ?, position_x = ?, position_y = ?, direction = ?, sprite = ?
      WHERE id = ?
    `)
    .bind(
      更新後.name,
      更新後.position.x,
      更新後.position.y,
      更新後.direction,
      更新後.sprite,
      プレイヤーID
    )
    .run();
}