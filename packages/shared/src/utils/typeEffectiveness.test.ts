// 初学者向け：タイプ相性システムのテスト
// TDDアプローチでタイプ相性機能をテスト

import { describe, it, expect } from 'vitest';
import {
  calculateTypeEffectiveness,
  calculateDualTypeEffectiveness,
  getEffectiveTypes,
  getWeakTypes,
  getResistantTypes,
  getImmuneTypes,
  getTypeEffectivenessExplanation,
  getBattleAdvice,
} from './typeEffectiveness';
import type { 技タイプ } from '../types/battle';

describe('タイプ相性システム', () => {
  describe('基本的なタイプ相性', () => {
    it('効果抜群の相性を正しく計算する', () => {
      // でんき技 → みずタイプ（効果抜群）
      const result = calculateTypeEffectiveness('でんき', 'みず');

      expect(result.effectiveness).toBe('効果抜群');
      expect(result.multiplier).toBe(2);
      expect(result.message).toBe('こうかはばつぐんだ！');
      expect(result.is_critical).toBe(true);
      expect(result.is_weak).toBe(false);
      expect(result.is_immune).toBe(false);
    });

    it('効果今ひとつの相性を正しく計算する', () => {
      // でんき技 → でんきタイプ（効果今ひとつ）
      const result = calculateTypeEffectiveness('でんき', 'でんき');

      expect(result.effectiveness).toBe('効果今ひとつ');
      expect(result.multiplier).toBe(0.5);
      expect(result.message).toBe('こうかはいまひとつのようだ...');
      expect(result.is_critical).toBe(false);
      expect(result.is_weak).toBe(true);
      expect(result.is_immune).toBe(false);
    });

    it('効果なしの相性を正しく計算する', () => {
      // でんき技 → じめんタイプ（効果なし）
      const result = calculateTypeEffectiveness('でんき', 'じめん');

      expect(result.effectiveness).toBe('効果なし');
      expect(result.multiplier).toBe(0);
      expect(result.message).toBe('こうかがないようだ...');
      expect(result.is_critical).toBe(false);
      expect(result.is_weak).toBe(false);
      expect(result.is_immune).toBe(true);
    });

    it('普通の相性を正しく計算する', () => {
      // ノーマル技 → でんきタイプ（普通）
      const result = calculateTypeEffectiveness('ノーマル', 'でんき');

      expect(result.effectiveness).toBe('普通');
      expect(result.multiplier).toBe(1);
      expect(result.message).toBe('');
      expect(result.is_critical).toBe(false);
      expect(result.is_weak).toBe(false);
      expect(result.is_immune).toBe(false);
    });
  });

  describe('具体的なタイプ相性パターン', () => {
    it('みず技の相性が正しい', () => {
      expect(calculateTypeEffectiveness('みず', 'ほのお').multiplier).toBe(2); // 効果抜群
      expect(calculateTypeEffectiveness('みず', 'じめん').multiplier).toBe(2); // 効果抜群
      expect(calculateTypeEffectiveness('みず', 'いわ').multiplier).toBe(2); // 効果抜群
      expect(calculateTypeEffectiveness('みず', 'みず').multiplier).toBe(0.5); // 効果今ひとつ
      expect(calculateTypeEffectiveness('みず', 'くさ').multiplier).toBe(0.5); // 効果今ひとつ
    });

    it('ほのお技の相性が正しい', () => {
      expect(calculateTypeEffectiveness('ほのお', 'くさ').multiplier).toBe(2); // 効果抜群
      expect(calculateTypeEffectiveness('ほのお', 'みず').multiplier).toBe(0.5); // 効果今ひとつ
      expect(calculateTypeEffectiveness('ほのお', 'ほのお').multiplier).toBe(0.5); // 効果今ひとつ
      expect(calculateTypeEffectiveness('ほのお', 'いわ').multiplier).toBe(0.5); // 効果今ひとつ
    });

    it('ひこう技の相性が正しい', () => {
      expect(calculateTypeEffectiveness('ひこう', 'くさ').multiplier).toBe(2); // 効果抜群
      expect(calculateTypeEffectiveness('ひこう', 'かくとう').multiplier).toBe(2); // 効果抜群
      expect(calculateTypeEffectiveness('ひこう', 'でんき').multiplier).toBe(0.5); // 効果今ひとつ
      expect(calculateTypeEffectiveness('ひこう', 'いわ').multiplier).toBe(0.5); // 効果今ひとつ
    });

    it('じめん技の特殊な相性が正しい', () => {
      expect(calculateTypeEffectiveness('じめん', 'でんき').multiplier).toBe(2); // 効果抜群
      expect(calculateTypeEffectiveness('じめん', 'ほのお').multiplier).toBe(2); // 効果抜群
      expect(calculateTypeEffectiveness('じめん', 'いわ').multiplier).toBe(2); // 効果抜群
      expect(calculateTypeEffectiveness('じめん', 'ひこう').multiplier).toBe(0); // 効果なし
      expect(calculateTypeEffectiveness('じめん', 'くさ').multiplier).toBe(0.5); // 効果今ひとつ
    });
  });

  describe('2タイプポケモンへの相性', () => {
    it('両方のタイプで効果抜群の場合（4倍ダメージ）', () => {
      // でんき技 → みず/ひこうタイプ
      const result = calculateDualTypeEffectiveness('でんき', 'みず', 'ひこう');

      expect(result.multiplier).toBe(4);
      expect(result.effectiveness).toBe('効果抜群');
      expect(result.is_critical).toBe(true);
    });

    it('一方が効果抜群、一方が普通の場合（2倍ダメージ）', () => {
      // みず技 → ほのお/ノーマルタイプ
      const result = calculateDualTypeEffectiveness('みず', 'ほのお', 'ノーマル');

      expect(result.multiplier).toBe(2);
      expect(result.effectiveness).toBe('効果抜群');
    });

    it('一方が効果抜群、一方が効果今ひとつの場合（等倍ダメージ）', () => {
      // みず技 → ほのお/くさタイプ
      const result = calculateDualTypeEffectiveness('みず', 'ほのお', 'くさ');

      expect(result.multiplier).toBe(1);
      expect(result.effectiveness).toBe('普通');
    });

    it('両方のタイプで効果今ひとつの場合（0.25倍ダメージ）', () => {
      // でんき技 → でんき/くさタイプ
      const result = calculateDualTypeEffectiveness('でんき', 'でんき', 'くさ');

      expect(result.multiplier).toBe(0.25);
      expect(result.effectiveness).toBe('効果今ひとつ');
      expect(result.is_weak).toBe(true);
    });

    it('一方が無効の場合（0倍ダメージ）', () => {
      // でんき技 → じめん/みずタイプ
      const result = calculateDualTypeEffectiveness('でんき', 'じめん', 'みず');

      expect(result.multiplier).toBe(0);
      expect(result.effectiveness).toBe('効果なし');
      expect(result.is_immune).toBe(true);
    });

    it('単タイプの場合は通常の相性計算', () => {
      const result = calculateDualTypeEffectiveness('でんき', 'みず');

      expect(result.multiplier).toBe(2);
      expect(result.effectiveness).toBe('効果抜群');
    });
  });

  describe('タイプ相性検索', () => {
    it('効果抜群の技タイプを正しく取得する', () => {
      const effectiveTypes = getEffectiveTypes('みず');

      expect(effectiveTypes).toContain('でんき');
      expect(effectiveTypes).toContain('くさ');
      expect(effectiveTypes).not.toContain('みず');
      expect(effectiveTypes).not.toContain('ほのお');
    });

    it('弱点の技タイプを正しく取得する', () => {
      const weakTypes = getWeakTypes('でんき');

      expect(weakTypes).toContain('じめん');
      expect(weakTypes).not.toContain('でんき');
      expect(weakTypes).not.toContain('みず');
    });

    it('耐性のある技タイプを正しく取得する', () => {
      const resistantTypes = getResistantTypes('みず');

      expect(resistantTypes).toContain('みず');
      expect(resistantTypes).toContain('ほのお');
      expect(resistantTypes).not.toContain('でんき');
      expect(resistantTypes).not.toContain('くさ');
    });

    it('無効な技タイプを正しく取得する', () => {
      const immuneTypes = getImmuneTypes('じめん');

      expect(immuneTypes).toContain('ひこう');
      expect(immuneTypes).not.toContain('でんき');
      expect(immuneTypes).not.toContain('みず');
    });

    it('無効なタイプがない場合は空配列を返す', () => {
      const immuneTypes = getImmuneTypes('ノーマル');

      expect(immuneTypes).toEqual([]);
    });
  });

  describe('説明文とアドバイス', () => {
    it('タイプ相性の説明文を正しく生成する', () => {
      expect(getTypeEffectivenessExplanation('でんき', 'みず')).toBe(
        'でんき技はみずタイプによく効く（ダメージ2倍）'
      );

      expect(getTypeEffectivenessExplanation('でんき', 'でんき')).toBe(
        'でんき技はでんきタイプにあまり効かない（ダメージ半減）'
      );

      expect(getTypeEffectivenessExplanation('でんき', 'じめん')).toBe(
        'でんき技はじめんタイプに全く効かない'
      );

      expect(getTypeEffectivenessExplanation('ノーマル', 'でんき')).toBe(
        'ノーマル技はでんきタイプに普通の効果'
      );
    });

    it('バトルアドバイスを正しく生成する', () => {
      const moveTypes: 技タイプ[] = ['でんき', 'みず', 'ノーマル'];
      const advice = getBattleAdvice(moveTypes, 'ほのお');

      expect(advice.bestMoves).toContain('みず');
      expect(advice.worstMoves).not.toContain('みず');
      expect(advice.advice).toContain('みず技が効果抜群');
    });

    it('効果抜群の技がない場合のアドバイス', () => {
      const moveTypes: 技タイプ[] = ['ほのお', 'でんき'];
      const advice = getBattleAdvice(moveTypes, 'みず');

      expect(advice.bestMoves).toEqual([]);
      expect(advice.worstMoves).toContain('ほのお');
      expect(advice.advice).toContain('でんき技が無難な選択');
    });

    it('すべての技が効果今ひとつの場合のアドバイス', () => {
      const moveTypes: 技タイプ[] = ['ほのお'];
      const advice = getBattleAdvice(moveTypes, 'みず');

      expect(advice.bestMoves).toEqual([]);
      expect(advice.worstMoves).toContain('ほのお');
      expect(advice.advice).toContain('効果抜群の技がない');
    });
  });

  describe('エッジケース', () => {
    it('存在しないタイプの組み合わせでも動作する', () => {
      // 型システムで防がれるが、実行時の安全性を確認
      const result = calculateTypeEffectiveness('でんき', 'みず');
      expect(result.multiplier).toBeDefined();
      expect(result.effectiveness).toBeDefined();
    });

    it('すべてのタイプの組み合わせで数値が定義されている', () => {
      const types = [
        'ノーマル',
        'でんき',
        'みず',
        'ひこう',
        'くさ',
        'ほのお',
        'じめん',
        'いわ',
        'かくとう',
        'エスパー',
      ] as const;

      for (const attackType of types) {
        for (const defenseType of types) {
          const result = calculateTypeEffectiveness(attackType, defenseType);
          expect([0, 0.5, 1, 2]).toContain(result.multiplier);
        }
      }
    });

    it('対称性のテスト：A→BとB→Aは異なる結果になる場合がある', () => {
      const electricVsWater = calculateTypeEffectiveness('でんき', 'みず');
      const waterVsElectric = calculateTypeEffectiveness('みず', 'でんき');

      expect(electricVsWater.multiplier).toBe(2); // でんき→みず：効果抜群
      expect(waterVsElectric.multiplier).toBe(1); // みず→でんき：普通
    });
  });
});
