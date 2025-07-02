// 初学者向け：タイプ相性システム
// ポケモンの技タイプと相手ポケモンタイプの相性を計算

import type { 技タイプ } from '../types/battle';

/**
 * ポケモンタイプの定義
 * 初学者向け：ポケモンが持つ属性タイプ
 */
export type ポケモンタイプ = 技タイプ;

/**
 * タイプ相性の効果
 * 初学者向け：技の効果度合い
 */
export type タイプ相性効果 = 
  | '効果なし'      // 0倍ダメージ
  | '効果今ひとつ'  // 0.5倍ダメージ  
  | '普通'          // 1倍ダメージ
  | '効果抜群';     // 2倍ダメージ

/**
 * タイプ相性の倍率
 * 初学者向け：ダメージ計算で使用する数値
 */
export type タイプ相性倍率 = 0 | 0.5 | 1 | 2;

/**
 * タイプ相性の計算結果
 * 初学者向け：相性判定の詳細情報
 */
export interface タイプ相性結果 {
  effectiveness: タイプ相性効果;     // 相性の効果
  multiplier: タイプ相性倍率;       // ダメージ倍率
  message: string;                  // 表示メッセージ
  is_critical: boolean;             // 効果抜群かどうか
  is_weak: boolean;                 // 効果今ひとつかどうか
  is_immune: boolean;               // 無効かどうか
}

/**
 * タイプ相性テーブル
 * 初学者向け：ポケモン本家のタイプ相性を簡略化
 * 
 * 表の読み方：
 * - 行: 攻撃技のタイプ
 * - 列: 防御側ポケモンのタイプ  
 * - 値: ダメージ倍率
 */
const TYPE_EFFECTIVENESS_CHART: Record<技タイプ, Record<ポケモンタイプ, タイプ相性倍率>> = {
  // ノーマル技
  'ノーマル': {
    'ノーマル': 1,
    'でんき': 1,
    'みず': 1,
    'ひこう': 1,
    'くさ': 1,
    'ほのお': 1,
    'じめん': 1,
    'いわ': 0.5,    // いわタイプには効果今ひとつ
    'かくとう': 1,
    'エスパー': 1
  },

  // でんき技
  'でんき': {
    'ノーマル': 1,
    'でんき': 0.5,   // でんきタイプには効果今ひとつ
    'みず': 2,       // みずタイプには効果抜群
    'ひこう': 2,     // ひこうタイプには効果抜群
    'くさ': 0.5,     // くさタイプには効果今ひとつ
    'ほのお': 1,
    'じめん': 0,     // じめんタイプには無効
    'いわ': 1,
    'かくとう': 1,
    'エスパー': 1
  },

  // みず技
  'みず': {
    'ノーマル': 1,
    'でんき': 1,
    'みず': 0.5,     // みずタイプには効果今ひとつ
    'ひこう': 1,
    'くさ': 0.5,     // くさタイプには効果今ひとつ
    'ほのお': 2,     // ほのおタイプには効果抜群
    'じめん': 2,     // じめんタイプには効果抜群
    'いわ': 2,       // いわタイプには効果抜群
    'かくとう': 1,
    'エスパー': 1
  },

  // ひこう技
  'ひこう': {
    'ノーマル': 1,
    'でんき': 0.5,   // でんきタイプには効果今ひとつ
    'みず': 1,
    'ひこう': 1,
    'くさ': 2,       // くさタイプには効果抜群
    'ほのお': 1,
    'じめん': 1,
    'いわ': 0.5,     // いわタイプには効果今ひとつ
    'かくとう': 2,   // かくとうタイプには効果抜群
    'エスパー': 1
  },

  // くさ技
  'くさ': {
    'ノーマル': 1,
    'でんき': 1,
    'みず': 2,       // みずタイプには効果抜群
    'ひこう': 0.5,   // ひこうタイプには効果今ひとつ
    'くさ': 0.5,     // くさタイプには効果今ひとつ
    'ほのお': 0.5,   // ほのおタイプには効果今ひとつ
    'じめん': 2,     // じめんタイプには効果抜群
    'いわ': 2,       // いわタイプには効果抜群
    'かくとう': 1,
    'エスパー': 1
  },

  // ほのお技
  'ほのお': {
    'ノーマル': 1,
    'でんき': 1,
    'みず': 0.5,     // みずタイプには効果今ひとつ
    'ひこう': 1,
    'くさ': 2,       // くさタイプには効果抜群
    'ほのお': 0.5,   // ほのおタイプには効果今ひとつ
    'じめん': 1,
    'いわ': 0.5,     // いわタイプには効果今ひとつ
    'かくとう': 1,
    'エスパー': 1
  },

  // じめん技
  'じめん': {
    'ノーマル': 1,
    'でんき': 2,     // でんきタイプには効果抜群
    'みず': 1,
    'ひこう': 0,     // ひこうタイプには無効
    'くさ': 0.5,     // くさタイプには効果今ひとつ
    'ほのお': 2,     // ほのおタイプには効果抜群
    'じめん': 1,
    'いわ': 2,       // いわタイプには効果抜群
    'かくとう': 1,
    'エスパー': 1
  },

  // いわ技
  'いわ': {
    'ノーマル': 1,
    'でんき': 1,
    'みず': 1,
    'ひこう': 2,     // ひこうタイプには効果抜群
    'くさ': 1,
    'ほのお': 2,     // ほのおタイプには効果抜群
    'じめん': 0.5,   // じめんタイプには効果今ひとつ
    'いわ': 1,
    'かくとう': 0.5, // かくとうタイプには効果今ひとつ
    'エスパー': 1
  },

  // かくとう技
  'かくとう': {
    'ノーマル': 2,   // ノーマルタイプには効果抜群
    'でんき': 1,
    'みず': 1,
    'ひこう': 0.5,   // ひこうタイプには効果今ひとつ
    'くさ': 1,
    'ほのお': 1,
    'じめん': 1,
    'いわ': 2,       // いわタイプには効果抜群
    'かくとう': 1,
    'エスパー': 0.5  // エスパータイプには効果今ひとつ
  },

  // エスパー技
  'エスパー': {
    'ノーマル': 1,
    'でんき': 1,
    'みず': 1,
    'ひこう': 1,
    'くさ': 1,
    'ほのお': 1,
    'じめん': 1,
    'いわ': 1,
    'かくとう': 2,   // かくとうタイプには効果抜群
    'エスパー': 0.5  // エスパータイプには効果今ひとつ
  }
};

/**
 * タイプ相性を計算する
 * 初学者向け：攻撃技と防御ポケモンのタイプ相性を判定
 */
export function calculateTypeEffectiveness(
  attackType: 技タイプ,
  defenseType: ポケモンタイプ
): タイプ相性結果 {
  const multiplier = TYPE_EFFECTIVENESS_CHART[attackType]?.[defenseType] ?? 1;
  
  let effectiveness: タイプ相性効果;
  let message: string;
  
  switch (multiplier) {
    case 0:
      effectiveness = '効果なし';
      message = 'こうかがないようだ...';
      break;
    case 0.5:
      effectiveness = '効果今ひとつ';
      message = 'こうかはいまひとつのようだ...';
      break;
    case 2:
      effectiveness = '効果抜群';
      message = 'こうかはばつぐんだ！';
      break;
    default:
      effectiveness = '普通';
      message = '';
      break;
  }

  return {
    effectiveness,
    multiplier,
    message,
    is_critical: multiplier === 2,
    is_weak: multiplier === 0.5,
    is_immune: multiplier === 0
  };
}

/**
 * 複数タイプ対応の相性計算
 * 初学者向け：2つのタイプを持つポケモンへの攻撃
 */
export function calculateDualTypeEffectiveness(
  attackType: 技タイプ,
  defenseType1: ポケモンタイプ,
  defenseType2?: ポケモンタイプ
): タイプ相性結果 {
  const result1 = calculateTypeEffectiveness(attackType, defenseType1);
  
  if (!defenseType2) {
    return result1;
  }
  
  const result2 = calculateTypeEffectiveness(attackType, defenseType2);
  const combinedMultiplier = (result1.multiplier * result2.multiplier) as タイプ相性倍率;
  
  let effectiveness: タイプ相性効果;
  let message: string;
  
  if (combinedMultiplier === 0) {
    effectiveness = '効果なし';
    message = 'こうかがないようだ...';
  } else if (combinedMultiplier === 0.25) {
    effectiveness = '効果今ひとつ';
    message = 'こうかはいまひとつのようだ...';
  } else if (combinedMultiplier === 0.5) {
    effectiveness = '効果今ひとつ';
    message = 'こうかはいまひとつのようだ...';
  } else if (combinedMultiplier === 2) {
    effectiveness = '効果抜群';
    message = 'こうかはばつぐんだ！';
  } else if (combinedMultiplier === 4) {
    effectiveness = '効果抜群';
    message = 'こうかはばつぐんだ！';
  } else {
    effectiveness = '普通';
    message = '';
  }

  return {
    effectiveness,
    multiplier: combinedMultiplier,
    message,
    is_critical: combinedMultiplier >= 2,
    is_weak: combinedMultiplier <= 0.5 && combinedMultiplier > 0,
    is_immune: combinedMultiplier === 0
  };
}

/**
 * 効果的な技タイプを取得
 * 初学者向け：指定したポケモンタイプに効果抜群の技タイプを見つける
 */
export function getEffectiveTypes(defenseType: ポケモンタイプ): 技タイプ[] {
  const effectiveTypes: 技タイプ[] = [];
  
  for (const attackType of Object.keys(TYPE_EFFECTIVENESS_CHART) as 技タイプ[]) {
    const result = calculateTypeEffectiveness(attackType, defenseType);
    if (result.is_critical) {
      effectiveTypes.push(attackType);
    }
  }
  
  return effectiveTypes;
}

/**
 * 弱点の技タイプを取得
 * 初学者向け：指定したポケモンタイプが弱い技タイプを見つける
 */
export function getWeakTypes(defenseType: ポケモンタイプ): 技タイプ[] {
  return getEffectiveTypes(defenseType);
}

/**
 * 耐性のある技タイプを取得
 * 初学者向け：指定したポケモンタイプが耐性を持つ技タイプを見つける
 */
export function getResistantTypes(defenseType: ポケモンタイプ): 技タイプ[] {
  const resistantTypes: 技タイプ[] = [];
  
  for (const attackType of Object.keys(TYPE_EFFECTIVENESS_CHART) as 技タイプ[]) {
    const result = calculateTypeEffectiveness(attackType, defenseType);
    if (result.is_weak) {
      resistantTypes.push(attackType);
    }
  }
  
  return resistantTypes;
}

/**
 * 無効な技タイプを取得
 * 初学者向け：指定したポケモンタイプに無効な技タイプを見つける
 */
export function getImmuneTypes(defenseType: ポケモンタイプ): 技タイプ[] {
  const immuneTypes: 技タイプ[] = [];
  
  for (const attackType of Object.keys(TYPE_EFFECTIVENESS_CHART) as 技タイプ[]) {
    const result = calculateTypeEffectiveness(attackType, defenseType);
    if (result.is_immune) {
      immuneTypes.push(attackType);
    }
  }
  
  return immuneTypes;
}

/**
 * タイプ相性の説明テキストを生成
 * 初学者向け：初学者にもわかりやすい相性説明
 */
export function getTypeEffectivenessExplanation(
  attackType: 技タイプ,
  defenseType: ポケモンタイプ
): string {
  const result = calculateTypeEffectiveness(attackType, defenseType);
  
  const explanations: Record<タイプ相性効果, string> = {
    '効果なし': `${attackType}技は${defenseType}タイプに全く効かない`,
    '効果今ひとつ': `${attackType}技は${defenseType}タイプにあまり効かない（ダメージ半減）`,
    '普通': `${attackType}技は${defenseType}タイプに普通の効果`,
    '効果抜群': `${attackType}技は${defenseType}タイプによく効く（ダメージ2倍）`
  };
  
  return explanations[result.effectiveness];
}

/**
 * バトルでのタイプ相性アドバイス
 * 初学者向け：どの技を使うべきかのアドバイス
 */
export function getBattleAdvice(
  availableMoveTypes: 技タイプ[],
  enemyType: ポケモンタイプ
): {
  bestMoves: 技タイプ[];
  worstMoves: 技タイプ[];
  advice: string;
} {
  const moveEffectiveness = availableMoveTypes.map(moveType => ({
    type: moveType,
    result: calculateTypeEffectiveness(moveType, enemyType)
  }));

  const bestMoves = moveEffectiveness
    .filter(m => m.result.is_critical)
    .map(m => m.type);

  const worstMoves = moveEffectiveness
    .filter(m => m.result.is_weak || m.result.is_immune)
    .map(m => m.type);

  let advice: string;
  if (bestMoves.length > 0) {
    advice = `${bestMoves.join('、')}技が効果抜群！これらの技を使おう！`;
  } else if (worstMoves.length === availableMoveTypes.length) {
    advice = '効果抜群の技がない...普通に戦うしかない';
  } else {
    const neutralMoves = availableMoveTypes.filter(
      type => !worstMoves.includes(type)
    );
    advice = `${neutralMoves.join('、')}技が無難な選択`;
  }

  return { bestMoves, worstMoves, advice };
}

export default {
  calculateTypeEffectiveness,
  calculateDualTypeEffectiveness,
  getEffectiveTypes,
  getWeakTypes,
  getResistantTypes,
  getImmuneTypes,
  getTypeEffectivenessExplanation,
  getBattleAdvice
};