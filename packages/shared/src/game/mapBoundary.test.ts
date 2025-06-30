import { describe, it, expect } from 'vitest';
import { 移動可能かチェック } from './mapBoundary';
import { GAME_CONSTANTS } from '../constants';

describe('マップ境界チェック', () => {
  describe('移動可能かチェック', () => {
    it('マップ内の座標なら移動可能', () => {
      // マップの中央付近
      expect(移動可能かチェック(5, 5)).toBe(true);
      
      // マップの各角
      expect(移動可能かチェック(0, 0)).toBe(true);
      expect(移動可能かチェック(GAME_CONSTANTS.マップ幅 - 1, 0)).toBe(true);
      expect(移動可能かチェック(0, GAME_CONSTANTS.マップ高さ - 1)).toBe(true);
      expect(移動可能かチェック(GAME_CONSTANTS.マップ幅 - 1, GAME_CONSTANTS.マップ高さ - 1)).toBe(true);
    });

    it('マップ外の座標なら移動不可', () => {
      // X座標が範囲外
      expect(移動可能かチェック(-1, 5)).toBe(false);
      expect(移動可能かチェック(GAME_CONSTANTS.マップ幅, 5)).toBe(false);
      
      // Y座標が範囲外
      expect(移動可能かチェック(5, -1)).toBe(false);
      expect(移動可能かチェック(5, GAME_CONSTANTS.マップ高さ)).toBe(false);
      
      // 両方が範囲外
      expect(移動可能かチェック(-1, -1)).toBe(false);
      expect(移動可能かチェック(GAME_CONSTANTS.マップ幅, GAME_CONSTANTS.マップ高さ)).toBe(false);
    });
  });
});