// 初学者向け：アイテム・インベントリシステムのデータアクセス層
// データベースとのやり取りを行うリポジトリクラス

import type {
  アイテムマスタ,
  インベントリアイテム,
  インベントリフィルター,
  インベントリ応答,
} from '@pokemon-like-game-tutorial/shared';

/**
 * アイテム操作の結果型
 * 初学者向け：アイテムの追加・使用操作の結果を表す
 */
export interface アイテム操作結果 {
  success: boolean;
  new_quantity?: number;
  remaining_quantity?: number;
  error?: string;
}

/**
 * 所持金更新の結果型
 * 初学者向け：所持金の更新操作の結果を表す
 */
export interface 所持金更新結果 {
  success: boolean;
  new_amount?: number;
  error?: string;
}

/**
 * 購入・売却の結果型
 * 初学者向け：ショップでの取引結果を表す
 */
export interface 取引操作結果 {
  success: boolean;
  transaction_amount?: number;
  new_money_amount?: number;
  new_item_quantity?: number;
  error?: string;
}

/**
 * アイテムリポジトリクラス
 * 初学者向け：アイテム関連のデータベース操作を担当
 */
export class アイテムリポジトリ {
  constructor(private db: D1Database) {}

  /**
   * 全アイテムマスターデータを取得
   * 初学者向け：ゲーム内の全アイテム情報を取得する
   */
  async 全アイテムマスター取得(): Promise<アイテムマスタ[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM item_master 
      ORDER BY category, item_id
    `);

    const result = await stmt.all();
    return result.results as unknown as アイテムマスタ[];
  }

  /**
   * 特定のアイテムマスターデータを取得
   * 初学者向け：アイテムIDを指定して詳細情報を取得する
   */
  async アイテムマスター取得(item_id: number): Promise<アイテムマスタ | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM item_master 
      WHERE item_id = ?
    `);

    const result = await stmt.bind(item_id).first();
    return result as アイテムマスタ | null;
  }

  /**
   * カテゴリ別のアイテムマスターデータを取得
   * 初学者向け：特定のカテゴリのアイテムのみを取得する
   */
  async カテゴリ別アイテム取得(category: string): Promise<アイテムマスタ[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM item_master 
      WHERE category = ?
      ORDER BY item_id
    `);

    const result = await stmt.bind(category).all();
    return result.results as unknown as アイテムマスタ[];
  }

  /**
   * プレイヤーのインベントリを取得
   * 初学者向け：プレイヤーが所持するアイテム一覧を取得する
   */
  async プレイヤーインベントリ取得(player_id: string): Promise<インベントリアイテム[]> {
    const stmt = this.db.prepare(`
      SELECT 
        im.*,
        pi.quantity,
        pi.obtained_at
      FROM player_inventory pi
      JOIN item_master im ON pi.item_id = im.item_id
      WHERE pi.player_id = ?
      ORDER BY pi.obtained_at DESC
    `);

    const result = await stmt.bind(player_id).all();
    return result.results as unknown as インベントリアイテム[];
  }

  /**
   * フィルター条件付きでプレイヤーのインベントリを取得
   * 初学者向け：検索・ソート・ページング機能付きのインベントリ取得
   */
  async フィルター付きインベントリ取得(
    player_id: string,
    filter: インベントリフィルター
  ): Promise<インベントリ応答> {
    // WHERE条件の構築
    const whereConditions = ['pi.player_id = ?'];
    const params: unknown[] = [player_id];

    // カテゴリフィルター
    if (filter.category) {
      whereConditions.push('im.category = ?');
      params.push(filter.category);
    }

    // 検索キーワードフィルター
    if (filter.search_keyword) {
      whereConditions.push('im.name LIKE ?');
      params.push(`%${filter.search_keyword}%`);
    }

    // ORDER BY句の構築
    let orderBy = 'pi.obtained_at DESC'; // デフォルト
    if (filter.sort_by) {
      const sortColumn =
        filter.sort_by === 'name'
          ? 'im.name'
          : filter.sort_by === 'category'
            ? 'im.category'
            : filter.sort_by === 'quantity'
              ? 'pi.quantity'
              : 'pi.obtained_at';
      const sortOrder = filter.sort_order || 'asc';
      orderBy = `${sortColumn} ${sortOrder}`;
    }

    // 件数取得
    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM player_inventory pi
      JOIN item_master im ON pi.item_id = im.item_id
      WHERE ${whereConditions.join(' AND ')}
    `);
    const countResult = (await countStmt.bind(...params).first()) as { count: number };
    const totalCount = countResult.count;

    // ページング
    const limit = filter.limit || 20;
    const page = filter.page || 1;
    const offset = (page - 1) * limit;

    // データ取得
    const dataStmt = this.db.prepare(`
      SELECT 
        im.*,
        pi.quantity,
        pi.obtained_at
      FROM player_inventory pi
      JOIN item_master im ON pi.item_id = im.item_id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `);

    const dataResult = await dataStmt.bind(...params, limit, offset).all();
    const items = dataResult.results as unknown as インベントリアイテム[];

    // 所持金取得
    const playerMoney = await this.所持金取得(player_id);

    return {
      items,
      total_count: totalCount,
      current_page: page,
      total_pages: Math.ceil(totalCount / limit),
      player_money: playerMoney,
    };
  }

  /**
   * 特定アイテムの所持数を取得
   * 初学者向け：プレイヤーが特定のアイテムを何個持っているかを確認
   */
  async アイテム所持数取得(player_id: string, item_id: number): Promise<number> {
    const stmt = this.db.prepare(`
      SELECT quantity FROM player_inventory 
      WHERE player_id = ? AND item_id = ?
    `);

    const result = (await stmt.bind(player_id, item_id).first()) as { quantity: number } | null;
    return result?.quantity || 0;
  }

  /**
   * アイテムを追加する
   * 初学者向け：プレイヤーのインベントリにアイテムを追加する
   */
  async アイテム追加(
    player_id: string,
    item_id: number,
    quantity: number
  ): Promise<アイテム操作結果> {
    try {
      // アイテムマスターの存在確認
      const itemMaster = await this.アイテムマスター取得(item_id);
      if (!itemMaster) {
        return { success: false, error: '指定されたアイテムは存在しません' };
      }

      // 現在の所持数を確認
      const currentQuantity = await this.アイテム所持数取得(player_id, item_id);
      const newQuantity = currentQuantity + quantity;

      // スタック数制限チェック
      if (newQuantity > itemMaster.max_stack) {
        return {
          success: false,
          error: `最大所持数（${itemMaster.max_stack}個）を超えています`,
        };
      }

      // データ更新または挿入
      if (currentQuantity > 0) {
        // 既存レコードを更新
        const updateStmt = this.db.prepare(`
          UPDATE player_inventory 
          SET quantity = ?, updated_at = datetime('now')
          WHERE player_id = ? AND item_id = ?
        `);
        await updateStmt.bind(newQuantity, player_id, item_id).run();
      } else {
        // 新規レコードを挿入
        const insertStmt = this.db.prepare(`
          INSERT INTO player_inventory (player_id, item_id, quantity)
          VALUES (?, ?, ?)
        `);
        await insertStmt.bind(player_id, item_id, quantity).run();
      }

      return { success: true, new_quantity: newQuantity };
    } catch (error) {
      console.error('アイテム追加エラー:', error);
      return { success: false, error: 'アイテムの追加に失敗しました' };
    }
  }

  /**
   * アイテムを使用する
   * 初学者向け：プレイヤーのアイテムを使用して個数を減らす
   */
  async アイテム使用(
    player_id: string,
    item_id: number,
    quantity: number
  ): Promise<アイテム操作結果> {
    try {
      // 現在の所持数を確認
      const currentQuantity = await this.アイテム所持数取得(player_id, item_id);

      if (currentQuantity === 0) {
        return { success: false, error: '指定されたアイテムを所持していません' };
      }

      if (currentQuantity < quantity) {
        return { success: false, error: 'アイテムの所持数が不足しています' };
      }

      const remainingQuantity = currentQuantity - quantity;

      // 個数更新（0になった場合は自動削除トリガーが働く）
      const updateStmt = this.db.prepare(`
        UPDATE player_inventory 
        SET quantity = ?, updated_at = datetime('now')
        WHERE player_id = ? AND item_id = ?
      `);
      await updateStmt.bind(remainingQuantity, player_id, item_id).run();

      return { success: true, remaining_quantity: remainingQuantity };
    } catch (error) {
      console.error('アイテム使用エラー:', error);
      return { success: false, error: 'アイテムの使用に失敗しました' };
    }
  }

  /**
   * プレイヤーの所持金を取得
   * 初学者向け：プレイヤーの現在の所持金を確認する
   */
  async 所持金取得(player_id: string): Promise<number> {
    const stmt = this.db.prepare(`
      SELECT amount FROM player_money 
      WHERE player_id = ?
    `);

    const result = (await stmt.bind(player_id).first()) as { amount: number } | null;
    return result?.amount || 0;
  }

  /**
   * プレイヤーの所持金を更新
   * 初学者向け：アイテム購入・売却時の所持金変更
   */
  async 所持金更新(player_id: string, new_amount: number): Promise<所持金更新結果> {
    try {
      if (new_amount < 0) {
        return { success: false, error: '所持金は0以上である必要があります' };
      }

      // 所持金レコードの存在確認
      const currentAmount = await this.所持金取得(player_id);

      if (currentAmount === 0) {
        // 新規作成
        const insertStmt = this.db.prepare(`
          INSERT INTO player_money (player_id, amount)
          VALUES (?, ?)
        `);
        await insertStmt.bind(player_id, new_amount).run();
      } else {
        // 更新
        const updateStmt = this.db.prepare(`
          UPDATE player_money 
          SET amount = ?, updated_at = datetime('now')
          WHERE player_id = ?
        `);
        await updateStmt.bind(new_amount, player_id).run();
      }

      return { success: true, new_amount };
    } catch (error) {
      console.error('所持金更新エラー:', error);
      return { success: false, error: '所持金の更新に失敗しました' };
    }
  }

  /**
   * アイテムを購入する
   * 初学者向け：ショップでアイテムを購入する処理
   */
  async アイテム購入(player_id: string, item_id: number, quantity: number): Promise<取引操作結果> {
    try {
      // アイテムマスターの取得
      const itemMaster = await this.アイテムマスター取得(item_id);
      if (!itemMaster) {
        return { success: false, error: '指定されたアイテムは存在しません' };
      }

      if (itemMaster.buy_price === 0) {
        return { success: false, error: 'このアイテムは購入できません' };
      }

      // 購入金額計算
      const totalPrice = itemMaster.buy_price * quantity;

      // 所持金確認
      const currentMoney = await this.所持金取得(player_id);
      if (currentMoney < totalPrice) {
        return { success: false, error: '所持金が不足しています' };
      }

      // 現在のアイテム所持数確認
      const currentItemQuantity = await this.アイテム所持数取得(player_id, item_id);
      const newItemQuantity = currentItemQuantity + quantity;

      // スタック数制限チェック
      if (newItemQuantity > itemMaster.max_stack) {
        return {
          success: false,
          error: `最大所持数（${itemMaster.max_stack}個）を超えています`,
        };
      }

      // トランザクション実行
      const newMoneyAmount = currentMoney - totalPrice;

      const statements = [
        this.db
          .prepare(
            `
          UPDATE player_money 
          SET amount = ?, updated_at = datetime('now')
          WHERE player_id = ?
        `
          )
          .bind(newMoneyAmount, player_id),
      ];

      if (currentItemQuantity > 0) {
        // アイテム個数更新
        statements.push(
          this.db
            .prepare(
              `
            UPDATE player_inventory 
            SET quantity = ?, updated_at = datetime('now')
            WHERE player_id = ? AND item_id = ?
          `
            )
            .bind(newItemQuantity, player_id, item_id)
        );
      } else {
        // アイテム新規追加
        statements.push(
          this.db
            .prepare(
              `
            INSERT INTO player_inventory (player_id, item_id, quantity)
            VALUES (?, ?, ?)
          `
            )
            .bind(player_id, item_id, quantity)
        );
      }

      await this.db.batch(statements);

      return {
        success: true,
        transaction_amount: totalPrice,
        new_money_amount: newMoneyAmount,
        new_item_quantity: newItemQuantity,
      };
    } catch (error) {
      console.error('アイテム購入エラー:', error);
      return { success: false, error: 'アイテムの購入に失敗しました' };
    }
  }

  /**
   * アイテムを売却する
   * 初学者向け：所持アイテムを売却してお金に変える処理
   */
  async アイテム売却(player_id: string, item_id: number, quantity: number): Promise<取引操作結果> {
    try {
      // アイテムマスターの取得
      const itemMaster = await this.アイテムマスター取得(item_id);
      if (!itemMaster) {
        return { success: false, error: '指定されたアイテムは存在しません' };
      }

      if (itemMaster.sell_price === 0) {
        return { success: false, error: 'このアイテムは売却できません' };
      }

      // 現在のアイテム所持数確認
      const currentItemQuantity = await this.アイテム所持数取得(player_id, item_id);

      if (currentItemQuantity === 0) {
        return { success: false, error: '指定されたアイテムを所持していません' };
      }

      if (currentItemQuantity < quantity) {
        return { success: false, error: '売却しようとする個数が所持数を超えています' };
      }

      // 売却金額計算
      const totalPrice = itemMaster.sell_price * quantity;

      // 所持金更新
      const currentMoney = await this.所持金取得(player_id);
      const newMoneyAmount = currentMoney + totalPrice;
      const newItemQuantity = currentItemQuantity - quantity;

      // トランザクション実行
      const statements = [
        this.db
          .prepare(
            `
          UPDATE player_money 
          SET amount = ?, updated_at = datetime('now')
          WHERE player_id = ?
        `
          )
          .bind(newMoneyAmount, player_id),

        this.db
          .prepare(
            `
          UPDATE player_inventory 
          SET quantity = ?, updated_at = datetime('now')
          WHERE player_id = ? AND item_id = ?
        `
          )
          .bind(newItemQuantity, player_id, item_id),
      ];

      await this.db.batch(statements);

      return {
        success: true,
        transaction_amount: totalPrice,
        new_money_amount: newMoneyAmount,
        new_item_quantity: newItemQuantity,
      };
    } catch (error) {
      console.error('アイテム売却エラー:', error);
      return { success: false, error: 'アイテムの売却に失敗しました' };
    }
  }
}
