// 初学者向け：ポケモン管理システムの型定義
// このファイルではポケモンに関連するすべてのデータ構造を定義します

/**
 * ポケモンのタイプ
 * 初学者向け：ポケモンの属性を表す列挙型です
 */
export enum ポケモンタイプ {
  ノーマル = "ノーマル",
  ほのお = "ほのお", 
  みず = "みず",
  でんき = "でんき",
  くさ = "くさ",
  こおり = "こおり",
  かくとう = "かくとう",
  どく = "どく",
  じめん = "じめん",
  ひこう = "ひこう",
  エスパー = "エスパー",
  むし = "むし",
  いわ = "いわ",
  ゴースト = "ゴースト",
  ドラゴン = "ドラゴン",
  あく = "あく",
  はがね = "はがね",
  フェアリー = "フェアリー",
}

/**
 * 技のカテゴリ
 * 初学者向け：技が物理攻撃、特殊攻撃、変化技のどれかを表します
 */
export enum 技カテゴリ {
  物理 = "物理",
  特殊 = "特殊", 
  変化 = "変化",
}

/**
 * ポケモンの性格
 * 初学者向け：ステータスに影響を与える性格です
 */
export enum ポケモン性格 {
  がんばりや = "がんばりや",
  さみしがり = "さみしがり",
  ゆうかん = "ゆうかん",
  いじっぱり = "いじっぱり",
  やんちゃ = "やんちゃ",
  ずぶとい = "ずぶとい",
  すなお = "すなお",
  のんき = "のんき",
  わんぱく = "わんぱく",
  のうてんき = "のうてんき",
  おくびょう = "おくびょう",
  せっかち = "せっかち",
  まじめ = "まじめ",
  ようき = "ようき",
  むじゃき = "むじゃき",
  ひかえめ = "ひかえめ",
  おっとり = "おっとり",
  れいせい = "れいせい",
  てれや = "てれや",
  うっかりや = "うっかりや",
  おだやか = "おだやか",
  おとなしい = "おとなしい",
  しんちょう = "しんちょう",
  きまぐれ = "きまぐれ",
  れんそ = "れんそ",
}

/**
 * 技習得方法
 * 初学者向け：技をどのように覚えるかの方法です
 */
export enum 技習得方法 {
  レベルアップ = "レベルアップ",
  技マシン = "技マシン",
  教え技 = "教え技",
  遺伝 = "遺伝",
}

/**
 * ポケモン種族の基本データ
 * 初学者向け：ピカチュウ、フシギダネなどの種族ごとの基本情報です
 */
export interface ポケモン種族データ {
  /** 種族ID */
  species_id: number;
  /** 種族名（日本語） */
  name: string;
  /** 種族名（英語） */
  name_en: string;
  /** タイプ1 */
  type1: ポケモンタイプ;
  /** タイプ2（単タイプの場合はnull） */
  type2?: ポケモンタイプ;
  /** 種族値HP */
  base_hp: number;
  /** 種族値攻撃 */
  base_attack: number;
  /** 種族値防御 */
  base_defense: number;
  /** 種族値特攻 */
  base_sp_attack: number;
  /** 種族値特防 */
  base_sp_defense: number;
  /** 種族値素早さ */
  base_speed: number;
  /** スプライト画像URL */
  sprite_url?: string;
  /** 種族の説明 */
  description?: string;
  /** 作成日時 */
  created_at: string;
}

/**
 * 技データ
 * 初学者向け：でんきショック、かみつくなどの技の情報です
 */
export interface 技データ {
  /** 技ID */
  move_id: number;
  /** 技名（日本語） */
  name: string;
  /** 技名（英語） */
  name_en: string;
  /** 技のタイプ */
  type: ポケモンタイプ;
  /** 技のカテゴリ */
  category: 技カテゴリ;
  /** 威力（変化技の場合はnull） */
  power?: number;
  /** 命中率 */
  accuracy: number;
  /** PP（使用回数） */
  pp: number;
  /** 技の説明 */
  description?: string;
  /** 作成日時 */
  created_at: string;
}

/**
 * 種族習得技
 * 初学者向け：各種族がレベルアップで覚える技の情報です
 */
export interface 種族習得技 {
  /** 種族ID */
  species_id: number;
  /** 技ID */
  move_id: number;
  /** 習得レベル */
  learn_level: number;
  /** 習得方法 */
  learn_method: 技習得方法;
}

/**
 * 個体値
 * 初学者向け：同じ種族でも個体による強さの違いを表します
 */
export interface 個体値 {
  /** HP個体値 */
  iv_hp: number;
  /** 攻撃個体値 */
  iv_attack: number;
  /** 防御個体値 */
  iv_defense: number;
  /** 特攻個体値 */
  iv_sp_attack: number;
  /** 特防個体値 */
  iv_sp_defense: number;
  /** 素早さ個体値 */
  iv_speed: number;
}

/**
 * 実際のステータス
 * 初学者向け：レベル、種族値、個体値から計算された実際の能力値です
 */
export interface 実際ステータス {
  /** HP */
  hp: number;
  /** 攻撃 */
  attack: number;
  /** 防御 */
  defense: number;
  /** 特攻 */
  sp_attack: number;
  /** 特防 */
  sp_defense: number;
  /** 素早さ */
  speed: number;
}

/**
 * ポケモンが覚えている技
 * 初学者向け：各ポケモンが現在覚えている技の情報です
 */
export interface ポケモン所持技 {
  /** ポケモンID */
  pokemon_id: string;
  /** 技ID */
  move_id: number;
  /** 技スロット（1-4） */
  slot: number;
  /** 現在PP */
  current_pp: number;
  /** 技データ */
  move: 技データ;
  /** 習得日時 */
  learned_at: string;
}

/**
 * ポケモンボックス
 * 初学者向け：ポケモンを保管する場所の情報です
 */
export interface ポケモンボックス {
  /** ボックスID */
  box_id: string;
  /** プレイヤーID */
  player_id: string;
  /** ボックス名 */
  name: string;
  /** ボックス番号 */
  box_number: number;
  /** 収容可能数 */
  capacity: number;
  /** 作成日時 */
  created_at: string;
}

/**
 * 所有ポケモン
 * 初学者向け：プレイヤーが捕まえた個々のポケモンの情報です
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
  /** 経験値 */
  experience: number;
  /** 個体値 */
  individual_values: 個体値;
  /** 性格 */
  nature: ポケモン性格;
  /** 現在HP */
  current_hp: number;
  /** ボックスID（パーティにいる場合はnull） */
  box_id?: string;
  /** ボックス内位置 */
  box_position?: number;
  /** 捕獲日時 */
  caught_at: string;
  /** 更新日時 */
  updated_at: string;
  /** 種族データ */
  species: ポケモン種族データ;
  /** 覚えている技 */
  moves: ポケモン所持技[];
  /** 実際のステータス */
  stats: 実際ステータス;
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
 * 初学者向け：新しいポケモンを捕獲する時のデータです
 */
export interface ポケモン捕獲リクエスト {
  /** 種族ID */
  species_id: number;
  /** レベル */
  level: number;
  /** ニックネーム（オプション） */
  nickname?: string;
  /** 個体値（指定しない場合はランダム生成） */
  individual_values?: Partial<個体値>;
  /** 性格（指定しない場合はランダム） */
  nature?: ポケモン性格;
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
 * ボックス移動リクエスト
 * 初学者向け：ポケモンをボックス間で移動する時のデータです
 */
export interface ボックス移動リクエスト {
  /** 移動するポケモンID */
  pokemon_id: string;
  /** 移動先ボックスID */
  target_box_id: string;
  /** 移動先位置 */
  target_position: number;
}

/**
 * 経験値獲得リクエスト
 * 初学者向け：バトル後などで経験値を獲得する時のデータです
 */
export interface 経験値獲得リクエスト {
  /** ポケモンID */
  pokemon_id: string;
  /** 獲得経験値 */
  gained_experience: number;
}

/**
 * 技習得リクエスト
 * 初学者向け：新しい技を覚える時のデータです
 */
export interface 技習得リクエスト {
  /** ポケモンID */
  pokemon_id: string;
  /** 覚える技ID */
  move_id: number;
  /** 技スロット（1-4） */
  slot: number;
}

/**
 * ポケモン検索フィルター
 * 初学者向け：ポケモンリストを絞り込む時の条件です
 */
export interface ポケモン検索フィルター {
  /** 種族名での検索 */
  species_name?: string;
  /** タイプでの絞り込み */
  type?: ポケモンタイプ;
  /** レベル範囲での絞り込み */
  level_min?: number;
  level_max?: number;
  /** ボックスでの絞り込み */
  box_id?: string;
  /** ページネーション */
  page?: number;
  limit?: number;
}

// 後方互換性のための型エイリアス
export type PokemonSpecies = ポケモン種族データ;
export type Move = 技データ;
export type OwnedPokemon = 所有ポケモン;
export type PokemonBox = ポケモンボックス;
export type PartyPokemon = パーティポケモン;