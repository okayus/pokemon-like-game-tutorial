// 初学者向け：バトルシステムのAPIルート定義
// ポケモンバトルの開始、進行、終了を管理するAPI

import { Hono } from 'hono';
import type { Env } from '../types';
import { BattleRepository } from '../db/battleRepository';
import { PokemonRepository } from '../db/pokemonRepository';
import {
  詳細ダメージ計算,
  命中判定,
  HP計算,
  バトル終了判定,
  バトルメッセージ生成,
  PP消費
} from '@pokemon-like-game-tutorial/shared';
import type {
  バトル開始リクエスト,
  バトル開始応答,
  技使用リクエスト,
  技使用結果,
  バトル状態,
  参戦ポケモン
} from '@pokemon-like-game-tutorial/shared';

// バトルAPIのルーター作成
export const battleRoutes = new Hono<{ Bindings: Env }>();

/**
 * POST /api/battle/start
 * 初学者向け：新しいバトルを開始する
 */
battleRoutes.post('/start', async (c) => {
  try {
    const body = await c.req.json<バトル開始リクエスト>();
    const { player_id, player_pokemon_id, enemy_pokemon_id, battle_type } = body;

    // バリデーション
    if (!player_id || !player_pokemon_id || !enemy_pokemon_id || !battle_type) {
      return c.json<バトル開始応答>({
        success: false,
        battle: null as any,
        error: '必要なパラメータが不足しています'
      }, 400);
    }

    // リポジトリ初期化
    const battleRepo = new BattleRepository(c.env.DB);
    const pokemonRepo = new PokemonRepository(c.env.DB);

    // 既に進行中のバトルがないか確認
    const activeバトル = await battleRepo.アクティブバトル取得(player_id);
    if (activeバトル) {
      return c.json<バトル開始応答>({
        success: false,
        battle: null as any,
        error: '既に進行中のバトルがあります'
      }, 409);
    }

    // プレイヤーポケモンの情報取得
    const playerPokemon = await battleRepo.参戦ポケモン取得(player_pokemon_id);
    if (!playerPokemon) {
      return c.json<バトル開始応答>({
        success: false,
        battle: null as any,
        error: 'プレイヤーのポケモンが見つかりません'
      }, 404);
    }

    // 敵ポケモンの情報取得
    let enemyPokemon: 参戦ポケモン | null = null;
    
    if (battle_type === '野生') {
      // 野生ポケモンの場合は新規作成
      const speciesId = parseInt(enemy_pokemon_id); // 野生の場合は種族IDが渡される
      const level = Math.floor(Math.random() * 10) + 10; // レベル10-19のランダム
      enemyPokemon = await battleRepo.野生ポケモン作成(speciesId, level);
    } else {
      // トレーナー戦の場合は既存ポケモンを取得
      enemyPokemon = await battleRepo.参戦ポケモン取得(enemy_pokemon_id);
    }

    if (!enemyPokemon) {
      return c.json<バトル開始応答>({
        success: false,
        battle: null as any,
        error: '敵ポケモンの情報取得に失敗しました'
      }, 404);
    }

    // バトルID生成（UUID形式）
    const battleId = `battle-${crypto.randomUUID()}`;

    // バトルセッション作成
    const session = await battleRepo.バトルセッション作成(
      battleId,
      player_id,
      player_pokemon_id,
      enemyPokemon.pokemon_id,
      battle_type
    );

    // 初期バトル状態を構築
    const battleState: バトル状態 = {
      session: session,
      player_pokemon: playerPokemon,
      enemy_pokemon: enemyPokemon,
      recent_logs: [],
      is_loading: false
    };

    // バトル開始ログ記録
    await battleRepo.バトルログ記録(
      battleId,
      1,
      '技使用',
      'システム',
      `野生の${enemyPokemon.name}が現れた！`,
      undefined,
      0
    );

    return c.json<バトル開始応答>({
      success: true,
      battle: battleState
    });

  } catch (error) {
    console.error('バトル開始エラー:', error);
    return c.json<バトル開始応答>({
      success: false,
      battle: null as any,
      error: 'バトルの開始に失敗しました'
    }, 500);
  }
});

/**
 * POST /api/battle/{battleId}/use-move
 * 初学者向け：技を使用してダメージ計算を行う
 */
battleRoutes.post('/:battleId/use-move', async (c) => {
  try {
    const battleId = c.req.param('battleId');
    const body = await c.req.json<技使用リクエスト>();
    const { pokemon_id, move_id, target } = body;

    // リポジトリ初期化
    const battleRepo = new BattleRepository(c.env.DB);

    // バトルセッション取得
    const session = await battleRepo.バトルセッション取得(battleId);
    if (!session || session.status !== '進行中') {
      return c.json<技使用結果>({
        success: false,
        move_name: '',
        damage_dealt: 0,
        critical_hit: false,
        effectiveness: '普通',
        attacker_hp: 0,
        target_hp: 0,
        battle_status: '終了',
        message: 'バトルが見つからないか、既に終了しています'
      }, 404);
    }

    // 参戦ポケモン情報取得
    const playerPokemon = await battleRepo.参戦ポケモン取得(session.player_pokemon_id);
    const enemyPokemon = await battleRepo.参戦ポケモン取得(session.enemy_pokemon_id) 
      || await battleRepo.野生ポケモン作成(parseInt(session.enemy_pokemon_id.split('-')[1]), 15);

    if (!playerPokemon || !enemyPokemon) {
      return c.json<技使用結果>({
        success: false,
        move_name: '',
        damage_dealt: 0,
        critical_hit: false,
        effectiveness: '普通',
        attacker_hp: 0,
        target_hp: 0,
        battle_status: '終了',
        message: 'ポケモン情報の取得に失敗しました'
      }, 500);
    }

    // 攻撃者と防御者を決定
    const isPlayerAttacking = pokemon_id === playerPokemon.pokemon_id;
    const attacker = isPlayerAttacking ? playerPokemon : enemyPokemon;
    const defender = isPlayerAttacking ? enemyPokemon : playerPokemon;

    // 使用する技を取得
    const moveData = attacker.moves.find(m => m.move_id === move_id);
    if (!moveData) {
      return c.json<技使用結果>({
        success: false,
        move_name: '',
        damage_dealt: 0,
        critical_hit: false,
        effectiveness: '普通',
        attacker_hp: attacker.current_hp,
        target_hp: defender.current_hp,
        battle_status: '進行中',
        message: '指定された技が見つかりません'
      }, 400);
    }

    // PP確認
    if (moveData.current_pp <= 0) {
      return c.json<技使用結果>({
        success: false,
        move_name: moveData.name,
        damage_dealt: 0,
        critical_hit: false,
        effectiveness: '普通',
        attacker_hp: attacker.current_hp,
        target_hp: defender.current_hp,
        battle_status: '進行中',
        message: `${moveData.name}のPPが足りない！`
      }, 400);
    }

    // 命中判定
    const isHit = 命中判定(moveData);
    if (!isHit) {
      // PPを消費
      const newPp = PP消費(moveData.current_pp, 1);
      await battleRepo.PP更新(attacker.pokemon_id, move_id, newPp);

      // ミスログ記録
      await battleRepo.バトルログ記録(
        battleId,
        session.current_turn,
        '技使用',
        attacker.name,
        `${attacker.name}の${moveData.name}！しかし、はずれた！`,
        move_id,
        0
      );

      return c.json<技使用結果>({
        success: true,
        move_name: moveData.name,
        damage_dealt: 0,
        critical_hit: false,
        effectiveness: '普通',
        attacker_hp: attacker.current_hp,
        target_hp: defender.current_hp,
        battle_status: '進行中',
        message: `${attacker.name}の${moveData.name}！しかし、はずれた！`
      });
    }

    // ダメージ計算
    const damageResult = 詳細ダメージ計算(attacker, defender, moveData);
    const newDefenderHp = HP計算(defender.current_hp, damageResult.final_damage);

    // PPを消費
    const newPp = PP消費(moveData.current_pp, 1);
    await battleRepo.PP更新(attacker.pokemon_id, move_id, newPp);

    // HPを更新（DBに反映）
    if (isPlayerAttacking) {
      enemyPokemon.current_hp = newDefenderHp;
      // 野生ポケモンの場合はDB更新をスキップ
      if (!session.enemy_pokemon_id.startsWith('wild-')) {
        await battleRepo.ポケモンHP更新(session.enemy_pokemon_id, newDefenderHp);
      }
    } else {
      playerPokemon.current_hp = newDefenderHp;
      await battleRepo.ポケモンHP更新(session.player_pokemon_id, newDefenderHp);
    }

    // バトル終了判定
    const winner = バトル終了判定(playerPokemon, enemyPokemon);
    const battleStatus = winner ? '終了' : '進行中';

    // メッセージ生成
    const message = バトルメッセージ生成(
      attacker.name,
      moveData.name,
      damageResult.final_damage,
      damageResult.critical_multiplier > 1,
      '普通' // タイプ相性は未実装
    );

    // バトルログ記録
    await battleRepo.バトルログ記録(
      battleId,
      session.current_turn,
      '技使用',
      attacker.name,
      message,
      move_id,
      damageResult.final_damage
    );

    // バトル終了処理
    if (winner) {
      await battleRepo.バトルセッション更新(battleId, {
        status: '終了',
        winner: winner,
        ended_at: new Date().toISOString()
      });

      // 勝利メッセージログ
      const winnerName = winner === '味方' ? playerPokemon.name : enemyPokemon.name;
      await battleRepo.バトルログ記録(
        battleId,
        session.current_turn,
        '技使用',
        'システム',
        `${winnerName}の勝利！`,
        undefined,
        0
      );
    } else {
      // ターン進行
      await battleRepo.バトルセッション更新(battleId, {
        current_turn: session.current_turn + 1
      });
    }

    return c.json<技使用結果>({
      success: true,
      move_name: moveData.name,
      damage_dealt: damageResult.final_damage,
      critical_hit: damageResult.critical_multiplier > 1,
      effectiveness: '普通',
      attacker_hp: attacker.current_hp,
      target_hp: newDefenderHp,
      battle_status: battleStatus,
      winner: winner || undefined,
      message: message
    });

  } catch (error) {
    console.error('技使用エラー:', error);
    return c.json<技使用結果>({
      success: false,
      move_name: '',
      damage_dealt: 0,
      critical_hit: false,
      effectiveness: '普通',
      attacker_hp: 0,
      target_hp: 0,
      battle_status: '終了',
      message: '技の使用に失敗しました'
    }, 500);
  }
});

/**
 * GET /api/battle/{battleId}/status
 * 初学者向け：バトルの現在状態を取得
 */
battleRoutes.get('/:battleId/status', async (c) => {
  try {
    const battleId = c.req.param('battleId');
    const battleRepo = new BattleRepository(c.env.DB);

    // バトルセッション取得
    const session = await battleRepo.バトルセッション取得(battleId);
    if (!session) {
      return c.json({ 
        success: false, 
        error: 'バトルが見つかりません' 
      }, 404);
    }

    // 参戦ポケモン情報取得
    const playerPokemon = await battleRepo.参戦ポケモン取得(session.player_pokemon_id);
    const enemyPokemon = await battleRepo.参戦ポケモン取得(session.enemy_pokemon_id)
      || await battleRepo.野生ポケモン作成(parseInt(session.enemy_pokemon_id.split('-')[1]), 15);

    // 最近のログ取得
    const recentLogs = await battleRepo.バトルログ取得(battleId, 5);

    const battleState: バトル状態 = {
      session: session,
      player_pokemon: playerPokemon!,
      enemy_pokemon: enemyPokemon!,
      recent_logs: recentLogs,
      is_loading: false
    };

    return c.json({
      success: true,
      battle: battleState
    });

  } catch (error) {
    console.error('バトル状態取得エラー:', error);
    return c.json({ 
      success: false, 
      error: 'バトル状態の取得に失敗しました' 
    }, 500);
  }
});

/**
 * POST /api/battle/{battleId}/end
 * 初学者向け：バトルを強制終了する（逃げる、降参など）
 */
battleRoutes.post('/:battleId/end', async (c) => {
  try {
    const battleId = c.req.param('battleId');
    const { reason } = await c.req.json<{ reason?: string }>();
    
    const battleRepo = new BattleRepository(c.env.DB);

    // バトルセッション取得
    const session = await battleRepo.バトルセッション取得(battleId);
    if (!session || session.status !== '進行中') {
      return c.json({ 
        success: false, 
        error: 'バトルが見つからないか、既に終了しています' 
      }, 404);
    }

    // バトル終了処理
    await battleRepo.バトルセッション更新(battleId, {
      status: '終了',
      ended_at: new Date().toISOString()
    });

    // 終了ログ記録
    const message = reason || 'バトルが終了しました';
    await battleRepo.バトルログ記録(
      battleId,
      session.current_turn,
      '逃げる',
      'プレイヤー',
      message,
      undefined,
      0
    );

    return c.json({ 
      success: true, 
      message: 'バトルを終了しました' 
    });

  } catch (error) {
    console.error('バトル終了エラー:', error);
    return c.json({ 
      success: false, 
      error: 'バトルの終了に失敗しました' 
    }, 500);
  }
});

/**
 * GET /api/battle/moves
 * 初学者向け：全技マスターデータを取得（デバッグ・開発用）
 */
battleRoutes.get('/moves', async (c) => {
  try {
    const battleRepo = new BattleRepository(c.env.DB);
    const moves = await battleRepo.全技取得();

    return c.json({
      success: true,
      moves: moves,
      count: moves.length
    });

  } catch (error) {
    console.error('技データ取得エラー:', error);
    return c.json({ 
      success: false, 
      error: '技データの取得に失敗しました' 
    }, 500);
  }
});