// 初学者向け：ポケモンデータベース操作リポジトリ
// このファイルでポケモン関連のすべてのデータベース操作を管理します

import type { Database } from '../types/env';
import type { 
  ポケモン種族データ, 
  技データ, 
  所有ポケモン, 
  ポケモンボックス, 
  パーティポケモン,
  ポケモン捕獲リクエスト,
  パーティ編成リクエスト,
  個体値,
  実際ステータス,
  ポケモン所持技,
  種族習得技,
  ポケモン性格
} from '@共通/types/pokemon';

/**
 * ポケモン管理システムのリポジトリクラス
 * 初学者向け：データベースとアプリケーションの橋渡し役
 */
export class ポケモンリポジトリ {
  constructor(private db?: Database) {}

  /**
   * 全てのポケモン種族データを取得
   * 初学者向け：ポケモン図鑑のようなデータを取得します
   */
  async 全種族データ取得(): Promise<ポケモン種族データ[]> {
    const 種族データ結果 = await this.db?.prepare(`
      SELECT 
        species_id,
        name,
        name_en,
        type1,
        type2,
        base_hp,
        base_attack,
        base_defense,
        base_sp_attack,
        base_sp_defense,
        base_speed,
        sprite_url,
        description,
        created_at
      FROM pokemon_species
      ORDER BY species_id
    `).all();

    return 種族データ結果?.results as ポケモン種族データ[] || [];
  }

  /**
   * 特定の種族データを取得
   * 初学者向け：ピカチュウなど、特定の種族の詳細情報を取得
   */
  async 種族データ取得(species_id: number): Promise<ポケモン種族データ | null> {
    const 種族データ結果 = await this.db?.prepare(`
      SELECT 
        species_id,
        name,
        name_en,
        type1,
        type2,
        base_hp,
        base_attack,
        base_defense,
        base_sp_attack,
        base_sp_defense,
        base_speed,
        sprite_url,
        description,
        created_at
      FROM pokemon_species
      WHERE species_id = ?
    `).bind(species_id).first();

    return 種族データ結果 as ポケモン種族データ || null;
  }

  /**
   * ポケモンを捕獲して新しい個体を作成
   * 初学者向け：野生のポケモンを捕まえて自分のポケモンにする処理
   */
  async ポケモン捕獲(player_id: string, 捕獲リクエスト: ポケモン捕獲リクエスト): Promise<所有ポケモン> {
    // 種族データの存在確認
    const 種族データ = await this.種族データ取得(捕獲リクエスト.species_id);
    if (!種族データ) {
      throw new Error('指定された種族が見つかりません');
    }

    // 個体値をランダム生成（指定がない場合）
    const 個体値: 個体値 = {
      iv_hp: 捕獲リクエスト.individual_values?.iv_hp ?? Math.floor(Math.random() * 32),
      iv_attack: 捕獲リクエスト.individual_values?.iv_attack ?? Math.floor(Math.random() * 32),
      iv_defense: 捕獲リクエスト.individual_values?.iv_defense ?? Math.floor(Math.random() * 32),
      iv_sp_attack: 捕獲リクエスト.individual_values?.iv_sp_attack ?? Math.floor(Math.random() * 32),
      iv_sp_defense: 捕獲リクエスト.individual_values?.iv_sp_defense ?? Math.floor(Math.random() * 32),
      iv_speed: 捕獲リクエスト.individual_values?.iv_speed ?? Math.floor(Math.random() * 32),
    };

    // 性格をランダム決定（指定がない場合）
    const 性格リスト: ポケモン性格[] = [
      'がんばりや', 'さみしがり', 'ゆうかん', 'いじっぱり', 'やんちゃ',
      'ずぶとい', 'すなお', 'のんき', 'わんぱく', 'のうてんき',
      'おくびょう', 'せっかち', 'まじめ', 'ようき', 'むじゃき',
      'ひかえめ', 'おっとり', 'れいせい', 'てれや', 'うっかりや',
      'おだやか', 'おとなしい', 'しんちょう', 'きまぐれ', 'れんそ'
    ];
    const 性格 = 捕獲リクエスト.nature ?? 性格リスト[Math.floor(Math.random() * 性格リスト.length)];

    // 実際のステータス計算
    const 実際ステータス = this.ステータス計算(種族データ, 捕獲リクエスト.level, 個体値, 性格);

    // ユニークなポケモンIDを生成
    const pokemon_id = `${player_id}_pokemon_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // プレイヤーの最初のボックスを取得
    const プレイヤーボックス = await this.ボックス一覧取得(player_id);
    const 最初のボックス = プレイヤーボックス[0];

    if (!最初のボックス) {
      throw new Error('プレイヤーのボックスが見つかりません');
    }

    // ボックス内の空き位置を検索
    const ボックス内ポケモン = await this.ボックス内ポケモン取得(最初のボックス.box_id);
    const 空き位置 = this.空き位置検索(ボックス内ポケモン, 30); // ボックス容量30

    // ポケモンをデータベースに挿入
    await this.db?.prepare(`
      INSERT INTO owned_pokemon (
        pokemon_id, player_id, species_id, nickname, level, experience,
        iv_hp, iv_attack, iv_defense, iv_sp_attack, iv_sp_defense, iv_speed,
        nature, current_hp, box_id, box_position, caught_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      pokemon_id,
      player_id,
      捕獲リクエスト.species_id,
      捕獲リクエスト.nickname || null,
      捕獲リクエスト.level,
      this.レベルから経験値計算(捕獲リクエスト.level),
      個体値.iv_hp,
      個体値.iv_attack,
      個体値.iv_defense,
      個体値.iv_sp_attack,
      個体値.iv_sp_defense,
      個体値.iv_speed,
      性格,
      実際ステータス.hp, // 現在HPは最大HPと同じ
      最初のボックス.box_id,
      空き位置,
    ).run();

    // レベル1で覚えている技を自動で設定
    await this.初期技設定(pokemon_id, 捕獲リクエスト.species_id, 捕獲リクエスト.level);

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
  async 所有ポケモン一覧取得(player_id: string, フィルター?: {
    box_id?: string;
    species_name?: string;
    page?: number;
    limit?: number;
  }): Promise<所有ポケモン[]> {
    let クエリ = `
      SELECT 
        op.pokemon_id,
        op.player_id,
        op.species_id,
        op.nickname,
        op.level,
        op.experience,
        op.iv_hp,
        op.iv_attack,
        op.iv_defense,
        op.iv_sp_attack,
        op.iv_sp_defense,
        op.iv_speed,
        op.nature,
        op.current_hp,
        op.box_id,
        op.box_position,
        op.caught_at,
        op.updated_at,
        ps.name as species_name,
        ps.name_en,
        ps.type1,
        ps.type2,
        ps.base_hp,
        ps.base_attack,
        ps.base_defense,
        ps.base_sp_attack,
        ps.base_sp_defense,
        ps.base_speed,
        ps.sprite_url,
        ps.description
      FROM owned_pokemon op
      JOIN pokemon_species ps ON op.species_id = ps.species_id
      WHERE op.player_id = ?
    `;

    const バインドパラメータ: any[] = [player_id];

    // フィルター条件の追加
    if (フィルター?.box_id) {
      クエリ += ' AND op.box_id = ?';
      バインドパラメータ.push(フィルター.box_id);
    }

    if (フィルター?.species_name) {
      クエリ += ' AND ps.name LIKE ?';
      バインドパラメータ.push(`%${フィルター.species_name}%`);
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
    
    for (const ポケモンデータ of ポケモンリスト as any[]) {
      // 種族データを構築
      const 種族データ: ポケモン種族データ = {
        species_id: ポケモンデータ.species_id,
        name: ポケモンデータ.species_name,
        name_en: ポケモンデータ.name_en,
        type1: ポケモンデータ.type1,
        type2: ポケモンデータ.type2,
        base_hp: ポケモンデータ.base_hp,
        base_attack: ポケモンデータ.base_attack,
        base_defense: ポケモンデータ.base_defense,
        base_sp_attack: ポケモンデータ.base_sp_attack,
        base_sp_defense: ポケモンデータ.base_sp_defense,
        base_speed: ポケモンデータ.base_speed,
        sprite_url: ポケモンデータ.sprite_url,
        description: ポケモンデータ.description,
        created_at: ポケモンデータ.created_at
      };

      // 個体値を構築
      const 個体値: 個体値 = {
        iv_hp: ポケモンデータ.iv_hp,
        iv_attack: ポケモンデータ.iv_attack,
        iv_defense: ポケモンデータ.iv_defense,
        iv_sp_attack: ポケモンデータ.iv_sp_attack,
        iv_sp_defense: ポケモンデータ.iv_sp_defense,
        iv_speed: ポケモンデータ.iv_speed,
      };

      // 実際のステータスを計算
      const 実際ステータス = this.ステータス計算(種族データ, ポケモンデータ.level, 個体値, ポケモンデータ.nature);

      // 覚えている技を取得
      const 覚えている技 = await this.ポケモン所持技取得(ポケモンデータ.pokemon_id);

      // 所有ポケモンオブジェクトを構築
      const 所有ポケモン: 所有ポケモン = {
        pokemon_id: ポケモンデータ.pokemon_id,
        player_id: ポケモンデータ.player_id,
        species_id: ポケモンデータ.species_id,
        nickname: ポケモンデータ.nickname,
        level: ポケモンデータ.level,
        experience: ポケモンデータ.experience,
        individual_values: 個体値,
        nature: ポケモンデータ.nature,
        current_hp: ポケモンデータ.current_hp,
        box_id: ポケモンデータ.box_id,
        box_position: ポケモンデータ.box_position,
        caught_at: ポケモンデータ.caught_at,
        updated_at: ポケモンデータ.updated_at,
        species: 種族データ,
        moves: 覚えている技,
        stats: 実際ステータス
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
    const ポケモンリスト = await this.所有ポケモン一覧取得('', { limit: 1 });
    
    // pokemon_idで特定のポケモンを検索
    const ポケモンデータ = await this.db?.prepare(`
      SELECT 
        op.pokemon_id,
        op.player_id,
        op.species_id,
        op.nickname,
        op.level,
        op.experience,
        op.iv_hp,
        op.iv_attack,
        op.iv_defense,
        op.iv_sp_attack,
        op.iv_sp_defense,
        op.iv_speed,
        op.nature,
        op.current_hp,
        op.box_id,
        op.box_position,
        op.caught_at,
        op.updated_at
      FROM owned_pokemon op
      WHERE op.pokemon_id = ?
    `).bind(pokemon_id).first();

    if (!ポケモンデータ) {
      return null;
    }

    // 種族データを取得
    const 種族データ = await this.種族データ取得((ポケモンデータ as any).species_id);
    if (!種族データ) {
      throw new Error('種族データが見つかりません');
    }

    // 個体値を構築
    const ポケモンData = ポケモンデータ as any;
    const 個体値: 個体値 = {
      iv_hp: ポケモンData.iv_hp,
      iv_attack: ポケモンData.iv_attack,
      iv_defense: ポケモンData.iv_defense,
      iv_sp_attack: ポケモンData.iv_sp_attack,
      iv_sp_defense: ポケモンData.iv_sp_defense,
      iv_speed: ポケモンData.iv_speed,
    };

    // 実際のステータスを計算
    const 実際ステータス = this.ステータス計算(種族データ, ポケモンData.level, 個体値, ポケモンData.nature);

    // 覚えている技を取得
    const 覚えている技 = await this.ポケモン所持技取得(pokemon_id);

    return {
      pokemon_id: ポケモンData.pokemon_id,
      player_id: ポケモンData.player_id,
      species_id: ポケモンData.species_id,
      nickname: ポケモンData.nickname,
      level: ポケモンData.level,
      experience: ポケモンData.experience,
      individual_values: 個体値,
      nature: ポケモンData.nature,
      current_hp: ポケモンData.current_hp,
      box_id: ポケモンData.box_id,
      box_position: ポケモンData.box_position,
      caught_at: ポケモンData.caught_at,
      updated_at: ポケモンData.updated_at,
      species: 種族データ,
      moves: 覚えている技,
      stats: 実際ステータス
    };
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

    for (const パーティメンバー of パーティデータ as any[]) {
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

      // ポケモンをパーティに移動（ボックスから削除）
      await this.db?.prepare(`
        UPDATE owned_pokemon 
        SET box_id = NULL, box_position = NULL, updated_at = datetime('now')
        WHERE pokemon_id = ?
      `).bind(編成リクエスト.pokemon_id).run();
    } else {
      // 指定位置からポケモンを削除
      const 削除対象 = await this.db?.prepare(`
        SELECT pokemon_id FROM party_pokemon 
        WHERE player_id = ? AND position = ?
      `).bind(player_id, 編成リクエスト.position).first();

      if (削除対象) {
        // パーティから削除
        await this.db?.prepare(`
          DELETE FROM party_pokemon 
          WHERE player_id = ? AND position = ?
        `).bind(player_id, 編成リクエスト.position).run();

        // ポケモンを最初のボックスに移動
        const ボックス一覧 = await this.ボックス一覧取得(player_id);
        const 最初のボックス = ボックス一覧[0];
        
        if (最初のボックス) {
          const ボックス内ポケモン = await this.ボックス内ポケモン取得(最初のボックス.box_id);
          const 空き位置 = this.空き位置検索(ボックス内ポケモン, 30);

          await this.db?.prepare(`
            UPDATE owned_pokemon 
            SET box_id = ?, box_position = ?, updated_at = datetime('now')
            WHERE pokemon_id = ?
          `).bind(最初のボックス.box_id, 空き位置, (削除対象 as any).pokemon_id).run();
        }
      }
    }
  }

  /**
   * プレイヤーのボックス一覧を取得
   * 初学者向け：ポケモンを保管する場所の一覧を取得
   */
  async ボックス一覧取得(player_id: string): Promise<ポケモンボックス[]> {
    const ボックス結果 = await this.db?.prepare(`
      SELECT 
        box_id,
        player_id,
        name,
        box_number,
        capacity,
        created_at
      FROM pokemon_boxes
      WHERE player_id = ?
      ORDER BY box_number
    `).bind(player_id).all();

    return ボックス結果?.results as ポケモンボックス[] || [];
  }

  /**
   * 特定ボックス内のポケモンを取得
   * 初学者向け：ボックスに入っているポケモンの一覧を取得
   */
  async ボックス内ポケモン取得(box_id: string): Promise<所有ポケモン[]> {
    const ボックス内結果 = await this.db?.prepare(`
      SELECT pokemon_id FROM owned_pokemon
      WHERE box_id = ?
      ORDER BY box_position
    `).bind(box_id).all();

    const ポケモンIDリスト = ボックス内結果?.results as any[] || [];
    const ボックス内ポケモン: 所有ポケモン[] = [];

    for (const ポケモンID of ポケモンIDリスト) {
      const ポケモン詳細 = await this.ポケモン詳細取得(ポケモンID.pokemon_id);
      if (ポケモン詳細) {
        ボックス内ポケモン.push(ポケモン詳細);
      }
    }

    return ボックス内ポケモン;
  }

  /**
   * 経験値を獲得してレベルアップ処理
   * 初学者向け：バトル後の経験値獲得とレベルアップ
   */
  async 経験値獲得(pokemon_id: string, gained_experience: number): Promise<所有ポケモン> {
    const ポケモン = await this.ポケモン詳細取得(pokemon_id);
    if (!ポケモン) {
      throw new Error('ポケモンが見つかりません');
    }

    const 新しい経験値 = ポケモン.experience + gained_experience;
    const 新しいレベル = this.経験値からレベル計算(新しい経験値);

    // ポケモンの経験値とレベルを更新
    await this.db?.prepare(`
      UPDATE owned_pokemon 
      SET experience = ?, level = ?, updated_at = datetime('now')
      WHERE pokemon_id = ?
    `).bind(新しい経験値, 新しいレベル, pokemon_id).run();

    // レベルアップした場合、新しい技を習得する可能性がある
    if (新しいレベル > ポケモン.level) {
      await this.レベルアップ時技習得確認(pokemon_id, ポケモン.species_id, ポケモン.level, 新しいレベル);
    }

    // 新しいステータスでポケモンを再取得
    const 更新されたポケモン = await this.ポケモン詳細取得(pokemon_id);
    if (!更新されたポケモン) {
      throw new Error('ポケモンの更新に失敗しました');
    }

    return 更新されたポケモン;
  }

  /**
   * 習得可能技を取得
   * 初学者向け：そのレベルで覚えられる技の一覧を取得
   */
  async 習得可能技取得(species_id: number, level: number): Promise<種族習得技[]> {
    const 習得可能技結果 = await this.db?.prepare(`
      SELECT 
        sm.species_id,
        sm.move_id,
        sm.learn_level,
        sm.learn_method,
        m.name,
        m.name_en,
        m.type,
        m.category,
        m.power,
        m.accuracy,
        m.pp,
        m.description
      FROM species_moves sm
      JOIN moves m ON sm.move_id = m.move_id
      WHERE sm.species_id = ? AND sm.learn_level <= ? AND sm.learn_method = 'レベルアップ'
      ORDER BY sm.learn_level
    `).bind(species_id, level).all();

    const 習得可能技リスト = 習得可能技結果?.results as any[] || [];
    
    return 習得可能技リスト.map(技 => ({
      species_id: 技.species_id,
      move_id: 技.move_id,
      learn_level: 技.learn_level,
      learn_method: 技.learn_method
    }));
  }

  /**
   * ポケモンに技を覚えさせる
   * 初学者向け：新しい技を覚える処理
   */
  async 技習得(pokemon_id: string, move_id: number, slot: number): Promise<void> {
    // 技データの存在確認
    const 技データ = await this.db?.prepare(`
      SELECT * FROM moves WHERE move_id = ?
    `).bind(move_id).first();

    if (!技データ) {
      throw new Error('指定された技が見つかりません');
    }

    // 既存の技を削除（同じスロットがある場合）
    await this.db?.prepare(`
      DELETE FROM pokemon_moves 
      WHERE pokemon_id = ? AND slot = ?
    `).bind(pokemon_id, slot).run();

    // 新しい技を追加
    await this.db?.prepare(`
      INSERT INTO pokemon_moves (pokemon_id, move_id, slot, current_pp, learned_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).bind(pokemon_id, move_id, slot, (技データ as any).pp).run();
  }

  // === プライベートヘルパーメソッド ===

  /**
   * ステータス計算
   * 初学者向け：種族値、個体値、レベルから実際のステータスを計算
   */
  private ステータス計算(種族データ: ポケモン種族データ, level: number, 個体値: 個体値, nature: ポケモン性格): 実際ステータス {
    // 簡略化されたステータス計算式（実際のポケモンとは異なります）
    const hp = Math.floor((2 * 種族データ.base_hp + 個体値.iv_hp) * level / 100 + level + 10);
    const attack = Math.floor((2 * 種族データ.base_attack + 個体値.iv_attack) * level / 100 + 5);
    const defense = Math.floor((2 * 種族データ.base_defense + 個体値.iv_defense) * level / 100 + 5);
    const sp_attack = Math.floor((2 * 種族データ.base_sp_attack + 個体値.iv_sp_attack) * level / 100 + 5);
    const sp_defense = Math.floor((2 * 種族データ.base_sp_defense + 個体値.iv_sp_defense) * level / 100 + 5);
    const speed = Math.floor((2 * 種族データ.base_speed + 個体値.iv_speed) * level / 100 + 5);

    // 性格による補正は簡略化（実装時に詳細化）
    return { hp, attack, defense, sp_attack, sp_defense, speed };
  }

  /**
   * レベルから経験値を計算
   * 初学者向け：そのレベルに必要な経験値を計算
   */
  private レベルから経験値計算(level: number): number {
    // 簡略化された経験値計算（中程度成長）
    return Math.floor(level ** 3);
  }

  /**
   * 経験値からレベルを計算
   * 初学者向け：現在の経験値から到達レベルを計算
   */
  private 経験値からレベル計算(experience: number): number {
    let level = 1;
    while (level < 100 && this.レベルから経験値計算(level + 1) <= experience) {
      level++;
    }
    return level;
  }

  /**
   * 空き位置を検索
   * 初学者向け：ボックス内の空いている位置を見つける
   */
  private 空き位置検索(ボックス内ポケモン: 所有ポケモン[], 容量: number): number {
    const 使用済み位置 = ボックス内ポケモン
      .map(pokemon => pokemon.box_position)
      .filter(position => position !== null && position !== undefined) as number[];

    for (let 位置 = 1; 位置 <= 容量; 位置++) {
      if (!使用済み位置.includes(位置)) {
        return 位置;
      }
    }
    
    throw new Error('ボックスが満杯です');
  }

  /**
   * ポケモンの所持技を取得
   * 初学者向け：そのポケモンが覚えている技の詳細を取得
   */
  private async ポケモン所持技取得(pokemon_id: string): Promise<ポケモン所持技[]> {
    const 所持技結果 = await this.db?.prepare(`
      SELECT 
        pm.pokemon_id,
        pm.move_id,
        pm.slot,
        pm.current_pp,
        pm.learned_at,
        m.name,
        m.name_en,
        m.type,
        m.category,
        m.power,
        m.accuracy,
        m.pp,
        m.description,
        m.created_at
      FROM pokemon_moves pm
      JOIN moves m ON pm.move_id = m.move_id
      WHERE pm.pokemon_id = ?
      ORDER BY pm.slot
    `).bind(pokemon_id).all();

    const 所持技リスト = 所持技結果?.results as any[] || [];
    
    return 所持技リスト.map(技 => ({
      pokemon_id: 技.pokemon_id,
      move_id: 技.move_id,
      slot: 技.slot,
      current_pp: 技.current_pp,
      move: {
        move_id: 技.move_id,
        name: 技.name,
        name_en: 技.name_en,
        type: 技.type,
        category: 技.category,
        power: 技.power,
        accuracy: 技.accuracy,
        pp: 技.pp,
        description: 技.description,
        created_at: 技.created_at
      },
      learned_at: 技.learned_at
    }));
  }

  /**
   * 初期技設定
   * 初学者向け：捕獲時にレベル1で覚えている技を自動設定
   */
  private async 初期技設定(pokemon_id: string, species_id: number, level: number): Promise<void> {
    const 習得可能技 = await this.習得可能技取得(species_id, level);
    
    // レベル1で覚える技を優先的に設定（最大4技）
    const レベル1技 = 習得可能技
      .filter(技 => 技.learn_level === 1)
      .slice(0, 4);

    // レベル1技が4技未満の場合、レベルアップで覚える技も追加
    if (レベル1技.length < 4) {
      const その他技 = 習得可能技
        .filter(技 => 技.learn_level > 1)
        .slice(0, 4 - レベル1技.length);
      レベル1技.push(...その他技);
    }

    // 技を設定
    for (let i = 0; i < レベル1技.length; i++) {
      const 技 = レベル1技[i];
      await this.技習得(pokemon_id, 技.move_id, i + 1);
    }
  }

  /**
   * レベルアップ時の技習得確認
   * 初学者向け：レベルアップした時に新しい技を覚えるかチェック
   */
  private async レベルアップ時技習得確認(pokemon_id: string, species_id: number, 旧レベル: number, 新レベル: number): Promise<void> {
    // 新しいレベルで覚える技があるかチェック
    const 新習得技 = await this.db?.prepare(`
      SELECT move_id FROM species_moves
      WHERE species_id = ? AND learn_level > ? AND learn_level <= ? AND learn_method = 'レベルアップ'
      ORDER BY learn_level
    `).bind(species_id, 旧レベル, 新レベル).all();

    const 新技リスト = 新習得技?.results as any[] || [];

    for (const 技 of 新技リスト) {
      // 現在の技数をチェック
      const 現在技数 = await this.db?.prepare(`
        SELECT COUNT(*) as count FROM pokemon_moves WHERE pokemon_id = ?
      `).bind(pokemon_id).first() as any;

      if (現在技数.count < 4) {
        // 空きスロットがある場合は自動で覚える
        const 空きスロット = 現在技数.count + 1;
        await this.技習得(pokemon_id, 技.move_id, 空きスロット);
      }
      // 4技覚えている場合の技忘れ処理は将来的に実装
    }
  }
}