// マップの境界チェックに関する関数
import { GAME_CONSTANTS } from '../constants';

/**
 * 指定された座標がマップ内に収まっているかチェックする
 * @param x - X座標（0から始まる）
 * @param y - Y座標（0から始まる）
 * @returns 移動可能ならtrue、不可能ならfalse
 */
export function 移動可能かチェック(x: number, y: number): boolean {
  // X座標が0以上かつマップ幅未満、Y座標が0以上かつマップ高さ未満なら移動可能
  return x >= 0 && x < GAME_CONSTANTS.マップ幅 && y >= 0 && y < GAME_CONSTANTS.マップ高さ;
}