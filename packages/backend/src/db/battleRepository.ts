// 初学者向け：バトルシステムのデータベース操作
// バトル関連のCRUD操作を担当するリポジトリ

import type { D1Database } from '@cloudflare/workers-types';
import type {
  技データ,
  バトルセッション,
  バトルログ,
  参戦ポケモン,
  習得技詳細,
  状態異常,
} from '@pokemon-like-game-tutorial/shared';

/**
 * バトルリポジトリクラス
 * 初学者向け：バトルシステムのデータベース操作を管理
 */
export class BattleRepository {
  constructor(private db: D1Database) {}

  /**
   * 技マスターデータ取得
   * 初学者向け：全ての技データを取得
   */
  async 全技取得(): Promise<技データ[]> {
    const result = await this.db.prepare(`SELECT * FROM move_master ORDER BY move_id`).all();

    return result.results as unknown as 技データ[];
  }

  /**
   * 技IDから技データを取得
   * 初学者向け：特定の技の詳細情報を取得
   */
  async 技取得(moveId: number): Promise<技データ | null> {
    const result = await this.db
      .prepare(`SELECT * FROM move_master WHERE move_id = ?`)
      .bind(moveId)
      .first();

    return result as 技データ | null;
  }

  /**
   * ポケモンの習得技を取得
   * 初学者向け：指定ポケモンが覚えている技のリストを取得
   */
  async ポケモン習得技取得(pokemonId: string): Promise<習得技詳細[]> {
    const result = await this.db
      .prepare(
        `
      SELECT 
        m.*,
        pm.current_pp
      FROM pokemon_moves pm
      JOIN move_master m ON pm.move_id = m.move_id
      WHERE pm.pokemon_id = ?
      ORDER BY pm.move_id
    `
      )
      .bind(pokemonId)
      .all();

    return result.results as unknown as 習得技詳細[];
  }

  /**
   * ポケモンに技を覚えさせる
   * 初学者向け：新しい技を習得させる処理
   */
  async 技習得(pokemonId: string, moveId: number, currentPp?: number): Promise<void> {
    // まず技データを取得してPPを確認
    const move = await this.技取得(moveId);
    if (!move) {
      throw new Error(`技ID ${moveId} が見つかりません`);
    }

    const pp = currentPp ?? move.pp;

    await this.db
      .prepare(
        `
      INSERT INTO pokemon_moves (pokemon_id, move_id, current_pp)
      VALUES (?, ?, ?)
      ON CONFLICT (pokemon_id, move_id) 
      DO UPDATE SET current_pp = ?
    `
      )
      .bind(pokemonId, moveId, pp, pp)
      .run();
  }

  /**
   * 技のPP更新
   * 初学者向け：技使用後のPP減少処理
   */
  async PP更新(pokemonId: string, moveId: number, newPp: number): Promise<void> {
    await this.db
      .prepare(
        `
      UPDATE pokemon_moves 
      SET current_pp = ?
      WHERE pokemon_id = ? AND move_id = ?
    `
      )
      .bind(newPp, pokemonId, moveId)
      .run();
  }

  /**
   * バトルセッション作成
   * 初学者向け：新しいバトルを開始
   */
  async バトルセッション作成(
    battleId: string,
    playerId: string,
    playerPokemonId: string,
    enemyPokemonId: string,
    battleType: '野生' | 'トレーナー'
  ): Promise<バトルセッション> {
    const now = new Date().toISOString();

    await this.db
      .prepare(
        `
      INSERT INTO battle_sessions (
        battle_id, player_id, player_pokemon_id, enemy_pokemon_id,
        battle_type, status, current_turn, phase, created_at
      ) VALUES (?, ?, ?, ?, ?, '進行中', 1, 'コマンド選択', ?)
    `
      )
      .bind(battleId, playerId, playerPokemonId, enemyPokemonId, battleType, now)
      .run();

    return {
      battle_id: battleId,
      player_id: playerId,
      player_pokemon_id: playerPokemonId,
      enemy_pokemon_id: enemyPokemonId,
      battle_type: battleType,
      status: '進行中',
      current_turn: 1,
      phase: 'コマンド選択',
      created_at: now,
    };
  }

  /**
   * バトルセッション取得
   * 初学者向け：進行中のバトル情報を取得
   */
  async バトルセッション取得(battleId: string): Promise<バトルセッション | null> {
    const result = await this.db
      .prepare(`SELECT * FROM battle_sessions WHERE battle_id = ?`)
      .bind(battleId)
      .first();

    return result as バトルセッション | null;
  }

  /**
   * バトルセッション更新
   * 初学者向け：バトルの進行状況を更新
   */
  async バトルセッション更新(battleId: string, updates: Partial<バトルセッション>): Promise<void> {
    const updateFields: string[] = [];
    const values: unknown[] = [];

    if (updates.current_turn !== undefined) {
      updateFields.push('current_turn = ?');
      values.push(updates.current_turn);
    }
    if (updates.phase !== undefined) {
      updateFields.push('phase = ?');
      values.push(updates.phase);
    }
    if (updates.status !== undefined) {
      updateFields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.winner !== undefined) {
      updateFields.push('winner = ?');
      values.push(updates.winner);
    }
    if (updates.ended_at !== undefined) {
      updateFields.push('ended_at = ?');
      values.push(updates.ended_at);
    }

    if (updateFields.length === 0) return;

    values.push(battleId);

    await this.db
      .prepare(
        `
      UPDATE battle_sessions 
      SET ${updateFields.join(', ')}
      WHERE battle_id = ?
    `
      )
      .bind(...values)
      .run();
  }

  /**
   * バトルログ記録
   * 初学者向け：バトル中の行動を記録
   */
  async バトルログ記録(
    battleId: string,
    turnNumber: number,
    actionType: string,
    actingPokemon: string,
    message: string,
    moveId?: number,
    damageDealt?: number
  ): Promise<void> {
    await this.db
      .prepare(
        `
      INSERT INTO battle_logs (
        battle_id, turn_number, action_type, acting_pokemon,
        move_id, damage_dealt, message
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `
      )
      .bind(
        battleId,
        turnNumber,
        actionType,
        actingPokemon,
        moveId || null,
        damageDealt || 0,
        message
      )
      .run();
  }

  /**
   * バトルログ取得
   * 初学者向け：特定バトルのログを取得
   */
  async バトルログ取得(battleId: string, limit: number = 10): Promise<バトルログ[]> {
    const result = await this.db
      .prepare(
        `
      SELECT * FROM battle_logs 
      WHERE battle_id = ?
      ORDER BY log_id DESC
      LIMIT ?
    `
      )
      .bind(battleId, limit)
      .all();

    return result.results as unknown as バトルログ[];
  }

  /**
   * 参戦ポケモン情報取得
   * 初学者向け：バトル用のポケモン詳細データを組み立て
   */
  async 参戦ポケモン取得(pokemonId: string): Promise<参戦ポケモン | null> {
    // ポケモン基本情報を取得
    const pokemonResult = await this.db
      .prepare(
        `
      SELECT 
        op.pokemon_id,
        op.species_id,
        op.level,
        op.current_hp,
        op.max_hp,
        op.attack,
        op.defense,
        op.nickname,
        op.status_condition,
        sm.name,
        sm.sprite_url
      FROM owned_pokemon op
      JOIN species_master sm ON op.species_id = sm.species_id
      WHERE op.pokemon_id = ?
    `
      )
      .bind(pokemonId)
      .first();

    if (!pokemonResult) return null;

    const pokemon = pokemonResult as {
      pokemon_id: string;
      species_id: number;
      level: number;
      current_hp: number;
      max_hp: number;
      attack: number;
      defense: number;
      nickname?: string;
      status_condition?: 状態異常;
      name: string;
      sprite_url: string;
    };

    // 習得技を取得
    const moves = await this.ポケモン習得技取得(pokemonId);

    return {
      pokemon_id: pokemon.pokemon_id,
      species_id: pokemon.species_id,
      name: pokemon.name,
      nickname: pokemon.nickname,
      level: pokemon.level,
      current_hp: pokemon.current_hp,
      max_hp: pokemon.max_hp,
      attack: pokemon.attack,
      defense: pokemon.defense,
      sprite_url: pokemon.sprite_url,
      moves: moves,
      status_condition: pokemon.status_condition,
    };
  }

  /**
   * 野生ポケモン作成
   * 初学者向け：バトル用の野生ポケモンデータを生成
   */
  async 野生ポケモン作成(speciesId: number, level: number): Promise<参戦ポケモン> {
    // 種族データを取得
    const speciesResult = await this.db
      .prepare(
        `
      SELECT * FROM species_master WHERE species_id = ?
    `
      )
      .bind(speciesId)
      .first();

    if (!speciesResult) {
      throw new Error(`種族ID ${speciesId} が見つかりません`);
    }

    const species = speciesResult as {
      species_id: number;
      name: string;
      hp: number;
      attack: number;
      defense: number;
      sprite_url: string;
    };

    // レベルに応じたステータス計算（簡易版）
    const hp = Math.floor(species.hp + level * 2);
    const attack = Math.floor(species.attack + level * 1.5);
    const defense = Math.floor(species.defense + level * 1.5);

    // 野生ポケモン用の一時ID
    const wildPokemonId = `wild-${speciesId}-${Date.now()}`;

    // 基本技セットを取得（仮実装）
    const moves = await this.デフォルト技セット取得(speciesId);

    return {
      pokemon_id: wildPokemonId,
      species_id: speciesId,
      name: species.name,
      level: level,
      current_hp: hp,
      max_hp: hp,
      attack: attack,
      defense: defense,
      sprite_url: species.sprite_url,
      moves: moves,
    };
  }

  /**
   * デフォルト技セット取得
   * 初学者向け：ポケモンの基本技セットを取得（仮実装）
   */
  private async デフォルト技セット取得(speciesId: number): Promise<習得技詳細[]> {
    // 簡易実装：種族IDに応じた基本技を返す
    let moveIds: number[] = [];

    switch (speciesId) {
      case 1: // フシギダネ
        moveIds = [1, 10, 11, 14];
        break;
      case 4: // ヒトカゲ
        moveIds = [1, 12, 13, 2];
        break;
      case 7: // ゼニガメ
        moveIds = [1, 6, 7, 3];
        break;
      case 25: // ピカチュウ
        moveIds = [4, 5, 15, 1];
        break;
      default:
        moveIds = [1, 2]; // たいあたり、ひっかく
    }

    // 技データを取得
    const moves: 習得技詳細[] = [];
    for (const moveId of moveIds) {
      const move = await this.技取得(moveId);
      if (move) {
        moves.push({
          ...move,
          current_pp: move.pp,
        });
      }
    }

    return moves;
  }

  /**
   * ポケモンのHP更新
   * 初学者向け：ダメージ計算後のHP更新
   */
  async ポケモンHP更新(pokemonId: string, newHp: number): Promise<void> {
    // 野生ポケモンの場合はスキップ（DBに存在しないため）
    if (pokemonId.startsWith('wild-')) {
      return;
    }

    await this.db
      .prepare(
        `
      UPDATE owned_pokemon 
      SET current_hp = ?
      WHERE pokemon_id = ?
    `
      )
      .bind(newHp, pokemonId)
      .run();
  }

  /**
   * アクティブなバトル取得
   * 初学者向け：プレイヤーの進行中バトルを取得
   */
  async アクティブバトル取得(playerId: string): Promise<バトルセッション | null> {
    const result = await this.db
      .prepare(
        `
      SELECT * FROM battle_sessions 
      WHERE player_id = ? AND status = '進行中'
      ORDER BY created_at DESC
      LIMIT 1
    `
      )
      .bind(playerId)
      .first();

    return result as バトルセッション | null;
  }
}
