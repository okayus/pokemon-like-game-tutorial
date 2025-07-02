// 初学者向け：アイテム・インベントリシステムの型定義
// ゲーム内で使用されるアイテムとインベントリの構造を定義

/**
 * アイテムカテゴリの種類
 * 初学者向け：アイテムを分類するためのカテゴリ
 */
export type アイテムカテゴリ = 
  | '回復'          // きずぐすり、ポーション系
  | 'ボール'        // モンスターボール、スーパーボール系
  | '戦闘'          // 攻撃力アップ、防御力アップ系
  | '大切なもの'    // ストーリーに関わる重要アイテム
  | 'その他';       // 上記に分類されないアイテム

/**
 * アイテムの効果タイプ
 * 初学者向け：アイテムを使用した時の効果の種類
 */
export type アイテム効果タイプ = 
  | 'HP回復'        // HPを回復する効果
  | 'PP回復'        // 技のPPを回復する効果
  | '状態異常回復'  // 毒、眠り等の状態異常を回復
  | '能力上昇'      // 攻撃力、防御力等を一時的に上昇
  | '捕獲'          // ポケモンを捕獲するためのアイテム
  | '進化'          // ポケモンを進化させるアイテム
  | 'イベント'      // ストーリー進行に使用するアイテム
  | 'なし';         // 効果のないアイテム（売却専用など）

/**
 * アイテムマスターデータの型定義
 * 初学者向け：ゲーム内の全アイテムの基本情報
 */
export interface アイテムマスタ {
  /** アイテムID（一意識別子） */
  item_id: number;
  
  /** アイテム名 */
  name: string;
  
  /** アイテムの詳細説明 */
  description: string;
  
  /** アイテムカテゴリ */
  category: アイテムカテゴリ;
  
  /** 購入価格（0の場合は購入不可） */
  buy_price: number;
  
  /** 売却価格（0の場合は売却不可） */
  sell_price: number;
  
  /** 使用可能かどうか */
  usable: boolean;
  
  /** 効果タイプ */
  effect_type: アイテム効果タイプ;
  
  /** 効果値（回復量、上昇値など） */
  effect_value: number;
  
  /** アイテムアイコンのURL */
  icon_url: string;
  
  /** 最大スタック数（一つのスロットに持てる最大個数） */
  max_stack: number;
  
  /** 作成日時 */
  created_at: string;
  
  /** 更新日時 */
  updated_at: string;
}

/**
 * プレイヤーが所持するアイテムの型定義
 * 初学者向け：プレイヤーのインベントリ内のアイテム情報
 */
export interface プレイヤー所持アイテム {
  /** プレイヤーID */
  player_id: string;
  
  /** アイテムID */
  item_id: number;
  
  /** 所持個数 */
  quantity: number;
  
  /** 取得日時 */
  obtained_at: string;
  
  /** 更新日時 */
  updated_at: string;
}

/**
 * プレイヤーの所持金データ
 * 初学者向け：プレイヤーが持っているお金の情報
 */
export interface プレイヤー所持金 {
  /** プレイヤーID */
  player_id: string;
  
  /** 所持金額 */
  amount: number;
  
  /** 更新日時 */
  updated_at: string;
}

/**
 * インベントリ表示用の結合データ
 * 初学者向け：マスターデータと所持データを結合した表示用の型
 */
export interface インベントリアイテム extends アイテムマスタ {
  /** 所持個数 */
  quantity: number;
  
  /** 取得日時 */
  obtained_at: string;
}

/**
 * アイテム使用のリクエスト型
 * 初学者向け：アイテムを使用する時のAPI呼び出しパラメータ
 */
export interface アイテム使用リクエスト {
  /** プレイヤーID */
  player_id: string;
  
  /** 使用するアイテムID */
  item_id: number;
  
  /** 使用個数（通常は1） */
  quantity: number;
  
  /** 使用対象（ポケモンIDなど、アイテムによって異なる） */
  target_id?: string;
}

/**
 * アイテム使用の結果型
 * 初学者向け：アイテム使用後の結果情報
 */
export interface アイテム使用結果 {
  /** 成功フラグ */
  success: boolean;
  
  /** 結果メッセージ */
  message: string;
  
  /** 使用後の所持個数 */
  remaining_quantity: number;
  
  /** 効果の詳細（HPの回復量など） */
  effect_details?: {
    /** 効果対象の名前 */
    target_name: string;
    /** 効果の値 */
    effect_value: number;
    /** 効果前の値 */
    before_value?: number;
    /** 効果後の値 */
    after_value?: number;
  };
}

/**
 * ショップでの購入リクエスト型
 * 初学者向け：アイテムを購入する時のパラメータ
 */
export interface アイテム購入リクエスト {
  /** プレイヤーID */
  player_id: string;
  
  /** 購入するアイテムID */
  item_id: number;
  
  /** 購入個数 */
  quantity: number;
}

/**
 * ショップでの売却リクエスト型
 * 初学者向け：アイテムを売却する時のパラメータ
 */
export interface アイテム売却リクエスト {
  /** プレイヤーID */
  player_id: string;
  
  /** 売却するアイテムID */
  item_id: number;
  
  /** 売却個数 */
  quantity: number;
}

/**
 * 購入・売却の結果型
 * 初学者向け：取引後の結果情報
 */
export interface 取引結果 {
  /** 成功フラグ */
  success: boolean;
  
  /** 結果メッセージ */
  message: string;
  
  /** 取引後の所持金 */
  new_money_amount: number;
  
  /** 取引後のアイテム所持数 */
  new_item_quantity: number;
  
  /** 取引金額 */
  transaction_amount: number;
}

/**
 * インベントリ検索・フィルタリング用の型
 * 初学者向け：インベントリ画面での検索条件
 */
export interface インベントリフィルター {
  /** 検索キーワード（アイテム名） */
  search_keyword?: string;
  
  /** カテゴリフィルター */
  category?: アイテムカテゴリ;
  
  /** ソート順 */
  sort_by?: 'name' | 'category' | 'quantity' | 'obtained_at';
  
  /** 昇順・降順 */
  sort_order?: 'asc' | 'desc';
  
  /** ページネーション用のページ番号 */
  page?: number;
  
  /** 1ページあたりの件数 */
  limit?: number;
}

/**
 * インベントリAPI応答の型
 * 初学者向け：インベントリ取得APIの応答形式
 */
export interface インベントリ応答 {
  /** インベントリアイテムのリスト */
  items: インベントリアイテム[];
  
  /** 総アイテム種類数 */
  total_count: number;
  
  /** 現在のページ番号 */
  current_page: number;
  
  /** 総ページ数 */
  total_pages: number;
  
  /** プレイヤーの所持金 */
  player_money: number;
}

/**
 * エラー応答の型
 * 初学者向け：API呼び出しでエラーが発生した場合の応答
 */
export interface アイテムAPIエラー {
  /** エラーコード */
  code: string;
  
  /** エラーメッセージ */
  message: string;
  
  /** 詳細情報（デバッグ用） */
  details?: Record<string, unknown>;
}