// ゲームマップのデータ定義
import { タイルタイプ } from '../types/tile';
import { GAME_CONSTANTS } from '../constants';

// 町マップのデータ（初学者向け：15x11のマップレイアウトを定義）
export const 町マップ: タイルタイプ[][] = [
  // Y=0（上端）
  ['tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree'],
  // Y=1
  ['tree', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'tree'],
  // Y=2
  ['tree', 'grass', 'stone', 'grass', 'grass', 'tree', 'grass', 'grass', 'grass', 'tree', 'grass', 'grass', 'stone', 'grass', 'tree'],
  // Y=3
  ['tree', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'tree'],
  // Y=4
  ['tree', 'grass', 'grass', 'grass', 'water', 'water', 'grass', 'grass', 'grass', 'water', 'water', 'grass', 'grass', 'grass', 'tree'],
  // Y=5（中央・プレイヤー初期位置）
  ['tree', 'grass', 'tree', 'grass', 'water', 'water', 'grass', 'grass', 'grass', 'water', 'water', 'grass', 'tree', 'grass', 'tree'],
  // Y=6
  ['tree', 'grass', 'grass', 'grass', 'water', 'water', 'grass', 'grass', 'grass', 'water', 'water', 'grass', 'grass', 'grass', 'tree'],
  // Y=7
  ['tree', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'tree'],
  // Y=8
  ['tree', 'grass', 'stone', 'grass', 'grass', 'tree', 'grass', 'grass', 'grass', 'tree', 'grass', 'grass', 'stone', 'grass', 'tree'],
  // Y=9
  ['tree', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'tree'],
  // Y=10（下端）
  ['tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree']
];

// マップデータの検証（初学者向け：サイズが正しいかチェック）
function マップサイズ検証(マップ: タイルタイプ[][]): void {
  if (マップ.length !== GAME_CONSTANTS.マップ高さ) {
    throw new Error(`マップの高さが正しくありません。期待値: ${GAME_CONSTANTS.マップ高さ}, 実際: ${マップ.length}`);
  }
  
  for (let y = 0; y < マップ.length; y++) {
    if (マップ[y].length !== GAME_CONSTANTS.マップ幅) {
      throw new Error(`マップの幅が正しくありません。Y=${y}, 期待値: ${GAME_CONSTANTS.マップ幅}, 実際: ${マップ[y].length}`);
    }
  }
}

// 町マップのサイズ検証を実行
マップサイズ検証(町マップ);

// マップ名とマップデータの対応（初学者向け：マップを名前で管理）
export const マップデータ = {
  town: 町マップ
} as const;