// 初学者向け：バトルシステムの型定義
// ポケモンライクなターン制バトルで使用するデータ構造

/**
 * 技データの型定義
 * 初学者向け：ポケモンが使用できる技の基本情報
 */
export interface 技データ {
  move_id: number;           // 技の一意識別子
  name: string;              // 技名（例：でんきショック、かみつく）
  type: 技タイプ;             // 技のタイプ（でんき、ノーマルなど）
  power: number;             // 技の威力（0-150程度）
  accuracy: number;          // 命中率（％、通常85-100）
  pp: number;                // 最大PP（使用可能回数）
  category: 技カテゴリ;       // 物理/特殊/変化
  description: string;       // 技の説明文
  created_at: string;        // データ作成日時
  updated_at: string;        // データ更新日時
}

/**
 * 技タイプの定義
 * 初学者向け：ポケモンの技が持つ属性タイプ
 */
export type 技タイプ = 
  | 'ノーマル' 
  | 'でんき' 
  | 'みず' 
  | 'ひこう' 
  | 'くさ' 
  | 'ほのお'
  | 'じめん'
  | 'いわ'
  | 'かくとう'
  | 'エスパー';

/**
 * 技のカテゴリ定義
 * 初学者向け：技の攻撃方法による分類
 */
export type 技カテゴリ = 
  | '物理'    // 攻撃力を使った技（例：かみつく、たいあたり）
  | '特殊'    // 特攻を使った技（例：でんきショック、かえんほうしゃ）
  | '変化';   // ダメージを与えない技（例：でんこうせっか、かたくなる）

/**
 * ポケモンが覚えている技の情報
 * 初学者向け：個別ポケモンの技習得状況
 */
export interface ポケモン習得技 {
  pokemon_id: string;        // 所有ポケモンの識別子
  move_id: number;           // 技の識別子
  current_pp: number;        // 現在のPP（残り使用回数）
  learned_at: string;        // 技を習得した日時
}

/**
 * バトルに参戦するポケモンの情報
 * 初学者向け：バトル中のポケモン状態
 */
export interface 参戦ポケモン {
  pokemon_id: string;        // ポケモンの識別子
  species_id: number;        // 種族ID（ピカチュウ=25など）
  name: string;              // ポケモン名
  nickname?: string;         // ニックネーム（あれば）
  level: number;             // レベル
  current_hp: number;        // 現在のHP
  max_hp: number;            // 最大HP
  attack: number;            // 攻撃力
  defense: number;           // 防御力
  sprite_url: string;        // スプライト画像のURL
  moves: 習得技詳細[];       // 覚えている技のリスト
  status_condition?: 状態異常; // 状態異常（あれば）
}

/**
 * ポケモンの習得技詳細情報
 * 初学者向け：バトルで使用可能な技の完全情報
 */
export interface 習得技詳細 extends 技データ {
  current_pp: number;        // 現在のPP（残り使用回数）
}

/**
 * ポケモンの状態異常
 * 初学者向け：バトル中の特殊状態
 */
export type 状態異常 = 
  | 'どく'     // 毎ターンダメージ
  | 'まひ'     // 行動不能の可能性
  | 'やけど'   // 毎ターンダメージ+攻撃力低下
  | 'こおり'   // 行動不能
  | 'ねむり';  // 数ターン行動不能

/**
 * バトルセッションの情報
 * 初学者向け：進行中のバトルの管理情報
 */
export interface バトルセッション {
  battle_id: string;         // バトルの一意識別子
  player_id: string;         // プレイヤーID
  player_pokemon_id: string; // プレイヤーのポケモンID
  enemy_pokemon_id: string;  // 敵ポケモンID
  battle_type: バトル種別;    // バトルの種類
  status: バトルステータス;        // 現在の状態
  current_turn: number;      // 現在のターン数
  phase: バトルフェーズ;     // 現在のフェーズ
  winner?: '味方' | '敵' | '引き分け'; // 勝者（終了時）
  created_at: string;        // バトル開始日時
  ended_at?: string;         // バトル終了日時
}

/**
 * バトルの種別
 * 初学者向け：どのような種類のバトルか
 */
export type バトル種別 = 
  | '野生'      // 野生ポケモンとの戦闘
  | 'トレーナー'; // NPCトレーナーとの戦闘

/**
 * バトルの進行状態
 * 初学者向け：バトルの現在の状況
 */
export type バトルステータス = 
  | '進行中'    // バトル継続中
  | '終了';     // バトル完了

/**
 * バトルの進行フェーズ
 * 初学者向け：ターン内での詳細な段階
 */
export type バトルフェーズ = 
  | 'コマンド選択'    // プレイヤーの行動選択待ち
  | '技選択'          // 技リストから選択中
  | '技実行確認'      // 選択した技の実行確認
  | 'ダメージ計算'    // 技の効果計算中
  | 'アニメーション'  // エフェクト再生中
  | 'バトル終了';     // 勝敗決定後の処理

/**
 * バトルの完全な状態情報
 * 初学者向け：フロントエンドで管理するバトルの全データ
 */
export interface バトル状態 {
  session: バトルセッション;     // バトルセッション情報
  player_pokemon: 参戦ポケモン;  // プレイヤーのポケモン
  enemy_pokemon: 参戦ポケモン;   // 敵ポケモン
  selected_move?: 技データ;      // 選択中の技
  recent_logs: バトルログ[];     // 最近のバトルログ
  is_loading: boolean;           // 処理中フラグ
  error_message?: string;        // エラーメッセージ
}

/**
 * バトルのログ情報
 * 初学者向け：バトル中の行動記録
 */
export interface バトルログ {
  log_id: number;                // ログの識別子
  battle_id: string;             // 関連するバトルID
  turn_number: number;           // ターン番号
  action_type: 行動種別;         // 行動の種類
  acting_pokemon: string;        // 行動したポケモン名
  move_id?: number;              // 使用した技ID（技使用時）
  damage_dealt: number;          // 与えたダメージ
  message: string;               // バトルメッセージ
  created_at: string;            // 行動日時
}

/**
 * バトル中の行動種別
 * 初学者向け：ターン中に実行できる行動の種類
 */
export type 行動種別 = 
  | '技使用'      // 技を使って攻撃
  | 'アイテム'    // アイテムを使用
  | 'ポケモン交代' // 別のポケモンに交代
  | '逃げる';     // バトルから逃走

/**
 * 技使用のリクエスト
 * 初学者向け：APIに送信する技使用データ
 */
export interface 技使用リクエスト {
  battle_id: string;             // バトルID
  pokemon_id: string;            // 技を使うポケモンID
  move_id: number;               // 使用する技ID
  target: '敵' | '味方';         // 技の対象
}

/**
 * 技使用の結果
 * 初学者向け：技使用後のバトル状況
 */
export interface 技使用結果 {
  success: boolean;              // 成功/失敗
  move_name: string;             // 使用した技名
  damage_dealt: number;          // 与えたダメージ
  critical_hit: boolean;         // クリティカルヒット判定
  effectiveness: 効果判定;       // 技の効果度
  attacker_hp: number;           // 攻撃者の残りHP
  target_hp: number;             // 対象の残りHP
  battle_status: バトルステータス;     // バトルの継続状況
  winner?: '味方' | '敵' | '引き分け'; // 勝者（終了時）
  message: string;               // 結果メッセージ
  status_effects?: 状態異常[];   // 付与された状態異常
}

/**
 * 技の効果判定
 * 初学者向け：技がどの程度効果的だったか
 */
export type 効果判定 = 
  | '効果抜群'    // 2倍ダメージ
  | '普通'        // 等倍ダメージ
  | '効果今ひとつ' // 0.5倍ダメージ
  | '効果なし';   // 0倍ダメージ

/**
 * バトル開始のリクエスト
 * 初学者向け：新しいバトルを開始するためのデータ
 */
export interface バトル開始リクエスト {
  player_id: string;             // プレイヤーID
  player_pokemon_id: string;     // 参戦するプレイヤーポケモンID
  enemy_pokemon_id: string;      // 対戦相手のポケモンID
  battle_type: バトル種別;       // バトルの種類
}

/**
 * バトル開始の応答
 * 初学者向け：バトル開始後の初期状態
 */
export interface バトル開始応答 {
  success: boolean;              // 成功/失敗
  battle: バトル状態;            // 初期バトル状態
  error?: string;                // エラーメッセージ（失敗時）
}

/**
 * ダメージ計算の詳細結果
 * 初学者向け：ダメージ計算の内訳情報（デバッグ用）
 */
export interface ダメージ計算詳細 {
  base_damage: number;           // 基本ダメージ
  random_factor: number;         // ランダム補正
  critical_multiplier: number;   // クリティカル倍率
  type_effectiveness: number;    // タイプ相性倍率
  final_damage: number;          // 最終ダメージ
  calculation_formula: string;   // 計算式（学習用）
}

/**
 * バトル統計情報
 * 初学者向け：バトル終了後の詳細データ
 */
export interface バトル統計 {
  total_turns: number;           // 総ターン数
  total_damage_dealt: number;    // 与えた総ダメージ
  total_damage_received: number; // 受けた総ダメージ
  moves_used: number;            // 使用した技の回数
  critical_hits: number;        // クリティカルヒット回数
  battle_duration: number;       // バトル時間（秒）
}