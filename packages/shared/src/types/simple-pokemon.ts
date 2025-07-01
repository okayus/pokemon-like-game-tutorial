// 初学者向け：シンプルなポケモン管理システムの型定義
// 最低限動作するポケモンライクゲームのための簡素化された型

/**
 * ポケモンマスタデータ
 * 初学者向け：ピカチュウ、フシギダネなどの種族ごとの基本情報です（簡素版）
 */
export interface ポケモンマスタ {
  /** 種族ID */
  species_id: number;
  /** 種族名（日本語） */
  name: string;
  /** 基本HP */
  hp: number;
  /** 基本攻撃力 */
  attack: number;
  /** 基本防御力 */
  defense: number;
  /** スプライト画像URL */
  sprite_url?: string;
  /** 作成日時 */
  created_at: string;
}

/**
 * 所有ポケモン
 * 初学者向け：プレイヤーが捕まえた個々のポケモンの情報です（簡素版）
 */
export interface 所有ポケモン {
  /** ポケモンID */
  pokemon_id: string;
  /** プレイヤーID */
  player_id: string;
  /** 種族ID */
  species_id: number;
  /** ニックネーム */
  nickname?: string;
  /** レベル */
  level: number;
  /** 現在HP */
  current_hp: number;
  /** 捕獲日時 */
  caught_at: string;
  /** 更新日時 */
  updated_at: string;
  /** 種族データ */
  species: ポケモンマスタ;
  /** 計算されたステータス */
  stats: 計算ステータス;
}

/**
 * 計算ステータス
 * 初学者向け：レベルと基本ステータスから計算された実際の能力値です
 */
export interface 計算ステータス {
  /** 最大HP */
  max_hp: number;
  /** 攻撃力 */
  attack: number;
  /** 防御力 */
  defense: number;
}

/**
 * パーティポケモン
 * 初学者向け：手持ちポケモンの並び順情報です
 */
export interface パーティポケモン {
  /** プレイヤーID */
  player_id: string;
  /** パーティ位置（1-6） */
  position: number;
  /** ポケモンID */
  pokemon_id: string;
  /** ポケモンデータ */
  pokemon: 所有ポケモン;
  /** 更新日時 */
  updated_at: string;
}

/**
 * ポケモン捕獲リクエスト
 * 初学者向け：新しいポケモンを捕獲する時のデータです（簡素版）
 */
export interface ポケモン捕獲リクエスト {
  /** 種族ID */
  species_id: number;
  /** レベル */
  level: number;
  /** ニックネーム（オプション） */
  nickname?: string;
}

/**
 * パーティ編成リクエスト
 * 初学者向け：パーティの並び順を変更する時のデータです
 */
export interface パーティ編成リクエスト {
  /** パーティ位置 */
  position: number;
  /** ポケモンID（nullの場合はその位置を空にする） */
  pokemon_id?: string;
}

/**
 * ポケモン更新リクエスト
 * 初学者向け：ポケモンの情報を更新する時のデータです
 */
export interface ポケモン更新リクエスト {
  /** ニックネーム */
  nickname?: string;
  /** 現在HP */
  current_hp?: number;
}

/**
 * ポケモン検索フィルター
 * 初学者向け：ポケモンリストを絞り込む時の条件です（簡素版）
 */
export interface ポケモン検索フィルター {
  /** 種族名での検索 */
  species_name?: string;
  /** レベル範囲での絞り込み */
  level_min?: number;
  level_max?: number;
  /** ページネーション */
  page?: number;
  limit?: number;
}

// 後方互換性のための型エイリアス
export type PokemonMaster = ポケモンマスタ;
export type OwnedPokemon = 所有ポケモン;
export type PartyPokemon = パーティポケモン;
export type PokemonCatchRequest = ポケモン捕獲リクエスト;
export type PartyUpdateRequest = パーティ編成リクエスト;