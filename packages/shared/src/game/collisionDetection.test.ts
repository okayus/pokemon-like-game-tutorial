import { describe, it, expect } from 'vitest';
import { 移動先が通行可能かチェック } from './collisionDetection';
import { タイルタイプ } from '../types/tile';

describe('衝突判定', () => {
  describe('移動先が通行可能かチェック', () => {
    // テスト用のマップデータ（初学者向け：3x3の小さなマップで動作確認）
    const テストマップ: タイルタイプ[][] = [
      ['grass', 'tree', 'grass'],
      ['grass', 'grass', 'stone'],
      ['water', 'grass', 'grass'],
    ];

    it('草タイルは通行可能', () => {
      // 草タイルの座標をテスト
      expect(移動先が通行可能かチェック(0, 0, テストマップ)).toBe(true);
      expect(移動先が通行可能かチェック(1, 1, テストマップ)).toBe(true);
      expect(移動先が通行可能かチェック(2, 2, テストマップ)).toBe(true);
    });

    it('木タイルは通行不可', () => {
      // 木タイルの座標 (1, 0)
      expect(移動先が通行可能かチェック(1, 0, テストマップ)).toBe(false);
    });

    it('石タイルは通行不可', () => {
      // 石タイルの座標 (2, 1)
      expect(移動先が通行可能かチェック(2, 1, テストマップ)).toBe(false);
    });

    it('水タイルは通行不可', () => {
      // 水タイルの座標 (0, 2)
      expect(移動先が通行可能かチェック(0, 2, テストマップ)).toBe(false);
    });

    it('マップ範囲外は通行不可', () => {
      // 範囲外の座標
      expect(移動先が通行可能かチェック(-1, 0, テストマップ)).toBe(false);
      expect(移動先が通行可能かチェック(3, 0, テストマップ)).toBe(false);
      expect(移動先が通行可能かチェック(0, -1, テストマップ)).toBe(false);
      expect(移動先が通行可能かチェック(0, 3, テストマップ)).toBe(false);
    });
  });
});
