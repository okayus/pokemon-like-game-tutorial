// 初学者向け：バトル計算ユーティリティのテスト
// TDDアプローチでダメージ計算や判定ロジックをテスト

import { describe, it, expect, vi } from 'vitest';
import {
  基本ダメージ計算,
  詳細ダメージ計算,
  クリティカル判定,
  命中判定,
  HP計算,
  戦闘不能判定,
  バトル終了判定,
  タイプ相性計算,
  経験値計算,
  ダメージ範囲計算,
  PP消費,
  PP使用可能判定,
  バトルメッセージ生成
} from './battleCalculations';
import type { 参戦ポケモン, 技データ } from '../types/battle';

// テスト用のモックデータ
const createMockPokemon = (overrides?: Partial<参戦ポケモン>): 参戦ポケモン => ({
  pokemon_id: 'test-pokemon-001',
  species_id: 25,
  name: 'ピカチュウ',
  level: 15,
  current_hp: 45,
  max_hp: 45,
  attack: 55,
  defense: 40,
  sprite_url: '/sprites/pikachu.png',
  moves: [],
  ...overrides
});

const createMockMove = (overrides?: Partial<技データ>): 技データ => ({
  move_id: 4,
  name: 'でんきショック',
  type: 'でんき',
  power: 40,
  accuracy: 100,
  pp: 30,
  category: '特殊',
  description: '電気の刺激で相手を攻撃する。',
  created_at: '2025-07-02 00:00:00',
  updated_at: '2025-07-02 00:00:00',
  ...overrides
});

describe('battleCalculations', () => {
  describe('基本ダメージ計算', () => {
    it('正常にダメージを計算できる', () => {
      const attacker = createMockPokemon({ attack: 50 });
      const defender = createMockPokemon({ defense: 40 });
      const move = createMockMove({ power: 40 });

      const damage = 基本ダメージ計算(attacker, defender, move);

      // (50 * 40) / 40 = 50 の 85%〜100% = 42〜50
      expect(damage).toBeGreaterThanOrEqual(42);
      expect(damage).toBeLessThanOrEqual(50);
    });

    it('技威力0の場合はダメージ0を返す', () => {
      const attacker = createMockPokemon();
      const defender = createMockPokemon();
      const move = createMockMove({ power: 0, category: '変化' });

      const damage = 基本ダメージ計算(attacker, defender, move);

      expect(damage).toBe(0);
    });

    it('最低1ダメージが保証される', () => {
      const attacker = createMockPokemon({ attack: 1 });
      const defender = createMockPokemon({ defense: 999 });
      const move = createMockMove({ power: 1 });

      const damage = 基本ダメージ計算(attacker, defender, move);

      expect(damage).toBeGreaterThanOrEqual(1);
    });
  });

  describe('詳細ダメージ計算', () => {
    it('計算詳細を含む結果を返す', () => {
      const attacker = createMockPokemon({ attack: 50 });
      const defender = createMockPokemon({ defense: 40 });
      const move = createMockMove({ power: 40 });

      // ランダム要素をモック
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // ランダム補正は0.925、クリティカルなし

      const result = 詳細ダメージ計算(attacker, defender, move);

      expect(result.base_damage).toBe(50); // (50 * 40) / 40
      expect(result.random_factor).toBeCloseTo(0.925, 3);
      expect(result.critical_multiplier).toBe(1);
      expect(result.type_effectiveness).toBe(1);
      expect(result.final_damage).toBe(46); // 50 * 0.925
      expect(result.calculation_formula).toContain('50 × 40');

      vi.restoreAllMocks();
    });

    it('クリティカルヒットが反映される', () => {
      const attacker = createMockPokemon({ attack: 50 });
      const defender = createMockPokemon({ defense: 40 });
      const move = createMockMove({ power: 40 });

      // クリティカルヒットするようにモック
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.5) // ランダム補正
        .mockReturnValueOnce(0.01); // クリティカル判定

      const result = 詳細ダメージ計算(attacker, defender, move);

      expect(result.critical_multiplier).toBe(1.5);
      expect(result.calculation_formula).toContain('クリティカル');

      vi.restoreAllMocks();
    });
  });

  describe('クリティカル判定', () => {
    it('約6.25%の確率でtrueを返す', () => {
      const results = [];
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        results.push(クリティカル判定());
      }

      const criticalCount = results.filter(r => r).length;
      const criticalRate = criticalCount / iterations;

      // 6.25% ± 1% の範囲であることを確認
      expect(criticalRate).toBeGreaterThan(0.0525);
      expect(criticalRate).toBeLessThan(0.0725);
    });
  });

  describe('命中判定', () => {
    it('命中率100%の技は必ず命中する', () => {
      const move = createMockMove({ accuracy: 100 });

      for (let i = 0; i < 100; i++) {
        expect(命中判定(move)).toBe(true);
      }
    });

    it('命中率に応じて確率的に命中する', () => {
      const move = createMockMove({ accuracy: 80 });
      const results = [];
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        results.push(命中判定(move));
      }

      const hitCount = results.filter(r => r).length;
      const hitRate = hitCount / iterations;

      // 80% ± 5% の範囲であることを確認
      expect(hitRate).toBeGreaterThan(0.75);
      expect(hitRate).toBeLessThan(0.85);
    });
  });

  describe('HP計算', () => {
    it('ダメージ分HPが減少する', () => {
      const newHp = HP計算(45, 18);
      expect(newHp).toBe(27);
    });

    it('HPは0未満にならない', () => {
      const newHp = HP計算(10, 20);
      expect(newHp).toBe(0);
    });
  });

  describe('戦闘不能判定', () => {
    it('HP0以下で戦闘不能と判定される', () => {
      const pokemon1 = createMockPokemon({ current_hp: 0 });
      const pokemon2 = createMockPokemon({ current_hp: -5 });

      expect(戦闘不能判定(pokemon1)).toBe(true);
      expect(戦闘不能判定(pokemon2)).toBe(true);
    });

    it('HP1以上で戦闘可能と判定される', () => {
      const pokemon = createMockPokemon({ current_hp: 1 });
      expect(戦闘不能判定(pokemon)).toBe(false);
    });
  });

  describe('バトル終了判定', () => {
    it('敵が戦闘不能で味方の勝利', () => {
      const player = createMockPokemon({ current_hp: 30 });
      const enemy = createMockPokemon({ current_hp: 0 });

      expect(バトル終了判定(player, enemy)).toBe('味方');
    });

    it('味方が戦闘不能で敵の勝利', () => {
      const player = createMockPokemon({ current_hp: 0 });
      const enemy = createMockPokemon({ current_hp: 20 });

      expect(バトル終了判定(player, enemy)).toBe('敵');
    });

    it('両方戦闘不能で引き分け', () => {
      const player = createMockPokemon({ current_hp: 0 });
      const enemy = createMockPokemon({ current_hp: 0 });

      expect(バトル終了判定(player, enemy)).toBe('引き分け');
    });

    it('両方健在でバトル継続', () => {
      const player = createMockPokemon({ current_hp: 30 });
      const enemy = createMockPokemon({ current_hp: 20 });

      expect(バトル終了判定(player, enemy)).toBeNull();
    });
  });

  describe('タイプ相性計算', () => {
    it('現在は常に普通を返す（未実装）', () => {
      expect(タイプ相性計算()).toBe('普通');
      expect(タイプ相性計算()).toBe('普通');
      expect(タイプ相性計算()).toBe('普通');
    });
  });

  describe('経験値計算', () => {
    it('基本経験値を計算できる', () => {
      const exp = 経験値計算(15, 12);
      // 基本経験値 = 12 * 10 = 120
      // レベル差 = 12 - 15 = -3
      // 補正 = 1 + (-3 * 0.1) = 0.7
      // 最終経験値 = 120 * 0.7 = 84
      expect(exp).toBe(84);
    });

    it('レベル差が大きい場合の補正が機能する', () => {
      const exp1 = 経験値計算(5, 20); // 高レベルを倒す
      const exp2 = 経験値計算(20, 5);  // 低レベルを倒す

      expect(exp1).toBeGreaterThan(exp2);
      expect(exp1).toBe(300); // 200 * 1.5
      expect(exp2).toBe(25);  // 50 * 0.5
    });
  });

  describe('ダメージ範囲計算', () => {
    it('最小・最大ダメージを計算できる', () => {
      const attacker = createMockPokemon({ attack: 50 });
      const defender = createMockPokemon({ defense: 40 });
      const move = createMockMove({ power: 40 });

      const range = ダメージ範囲計算(attacker, defender, move);

      expect(range.最小ダメージ).toBe(42); // 50 * 0.85
      expect(range.最大ダメージ).toBe(50); // 50 * 1.0
    });

    it('技威力0の場合は0を返す', () => {
      const attacker = createMockPokemon();
      const defender = createMockPokemon();
      const move = createMockMove({ power: 0 });

      const range = ダメージ範囲計算(attacker, defender, move);

      expect(range.最小ダメージ).toBe(0);
      expect(range.最大ダメージ).toBe(0);
    });
  });

  describe('PP操作', () => {
    it('PP消費が正しく動作する', () => {
      expect(PP消費(30, 1)).toBe(29);
      expect(PP消費(5, 3)).toBe(2);
    });

    it('PPは0未満にならない', () => {
      expect(PP消費(2, 5)).toBe(0);
      expect(PP消費(0, 1)).toBe(0);
    });

    it('PP使用可能判定が正しく動作する', () => {
      expect(PP使用可能判定(10)).toBe(true);
      expect(PP使用可能判定(1)).toBe(true);
      expect(PP使用可能判定(0)).toBe(false);
    });
  });

  describe('バトルメッセージ生成', () => {
    it('通常の攻撃メッセージを生成できる', () => {
      const message = バトルメッセージ生成('ピカチュウ', 'でんきショック', 18);
      expect(message).toBe('ピカチュウの でんきショック！ 18のダメージ！');
    });

    it('クリティカルヒット時のメッセージ', () => {
      const message = バトルメッセージ生成('ピカチュウ', 'でんきショック', 27, true);
      expect(message).toBe('ピカチュウの でんきショック！ 27のダメージ！ きゅうしょにあたった！');
    });

    it('タイプ相性を含むメッセージ', () => {
      const message1 = バトルメッセージ生成('ピカチュウ', 'でんきショック', 36, false, '効果抜群');
      expect(message1).toContain('こうかはばつぐんだ！');

      const message2 = バトルメッセージ生成('ピカチュウ', 'でんきショック', 9, false, '効果今ひとつ');
      expect(message2).toContain('こうかはいまひとつのようだ...');

      const message3 = バトルメッセージ生成('ピカチュウ', 'でんきショック', 0, false, '効果なし');
      expect(message3).toContain('こうかがないようだ...');
    });

    it('ダメージ0の技（変化技）のメッセージ', () => {
      const message = バトルメッセージ生成('ピカチュウ', 'かたくなる', 0);
      expect(message).toBe('ピカチュウの かたくなる！');
    });
  });
});