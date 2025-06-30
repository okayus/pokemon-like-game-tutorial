// ゲーム全体で使用する定数を定義
// 既存のconstants/game.tsの値を参照して統一
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT, TILE_SIZE } from './constants/game';

export const GAME_CONSTANTS = {
  // マップのサイズ（タイル数）
  マップ幅: VIEWPORT_WIDTH,
  マップ高さ: VIEWPORT_HEIGHT,
  
  // タイルのサイズ（ピクセル）
  タイルサイズ: TILE_SIZE,
  
  // プレイヤーの初期位置
  初期位置X: Math.floor(VIEWPORT_WIDTH / 2),
  初期位置Y: Math.floor(VIEWPORT_HEIGHT / 2),
  
  // 方向の定義
  方向: {
    上: 'up',
    下: 'down',
    左: 'left',
    右: 'right'
  } as const
} as const;