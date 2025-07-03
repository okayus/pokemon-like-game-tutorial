// 初学者向け：PP（使用回数）管理ユーティリティ
// ポケモンの技のPP消費・回復・残量チェックを管理

import type { 習得技詳細 } from '../types/battle';

/**
 * PPの状態を表すインターフェース
 * 初学者向け：技のPP情報を管理するデータ構造
 */
export interface PP状態 {
  move_id: number; // 技ID
  current_pp: number; // 現在のPP
  max_pp: number; // 最大PP
  pp_percentage: number; // PP残量率（0-1）
  is_usable: boolean; // 使用可能かどうか
}

/**
 * PPの消費結果
 * 初学者向け：PP消費操作の結果情報
 */
export interface PP消費結果 {
  success: boolean; // 消費が成功したか
  remaining_pp: number; // 消費後の残りPP
  was_last_use: boolean; // 最後の使用だったか
  message: string; // 結果メッセージ
}

/**
 * PPの回復結果
 * 初学者向け：PP回復操作の結果情報
 */
export interface PP回復結果 {
  success: boolean; // 回復が成功したか
  recovered_amount: number; // 回復したPP量
  new_pp: number; // 回復後のPP
  message: string; // 結果メッセージ
}

/**
 * PP管理クラス
 * 初学者向け：ポケモンの技PPを総合的に管理
 */
export class PPManager {
  /**
   * PPを消費する
   * 初学者向け：技使用時のPP減少処理
   */
  static consumePP(move: 習得技詳細, amount: number = 1): PP消費結果 {
    if (move.current_pp <= 0) {
      return {
        success: false,
        remaining_pp: 0,
        was_last_use: false,
        message: `${move.name}のPPが足りない！`,
      };
    }

    if (amount < 0) {
      return {
        success: false,
        remaining_pp: move.current_pp,
        was_last_use: false,
        message: 'PPの消費量は0以上である必要があります',
      };
    }

    const newPP = Math.max(0, move.current_pp - amount);
    const wasLastUse = move.current_pp === 1 && amount >= 1;

    return {
      success: true,
      remaining_pp: newPP,
      was_last_use: wasLastUse,
      message: wasLastUse
        ? `${move.name}のPPを使い切った！`
        : `${move.name}のPPが${amount}減った（残り${newPP}）`,
    };
  }

  /**
   * PPを回復する
   * 初学者向け：回復アイテム使用時などのPP増加処理
   */
  static restorePP(move: 習得技詳細, amount: number): PP回復結果 {
    if (amount < 0) {
      return {
        success: false,
        recovered_amount: 0,
        new_pp: move.current_pp,
        message: 'PPの回復量は0以上である必要があります',
      };
    }

    if (move.current_pp >= move.pp) {
      return {
        success: false,
        recovered_amount: 0,
        new_pp: move.current_pp,
        message: `${move.name}のPPは既に満タンです`,
      };
    }

    const maxRecoverable = move.pp - move.current_pp;
    const actualRecovery = Math.min(amount, maxRecoverable);
    const newPP = move.current_pp + actualRecovery;

    return {
      success: true,
      recovered_amount: actualRecovery,
      new_pp: newPP,
      message: `${move.name}のPPが${actualRecovery}回復した！（${newPP}/${move.pp}）`,
    };
  }

  /**
   * PPを完全回復する
   * 初学者向け：ポケモンセンター利用時などの全PP回復
   */
  static fullRestorePP(move: 習得技詳細): PP回復結果 {
    return this.restorePP(move, move.pp);
  }

  /**
   * PP状態を取得する
   * 初学者向け：技のPP情報を詳細に分析
   */
  static getPPStatus(move: 習得技詳細): PP状態 {
    const percentage = move.pp > 0 ? move.current_pp / move.pp : 0;

    return {
      move_id: move.move_id,
      current_pp: move.current_pp,
      max_pp: move.pp,
      pp_percentage: percentage,
      is_usable: move.current_pp > 0,
    };
  }

  /**
   * PP残量による色分け
   * 初学者向け：UI表示でのPP状態の色分け判定
   */
  static getPPColorClass(ppStatus: PP状態): string {
    if (ppStatus.pp_percentage <= 0) return 'text-red-500'; // PP切れ
    if (ppStatus.pp_percentage <= 0.25) return 'text-orange-500'; // 危険
    if (ppStatus.pp_percentage <= 0.5) return 'text-yellow-500'; // 注意
    return 'text-green-500'; // 安全
  }

  /**
   * PP残量による警告メッセージ
   * 初学者向け：PP不足時のユーザーへの警告
   */
  static getPPWarningMessage(ppStatus: PP状態): string | null {
    if (ppStatus.pp_percentage <= 0) {
      return 'この技はPPが切れているため使用できません';
    }
    if (ppStatus.pp_percentage <= 0.25) {
      return 'この技のPPが少なくなっています';
    }
    return null;
  }

  /**
   * 複数技のPP状態を一括取得
   * 初学者向け：ポケモンの全技のPP状態をまとめて分析
   */
  static getAllPPStatus(moves: 習得技詳細[]): PP状態[] {
    return moves.map((move) => this.getPPStatus(move));
  }

  /**
   * 使用可能な技の数を取得
   * 初学者向け：バトルで実際に使える技がいくつあるかチェック
   */
  static getUsableMovesCount(moves: 習得技詳細[]): number {
    return moves.filter((move) => move.current_pp > 0).length;
  }

  /**
   * PP切れの技があるかチェック
   * 初学者向け：PP回復が必要かどうかの判定
   */
  static hasMovesWithoutPP(moves: 習得技詳細[]): boolean {
    return moves.some((move) => move.current_pp === 0);
  }

  /**
   * 全技のPPが切れているかチェック
   * 初学者向け：わるあがき状態の判定
   */
  static allMovesOutOfPP(moves: 習得技詳細[]): boolean {
    return moves.length > 0 && moves.every((move) => move.current_pp === 0);
  }

  /**
   * 最もPPが少ない技を取得
   * 初学者向け：優先的にPP回復すべき技の特定
   */
  static getLowestPPMove(moves: 習得技詳細[]): 習得技詳細 | null {
    if (moves.length === 0) return null;

    return moves.reduce((lowest, current) => {
      const lowestPercentage = lowest.pp > 0 ? lowest.current_pp / lowest.pp : 0;
      const currentPercentage = current.pp > 0 ? current.current_pp / current.pp : 0;

      return currentPercentage < lowestPercentage ? current : lowest;
    });
  }

  /**
   * PP回復アイテムの効果を計算
   * 初学者向け：回復アイテム使用時の効果シミュレーション
   */
  static calculatePPItemEffect(
    moves: 習得技詳細[],
    itemType: 'ピーピーエイド' | 'ピーピーリカバー' | 'ピーピーマックス',
    targetMoveId?: number
  ): { affectedMoves: 習得技詳細[]; totalRecovery: number; message: string } {
    let affectedMoves: 習得技詳細[] = [];
    let totalRecovery = 0;
    let message = '';

    switch (itemType) {
      case 'ピーピーエイド':
        // 指定した技のPPを10回復
        if (targetMoveId) {
          const targetMove = moves.find((m) => m.move_id === targetMoveId);
          if (targetMove) {
            const result = this.restorePP(targetMove, 10);
            affectedMoves = [targetMove];
            totalRecovery = result.recovered_amount;
            message = result.message;
          }
        }
        break;

      case 'ピーピーリカバー':
        // 指定した技のPPを全回復
        if (targetMoveId) {
          const targetMove = moves.find((m) => m.move_id === targetMoveId);
          if (targetMove) {
            const result = this.fullRestorePP(targetMove);
            affectedMoves = [targetMove];
            totalRecovery = result.recovered_amount;
            message = result.message;
          }
        }
        break;

      case 'ピーピーマックス':
        // 全技のPPを全回復
        affectedMoves = moves.filter((m) => m.current_pp < m.pp);
        totalRecovery = affectedMoves.reduce((total, move) => {
          return total + (move.pp - move.current_pp);
        }, 0);
        message =
          totalRecovery > 0
            ? `全ての技のPPが回復した！（合計${totalRecovery}PP回復）`
            : '全ての技のPPは既に満タンです';
        break;
    }

    return { affectedMoves, totalRecovery, message };
  }
}

export default PPManager;
