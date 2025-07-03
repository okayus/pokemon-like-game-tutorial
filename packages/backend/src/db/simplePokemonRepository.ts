// 初学者向け：シンプルなポケモンデータベース操作リポジトリ
// 最低限動作するポケモンライクゲームのための簡素化されたリポジトリ

import type { Database } from '../types/env';
import type { 
  ポケモンマスタ, 
  所有ポケモン, 
  パーティポケモン,
  ポケモン捕獲リクエスト,
  パーティ編成リクエスト,
  ポケモン更新リクエスト,
  計算ステータス,
  ポケモン検索フィルター
} from '../types/pokemon';

/**
 * シンプルなポケモン管理システムのリポジトリクラス
 * 初学者向け：データベースとアプリケーションの橋渡し役（簡素版）
 */
export class シンプルポケモンリポジトリ {
  constructor(private db?: Database) {}

  /**
   * 全てのポケモンマスタデータを取得
   * 初学者向け：ポケモン図鑑のようなデータを取得します
   */
  async 全マスタデータ取得(): Promise<ポケモンマスタ[]> {
    const マスタデータ結果 = await this.db?.prepare(`
      SELECT 
        species_id,
        name,
        hp,
        attack,
        defense,
        sprite_url,
        created_at
      FROM pokemon_master
      ORDER BY species_id
    `).all();

    return (マスタデータ結果?.results as unknown as ポケモンマスタ[]) || [];
  }

  /**
   * 特定のマスタデータを取得
   * 初学者向け：ピカチュウなど、特定の種族の詳細情報を取得
   */
  async マスタデータ取得(species_id: number): Promise<ポケモンマスタ | null> {
    const マスタデータ結果 = await this.db?.prepare(`
      SELECT 
        species_id,
        name,
        hp,
        attack,
        defense,
        sprite_url,
        created_at
      FROM pokemon_master
      WHERE species_id = ?
    `).bind(species_id).first();

    return (マスタデータ結果 as unknown as ポケモンマスタ) || null;
  }

  /**
   * ポケモンを捕獲して新しい個体を作成
   * 初学者向け：野生のポケモンを捕まえて自分のポケモンにする処理
   */
  async ポケモン捕獲(player_id: string, 捕獲リクエスト: ポケモン捕獲リクエスト): Promise<所有ポケモン> {
    // マスタデータの存在確認
    const マスタデータ = await this.マスタデータ取得(捕獲リクエスト.species_id);
    if (!マスタデータ) {
      throw new Error('指定された種族が見つかりません');
    }

    // ユニークなポケモンIDを生成
    const pokemon_id = `${player_id}_pokemon_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // レベルに応じたステータス計算
    const 計算されたステータス = this.ステータス計算(マスタデータ, 捕獲リクエスト.level);

    // ポケモンをデータベースに挿入
    await this.db?.prepare(`
      INSERT INTO owned_pokemon (
        pokemon_id, player_id, species_id, nickname, level, current_hp, caught_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      pokemon_id,
      player_id,
      捕獲リクエスト.species_id,
      捕獲リクエスト.nickname || null,
      捕獲リクエスト.level,
      計算されたステータス.max_hp // 現在HPは最大HPと同じでスタート
    ).run();

    // 作成されたポケモンの詳細を取得して返す
    const 作成されたポケモン = await this.ポケモン詳細取得(pokemon_id);
    if (!作成されたポケモン) {
      throw new Error('ポケモンの作成に失敗しました');
    }

    return 作成されたポケモン;
  }

  /**
   * プレイヤーの所有ポケモン一覧を取得
   * 初学者向け：そのプレイヤーが持っているすべてのポケモンを表示
   */
  async 所有ポケモン一覧取得(player_id: string, フィルター?: ポケモン検索フィルター): Promise<所有ポケモン[]> {
    let クエリ = `
      SELECT 
        op.pokemon_id,
        op.player_id,
        op.species_id,
        op.nickname,
        op.level,
        op.current_hp,
        op.caught_at,
        op.updated_at,
        pm.name as species_name,
        pm.hp as base_hp,
        pm.attack as base_attack,
        pm.defense as base_defense,
        pm.sprite_url,
        pm.created_at as species_created_at
      FROM owned_pokemon op
      JOIN pokemon_master pm ON op.species_id = pm.species_id
      WHERE op.player_id = ?
    `;

    const バインドパラメータ: unknown[] = [player_id];

    // フィルター条件の追加
    if (フィルター?.species_name) {
      クエリ += ' AND pm.name LIKE ?';
      バインドパラメータ.push(`%${フィルター.species_name}%`);
    }

    if (フィルター?.level_min) {
      クエリ += ' AND op.level >= ?';
      バインドパラメータ.push(フィルター.level_min);
    }

    if (フィルター?.level_max) {
      クエリ += ' AND op.level <= ?';
      バインドパラメータ.push(フィルター.level_max);
    }

    クエリ += ' ORDER BY op.caught_at DESC';

    // ページネーション
    if (フィルター?.limit) {
      const offset = ((フィルター.page || 1) - 1) * フィルター.limit;
      クエリ += ' LIMIT ? OFFSET ?';
      バインドパラメータ.push(フィルター.limit, offset);
    }

    const 結果 = await this.db?.prepare(クエリ).bind(...バインドパラメータ).all();
    const ポケモンリスト = 結果?.results || [];

    // 各ポケモンの詳細データを構築
    const 詳細ポケモンリスト: 所有ポケモン[] = [];
    
    for (const ポケモンデータ of ポケモンリスト as Array<{
      pokemon_id: string;
      player_id: string;
      species_id: number;
      nickname?: string;
      level: number;
      current_hp: number;
      caught_at: string;
      updated_at: string;
      species_name: string;
      base_hp: number;
      base_attack: number;
      base_defense: number;
      sprite_url: string;
      species_created_at: string;
    }>) {
      // マスタデータを構築
      const マスタデータ: ポケモンマスタ = {
        species_id: ポケモンデータ.species_id,
        name: ポケモンデータ.species_name,
        hp: ポケモンデータ.base_hp,
        attack: ポケモンデータ.base_attack,
        defense: ポケモンデータ.base_defense,
        sprite_url: ポケモンデータ.sprite_url,
        created_at: ポケモンデータ.species_created_at
      };

      // 計算されたステータス
      const 計算されたステータス = this.ステータス計算(マスタデータ, ポケモンデータ.level);

      // 所有ポケモンオブジェクトを構築
      const 所有ポケモン: 所有ポケモン = {
        pokemon_id: ポケモンデータ.pokemon_id,
        player_id: ポケモンデータ.player_id,
        species_id: ポケモンデータ.species_id,
        nickname: ポケモンデータ.nickname,
        level: ポケモンデータ.level,
        current_hp: ポケモンデータ.current_hp,
        caught_at: ポケモンデータ.caught_at,
        updated_at: ポケモンデータ.updated_at,
        species: マスタデータ,
        stats: 計算されたステータス
      };

      詳細ポケモンリスト.push(所有ポケモン);
    }

    return 詳細ポケモンリスト;
  }

  /**
   * 特定ポケモンの詳細情報を取得
   * 初学者向け：一匹のポケモンのすべての情報を取得
   */
  async ポケモン詳細取得(pokemon_id: string): Promise<所有ポケモン | null> {
    const ポケモンデータ = await this.db?.prepare(`
      SELECT 
        op.pokemon_id,
        op.player_id,
        op.species_id,
        op.nickname,
        op.level,
        op.current_hp,
        op.caught_at,
        op.updated_at,
        pm.name as species_name,
        pm.hp as base_hp,
        pm.attack as base_attack,
        pm.defense as base_defense,
        pm.sprite_url,
        pm.created_at as species_created_at
      FROM owned_pokemon op
      JOIN pokemon_master pm ON op.species_id = pm.species_id
      WHERE op.pokemon_id = ?
    `).bind(pokemon_id).first();

    if (!ポケモンデータ) {
      return null;
    }

    const ポケモンData = ポケモンデータ as {
      pokemon_id: string;
      player_id: string;
      species_id: number;
      nickname?: string;
      level: number;
      current_hp: number;
      caught_at: string;
      updated_at: string;
      species_name: string;
      base_hp: number;
      base_attack: number;
      base_defense: number;
      sprite_url: string;
      species_created_at: string;
    };

    // マスタデータを構築
    const マスタデータ: ポケモンマスタ = {
      species_id: ポケモンData.species_id,
      name: ポケモンData.species_name,
      hp: ポケモンData.base_hp,
      attack: ポケモンData.base_attack,
      defense: ポケモンData.base_defense,
      sprite_url: ポケモンData.sprite_url,
      created_at: ポケモンData.species_created_at
    };

    // 計算されたステータス
    const 計算されたステータス = this.ステータス計算(マスタデータ, ポケモンData.level);

    return {
      pokemon_id: ポケモンData.pokemon_id,
      player_id: ポケモンData.player_id,
      species_id: ポケモンData.species_id,
      nickname: ポケモンData.nickname,
      level: ポケモンData.level,
      current_hp: ポケモンData.current_hp,
      caught_at: ポケモンData.caught_at,
      updated_at: ポケモンData.updated_at,
      species: マスタデータ,
      stats: 計算されたステータス
    };
  }

  /**
   * ポケモンの情報を更新
   * 初学者向け：ニックネームや現在HPなどを変更
   */
  async ポケモン更新(pokemon_id: string, 更新リクエスト: ポケモン更新リクエスト): Promise<void> {
    const 更新フィールド: string[] = [];
    const バインドパラメータ: unknown[] = [];

    if (更新リクエスト.nickname !== undefined) {
      更新フィールド.push('nickname = ?');
      バインドパラメータ.push(更新リクエスト.nickname);
    }

    if (更新リクエスト.current_hp !== undefined) {
      更新フィールド.push('current_hp = ?');
      バインドパラメータ.push(更新リクエスト.current_hp);
    }

    if (更新フィールド.length === 0) {
      return; // 更新する項目がない場合は何もしない
    }

    更新フィールド.push('updated_at = datetime("now")');
    バインドパラメータ.push(pokemon_id);

    const クエリ = `
      UPDATE owned_pokemon 
      SET ${更新フィールド.join(', ')}
      WHERE pokemon_id = ?
    `;

    await this.db?.prepare(クエリ).bind(...バインドパラメータ).run();
  }

  /**
   * プレイヤーのパーティを取得
   * 初学者向け：手持ちポケモン（最大6体）を取得
   */
  async パーティ取得(player_id: string): Promise<パーティポケモン[]> {
    const パーティ結果 = await this.db?.prepare(`
      SELECT 
        pp.player_id,
        pp.position,
        pp.pokemon_id,
        pp.updated_at
      FROM party_pokemon pp
      WHERE pp.player_id = ?
      ORDER BY pp.position
    `).bind(player_id).all();

    const パーティデータ = パーティ結果?.results || [];
    const パーティ: パーティポケモン[] = [];

    for (const パーティメンバー of パーティデータ as Array<{
      player_id: string;
      position: number;
      pokemon_id: string;
      updated_at: string;
    }>) {
      const ポケモン詳細 = await this.ポケモン詳細取得(パーティメンバー.pokemon_id);
      if (ポケモン詳細) {
        パーティ.push({
          player_id: パーティメンバー.player_id,
          position: パーティメンバー.position,
          pokemon_id: パーティメンバー.pokemon_id,
          pokemon: ポケモン詳細,
          updated_at: パーティメンバー.updated_at
        });
      }
    }

    return パーティ;
  }

  /**
   * パーティの編成を更新
   * 初学者向け：パーティにポケモンを追加・削除・並び替え
   */
  async パーティ編成(player_id: string, 編成リクエスト: パーティ編成リクエスト): Promise<void> {
    if (編成リクエスト.pokemon_id) {
      // ポケモンを指定位置に配置
      const ポケモン存在確認 = await this.ポケモン詳細取得(編成リクエスト.pokemon_id);
      if (!ポケモン存在確認 || ポケモン存在確認.player_id !== player_id) {
        throw new Error('指定されたポケモンが見つからないか、権限がありません');
      }

      // 既存のパーティメンバーを置き換え
      await this.db?.prepare(`
        INSERT OR REPLACE INTO party_pokemon (player_id, position, pokemon_id, updated_at)
        VALUES (?, ?, ?, datetime('now'))
      `).bind(player_id, 編成リクエスト.position, 編成リクエスト.pokemon_id).run();
    } else {
      // 指定位置からポケモンを削除
      await this.db?.prepare(`
        DELETE FROM party_pokemon 
        WHERE player_id = ? AND position = ?
      `).bind(player_id, 編成リクエスト.position).run();
    }
  }

  // === プライベートヘルパーメソッド ===

  /**
   * ステータス計算
   * 初学者向け：基本ステータスとレベルから実際のステータスを計算
   */
  private ステータス計算(マスタデータ: ポケモンマスタ, level: number): 計算ステータス {
    // 簡略化されたステータス計算式
    // 実際のポケモンよりもずっと単純な計算
    const max_hp = Math.floor(マスタデータ.hp * level / 10 + マスタデータ.hp);
    const attack = Math.floor(マスタデータ.attack * level / 20 + マスタデータ.attack);
    const defense = Math.floor(マスタデータ.defense * level / 20 + マスタデータ.defense);

    return { max_hp, attack, defense };
  }
}