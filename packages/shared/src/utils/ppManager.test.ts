// 初学者向け：PP管理ユーティリティのテスト
// TDDアプローチでPP管理機能をテスト

import { describe, it, expect } from 'vitest';
import { PPManager } from './ppManager';
import type { 習得技詳細 } from '../types/battle';

// テスト用の技データ作成ヘルパー
const createMockMove = (overrides: Partial<習得技詳細> = {}): 習得技詳細 => ({
  move_id: 1,
  name: 'でんきショック',
  type: 'でんき',
  power: 40,
  accuracy: 100,
  pp: 30,
  category: '特殊',
  description: '電気の刺激で相手を攻撃する。',
  created_at: '2025-07-02 00:00:00',
  updated_at: '2025-07-02 00:00:00',
  current_pp: 30,
  ...overrides,
});

describe('PPManager', () => {
  describe('PP消費', () => {
    it('正常にPPを消費できる', () => {
      const move = createMockMove({ current_pp: 10, pp: 30 });
      const result = PPManager.consumePP(move, 1);

      expect(result.success).toBe(true);
      expect(result.remaining_pp).toBe(9);
      expect(result.was_last_use).toBe(false);
      expect(result.message).toContain('でんきショックのPPが1減った');
    });

    it('最後のPP使用を正しく検出する', () => {
      const move = createMockMove({ current_pp: 1, pp: 30 });
      const result = PPManager.consumePP(move, 1);

      expect(result.success).toBe(true);
      expect(result.remaining_pp).toBe(0);
      expect(result.was_last_use).toBe(true);
      expect(result.message).toContain('でんきショックのPPを使い切った');
    });

    it('PPが0の場合は消費できない', () => {
      const move = createMockMove({ current_pp: 0, pp: 30 });
      const result = PPManager.consumePP(move, 1);

      expect(result.success).toBe(false);
      expect(result.remaining_pp).toBe(0);
      expect(result.was_last_use).toBe(false);
      expect(result.message).toContain('でんきショックのPPが足りない');
    });

    it('負の値を指定した場合はエラーになる', () => {
      const move = createMockMove({ current_pp: 10, pp: 30 });
      const result = PPManager.consumePP(move, -1);

      expect(result.success).toBe(false);
      expect(result.remaining_pp).toBe(10);
      expect(result.message).toContain('PPの消費量は0以上である必要があります');
    });

    it('PPより多い量を消費してもPPは0未満にならない', () => {
      const move = createMockMove({ current_pp: 3, pp: 30 });
      const result = PPManager.consumePP(move, 5);

      expect(result.success).toBe(true);
      expect(result.remaining_pp).toBe(0);
    });
  });

  describe('PP回復', () => {
    it('正常にPPを回復できる', () => {
      const move = createMockMove({ current_pp: 20, pp: 30 });
      const result = PPManager.restorePP(move, 5);

      expect(result.success).toBe(true);
      expect(result.recovered_amount).toBe(5);
      expect(result.new_pp).toBe(25);
      expect(result.message).toContain('でんきショックのPPが5回復した');
    });

    it('最大PPを超えて回復しない', () => {
      const move = createMockMove({ current_pp: 25, pp: 30 });
      const result = PPManager.restorePP(move, 10);

      expect(result.success).toBe(true);
      expect(result.recovered_amount).toBe(5);
      expect(result.new_pp).toBe(30);
    });

    it('既に満タンの場合は回復できない', () => {
      const move = createMockMove({ current_pp: 30, pp: 30 });
      const result = PPManager.restorePP(move, 5);

      expect(result.success).toBe(false);
      expect(result.recovered_amount).toBe(0);
      expect(result.new_pp).toBe(30);
      expect(result.message).toContain('でんきショックのPPは既に満タンです');
    });

    it('負の値を指定した場合はエラーになる', () => {
      const move = createMockMove({ current_pp: 20, pp: 30 });
      const result = PPManager.restorePP(move, -5);

      expect(result.success).toBe(false);
      expect(result.recovered_amount).toBe(0);
      expect(result.message).toContain('PPの回復量は0以上である必要があります');
    });
  });

  describe('PP完全回復', () => {
    it('PPを最大まで回復できる', () => {
      const move = createMockMove({ current_pp: 10, pp: 30 });
      const result = PPManager.fullRestorePP(move);

      expect(result.success).toBe(true);
      expect(result.recovered_amount).toBe(20);
      expect(result.new_pp).toBe(30);
    });

    it('既に満タンの場合は何もしない', () => {
      const move = createMockMove({ current_pp: 30, pp: 30 });
      const result = PPManager.fullRestorePP(move);

      expect(result.success).toBe(false);
      expect(result.recovered_amount).toBe(0);
    });
  });

  describe('PP状態取得', () => {
    it('PP状態を正しく計算する', () => {
      const move = createMockMove({ current_pp: 15, pp: 30 });
      const status = PPManager.getPPStatus(move);

      expect(status.move_id).toBe(1);
      expect(status.current_pp).toBe(15);
      expect(status.max_pp).toBe(30);
      expect(status.pp_percentage).toBe(0.5);
      expect(status.is_usable).toBe(true);
    });

    it('PP0の場合は使用不可と判定される', () => {
      const move = createMockMove({ current_pp: 0, pp: 30 });
      const status = PPManager.getPPStatus(move);

      expect(status.pp_percentage).toBe(0);
      expect(status.is_usable).toBe(false);
    });
  });

  describe('PP色分け', () => {
    it('PP残量に応じた色を返す', () => {
      // PP 100% - 緑
      const fullPP = PPManager.getPPStatus(createMockMove({ current_pp: 30, pp: 30 }));
      expect(PPManager.getPPColorClass(fullPP)).toBe('text-green-500');

      // PP 50% - 黄色
      const halfPP = PPManager.getPPStatus(createMockMove({ current_pp: 15, pp: 30 }));
      expect(PPManager.getPPColorClass(halfPP)).toBe('text-yellow-500');

      // PP 25% - オレンジ
      const lowPP = PPManager.getPPStatus(createMockMove({ current_pp: 7, pp: 30 }));
      expect(PPManager.getPPColorClass(lowPP)).toBe('text-orange-500');

      // PP 0% - 赤
      const noPP = PPManager.getPPStatus(createMockMove({ current_pp: 0, pp: 30 }));
      expect(PPManager.getPPColorClass(noPP)).toBe('text-red-500');
    });
  });

  describe('PP警告メッセージ', () => {
    it('PP残量に応じた警告メッセージを返す', () => {
      // PP 0% - 使用不可メッセージ
      const noPP = PPManager.getPPStatus(createMockMove({ current_pp: 0, pp: 30 }));
      expect(PPManager.getPPWarningMessage(noPP)).toContain('PPが切れているため使用できません');

      // PP 25% - 警告メッセージ
      const lowPP = PPManager.getPPStatus(createMockMove({ current_pp: 7, pp: 30 }));
      expect(PPManager.getPPWarningMessage(lowPP)).toContain('PPが少なくなっています');

      // PP 50% - 警告なし
      const halfPP = PPManager.getPPStatus(createMockMove({ current_pp: 15, pp: 30 }));
      expect(PPManager.getPPWarningMessage(halfPP)).toBeNull();
    });
  });

  describe('複数技の管理', () => {
    const moves = [
      createMockMove({ move_id: 1, name: '技A', current_pp: 30, pp: 30 }),
      createMockMove({ move_id: 2, name: '技B', current_pp: 15, pp: 30 }),
      createMockMove({ move_id: 3, name: '技C', current_pp: 0, pp: 30 }),
      createMockMove({ move_id: 4, name: '技D', current_pp: 5, pp: 30 }),
    ];

    it('全技のPP状態を取得できる', () => {
      const statuses = PPManager.getAllPPStatus(moves);

      expect(statuses).toHaveLength(4);
      expect(statuses[0].is_usable).toBe(true);
      expect(statuses[2].is_usable).toBe(false);
    });

    it('使用可能な技の数を正しく計算する', () => {
      const usableCount = PPManager.getUsableMovesCount(moves);
      expect(usableCount).toBe(3); // 技A, B, Dが使用可能
    });

    it('PP切れの技があるかチェックできる', () => {
      expect(PPManager.hasMovesWithoutPP(moves)).toBe(true);

      const allUsableMoves = moves.filter((m) => m.current_pp > 0);
      expect(PPManager.hasMovesWithoutPP(allUsableMoves)).toBe(false);
    });

    it('全技PP切れの判定ができる', () => {
      expect(PPManager.allMovesOutOfPP(moves)).toBe(false);

      const allNoPPMoves = moves.map((m) => ({ ...m, current_pp: 0 }));
      expect(PPManager.allMovesOutOfPP(allNoPPMoves)).toBe(true);
    });

    it('最もPPが少ない技を特定できる', () => {
      const lowestMove = PPManager.getLowestPPMove(moves);
      expect(lowestMove?.name).toBe('技C'); // PP 0%
    });
  });

  describe('PP回復アイテム効果', () => {
    const moves = [
      createMockMove({ move_id: 1, name: '技A', current_pp: 20, pp: 30 }),
      createMockMove({ move_id: 2, name: '技B', current_pp: 0, pp: 25 }),
      createMockMove({ move_id: 3, name: '技C', current_pp: 15, pp: 20 }),
    ];

    it('ピーピーエイドの効果を計算できる', () => {
      const result = PPManager.calculatePPItemEffect(moves, 'ピーピーエイド', 1);

      expect(result.affectedMoves).toHaveLength(1);
      expect(result.affectedMoves[0].name).toBe('技A');
      expect(result.totalRecovery).toBe(10);
      expect(result.message).toContain('技AのPPが10回復した');
    });

    it('ピーピーリカバーの効果を計算できる', () => {
      const result = PPManager.calculatePPItemEffect(moves, 'ピーピーリカバー', 2);

      expect(result.affectedMoves).toHaveLength(1);
      expect(result.affectedMoves[0].name).toBe('技B');
      expect(result.totalRecovery).toBe(25);
    });

    it('ピーピーマックスの効果を計算できる', () => {
      const result = PPManager.calculatePPItemEffect(moves, 'ピーピーマックス');

      expect(result.affectedMoves).toHaveLength(3);
      expect(result.totalRecovery).toBe(40); // 10 + 25 + 5
      expect(result.message).toContain('全ての技のPPが回復した');
    });

    it('満タンの場合はアイテム効果なし', () => {
      const fullMoves = moves.map((m) => ({ ...m, current_pp: m.pp }));
      const result = PPManager.calculatePPItemEffect(fullMoves, 'ピーピーマックス');

      expect(result.totalRecovery).toBe(0);
      expect(result.message).toContain('既に満タンです');
    });
  });

  describe('エッジケース', () => {
    it('空の技リストを処理できる', () => {
      expect(PPManager.getAllPPStatus([])).toEqual([]);
      expect(PPManager.getUsableMovesCount([])).toBe(0);
      expect(PPManager.hasMovesWithoutPP([])).toBe(false);
      expect(PPManager.allMovesOutOfPP([])).toBe(false);
      expect(PPManager.getLowestPPMove([])).toBeNull();
    });

    it('最大PP0の技を処理できる', () => {
      const zeroMaxPPMove = createMockMove({ current_pp: 0, pp: 0 });
      const status = PPManager.getPPStatus(zeroMaxPPMove);

      expect(status.pp_percentage).toBe(0);
      expect(status.is_usable).toBe(false);
    });
  });
});
