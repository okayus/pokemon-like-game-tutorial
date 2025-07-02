// 初学者向け：技マスターデータ
// ポケモンが使用できる技の基本情報データベース

import type { 技データ } from '../types/battle';

/**
 * 技マスターデータ
 * 初学者向け：ゲーム内で使用可能な全ての技の定義
 */
export const 技マスターデータ: 技データ[] = [
  // ノーマルタイプの技
  {
    move_id: 1,
    name: 'たいあたり',
    type: 'ノーマル',
    power: 40,
    accuracy: 100,
    pp: 35,
    category: '物理',
    description: '全身で相手にぶつかって攻撃する。',
    created_at: '2025-07-02 00:00:00',
    updated_at: '2025-07-02 00:00:00'
  },
  {
    move_id: 2,
    name: 'ひっかく',
    type: 'ノーマル',
    power: 40,
    accuracy: 100,
    pp: 35,
    category: '物理',
    description: 'するどいツメで相手をひっかいて攻撃する。',
    created_at: '2025-07-02 00:00:00',
    updated_at: '2025-07-02 00:00:00'
  },
  {
    move_id: 3,
    name: 'かみつく',
    type: 'ノーマル',
    power: 60,
    accuracy: 100,
    pp: 25,
    category: '物理',
    description: 'するどい歯で相手をかみついて攻撃する。',
    created_at: '2025-07-02 00:00:00',
    updated_at: '2025-07-02 00:00:00'
  },

  // でんきタイプの技
  {
    move_id: 4,
    name: 'でんきショック',
    type: 'でんき',
    power: 40,
    accuracy: 100,
    pp: 30,
    category: '特殊',
    description: '電気の刺激で相手を攻撃する。まひ状態にすることがある。',
    created_at: '2025-07-02 00:00:00',
    updated_at: '2025-07-02 00:00:00'
  },
  {
    move_id: 5,
    name: '10まんボルト',
    type: 'でんき',
    power: 90,
    accuracy: 100,
    pp: 15,
    category: '特殊',
    description: '強い電撃で相手を攻撃する。まひ状態にすることがある。',
    created_at: '2025-07-02 00:00:00',
    updated_at: '2025-07-02 00:00:00'
  },

  // みずタイプの技
  {
    move_id: 6,
    name: 'みずでっぽう',
    type: 'みず',
    power: 40,
    accuracy: 100,
    pp: 25,
    category: '特殊',
    description: '水を勢いよく相手にかけて攻撃する。',
    created_at: '2025-07-02 00:00:00',
    updated_at: '2025-07-02 00:00:00'
  },
  {
    move_id: 7,
    name: 'バブルこうせん',
    type: 'みず',
    power: 65,
    accuracy: 100,
    pp: 20,
    category: '特殊',
    description: '泡を勢いよく相手に発射して攻撃する。',
    created_at: '2025-07-02 00:00:00',
    updated_at: '2025-07-02 00:00:00'
  },

  // ひこうタイプの技
  {
    move_id: 8,
    name: 'つつく',
    type: 'ひこう',
    power: 35,
    accuracy: 100,
    pp: 35,
    category: '物理',
    description: 'くちばしで相手をついて攻撃する。',
    created_at: '2025-07-02 00:00:00',
    updated_at: '2025-07-02 00:00:00'
  },
  {
    move_id: 9,
    name: 'かぜおこし',
    type: 'ひこう',
    power: 40,
    accuracy: 100,
    pp: 35,
    category: '特殊',
    description: '翼で風を起こして相手を攻撃する。',
    created_at: '2025-07-02 00:00:00',
    updated_at: '2025-07-02 00:00:00'
  },

  // くさタイプの技
  {
    move_id: 10,
    name: 'つるのムチ',
    type: 'くさ',
    power: 45,
    accuracy: 100,
    pp: 25,
    category: '物理',
    description: 'つるのようなもので相手をたたいて攻撃する。',
    created_at: '2025-07-02 00:00:00',
    updated_at: '2025-07-02 00:00:00'
  },
  {
    move_id: 11,
    name: 'はっぱカッター',
    type: 'くさ',
    power: 55,
    accuracy: 95,
    pp: 25,
    category: '物理',
    description: 'はっぱを飛ばして相手を切りつけて攻撃する。',
    created_at: '2025-07-02 00:00:00',
    updated_at: '2025-07-02 00:00:00'
  },

  // ほのおタイプの技
  {
    move_id: 12,
    name: 'ひのこ',
    type: 'ほのお',
    power: 40,
    accuracy: 100,
    pp: 25,
    category: '特殊',
    description: '小さな炎で相手を攻撃する。やけど状態にすることがある。',
    created_at: '2025-07-02 00:00:00',
    updated_at: '2025-07-02 00:00:00'
  },
  {
    move_id: 13,
    name: 'かえんほうしゃ',
    type: 'ほのお',
    power: 90,
    accuracy: 100,
    pp: 15,
    category: '特殊',
    description: '激しい炎で相手を攻撃する。やけど状態にすることがある。',
    created_at: '2025-07-02 00:00:00',
    updated_at: '2025-07-02 00:00:00'
  },

  // 変化技（補助技）
  {
    move_id: 14,
    name: 'かたくなる',
    type: 'ノーマル',
    power: 0,
    accuracy: 100,
    pp: 30,
    category: '変化',
    description: '全身の力をぬいて体をかたくし、防御力をあげる。',
    created_at: '2025-07-02 00:00:00',
    updated_at: '2025-07-02 00:00:00'
  },
  {
    move_id: 15,
    name: 'でんこうせっか',
    type: 'ノーマル',
    power: 40,
    accuracy: 100,
    pp: 30,
    category: '物理',
    description: '目にも留まらぬ素早さで相手に突進する。必ず先制攻撃できる。',
    created_at: '2025-07-02 00:00:00',
    updated_at: '2025-07-02 00:00:00'
  }
];

/**
 * 技IDから技データを取得する関数
 * 初学者向け：指定された技IDの詳細情報を返す
 */
export function 技データ取得(moveId: number): 技データ | undefined {
  return 技マスターデータ.find(move => move.move_id === moveId);
}

/**
 * 技名から技データを検索する関数
 * 初学者向け：技名で技データを検索
 */
export function 技名で検索(name: string): 技データ | undefined {
  return 技マスターデータ.find(move => move.name === name);
}

/**
 * タイプ別に技を取得する関数
 * 初学者向け：指定されたタイプの技をすべて取得
 */
export function タイプ別技取得(type: string): 技データ[] {
  return 技マスターデータ.filter(move => move.type === type);
}

/**
 * カテゴリ別に技を取得する関数
 * 初学者向け：物理技、特殊技、変化技でフィルタリング
 */
export function カテゴリ別技取得(category: string): 技データ[] {
  return 技マスターデータ.filter(move => move.category === category);
}

/**
 * 初心者ポケモン用の基本技セット
 * 初学者向け：序盤で覚えさせる技の推奨リスト
 */
export const 初心者技セット = {
  // フシギダネ用の技
  フシギダネ: [1, 10, 11, 14], // たいあたり、つるのムチ、はっぱカッター、かたくなる
  
  // ヒトカゲ用の技  
  ヒトカゲ: [1, 12, 13, 2],   // たいあたり、ひのこ、かえんほうしゃ、ひっかく
  
  // ゼニガメ用の技
  ゼニガメ: [1, 6, 7, 3],     // たいあたり、みずでっぽう、バブルこうせん、かみつく
  
  // ピカチュウ用の技
  ピカチュウ: [4, 5, 15, 1],  // でんきショック、10まんボルト、でんこうせっか、たいあたり
  
  // ポッポ用の技
  ポッポ: [8, 9, 15, 1]       // つつく、かぜおこし、でんこうせっか、たいあたり
};

/**
 * 威力別技分類
 * 初学者向け：技の威力によるカテゴリ分け
 */
export const 威力別技分類 = {
  弱技: 技マスターデータ.filter(move => move.power > 0 && move.power <= 40),
  中技: 技マスターデータ.filter(move => move.power > 40 && move.power <= 70),
  強技: 技マスターデータ.filter(move => move.power > 70),
  補助技: 技マスターデータ.filter(move => move.power === 0)
};