// セーブデータに関する型定義（初学者向け：ゲームの保存データの構造を定義）

import { Direction } from './game';

/**
 * セーブデータの構造
 */
export interface セーブデータ {
  // セーブデータのバージョン（初学者向け：将来の互換性のため）
  version: string;

  // プレイヤー情報
  player: {
    name: string;
    position: { x: number; y: number };
    direction: Direction;
  };

  // 現在のマップ
  currentMap: string;

  // プレイ時間（秒単位）
  playTime: number;

  // 保存日時（ISO 8601形式）
  savedAt: string;
}

/**
 * セーブスロット情報（初学者向け：セーブデータと追加情報を含む）
 */
export interface セーブスロット {
  // スロット番号（1〜3）
  slot: number;

  // セーブデータ
  data: セーブデータ;

  // 最終更新日時
  updatedAt: string;
}
