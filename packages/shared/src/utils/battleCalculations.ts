// 初学者向け：バトル計算ユーティリティ
// ダメージ計算や命中判定などのバトル関連計算

import type { 参戦ポケモン, 技データ, ダメージ計算詳細, 効果判定 } from '../types/battle';

/**
 * 基本ダメージ計算関数
 * 初学者向け：シンプルなダメージ計算式
 *
 * 計算式: ((攻撃力 × 技威力) ÷ 防御力) × ランダム補正
 */
export function 基本ダメージ計算(
  攻撃者: 参戦ポケモン,
  防御者: 参戦ポケモン,
  使用技: 技データ
): number {
  // 技威力が0の場合（変化技）はダメージなし
  if (使用技.power === 0) {
    return 0;
  }

  // 基本ダメージ = (攻撃力 × 技威力) ÷ 防御力
  const 基本ダメージ = Math.floor((攻撃者.attack * 使用技.power) / 防御者.defense);

  // ランダム補正（85%〜100%）
  const ランダム補正 = 0.85 + Math.random() * 0.15;

  // 最終ダメージ（最低1ダメージ保証）
  const 最終ダメージ = Math.max(1, Math.floor(基本ダメージ * ランダム補正));

  return 最終ダメージ;
}

/**
 * 詳細ダメージ計算関数
 * 初学者向け：計算過程も含めた詳細なダメージ計算
 */
export function 詳細ダメージ計算(
  攻撃者: 参戦ポケモン,
  防御者: 参戦ポケモン,
  使用技: 技データ
): ダメージ計算詳細 {
  // 技威力が0の場合（変化技）
  if (使用技.power === 0) {
    return {
      base_damage: 0,
      random_factor: 1,
      critical_multiplier: 1,
      type_effectiveness: 1,
      final_damage: 0,
      calculation_formula: '変化技のためダメージなし',
    };
  }

  // 基本ダメージ計算
  const 基本ダメージ = Math.floor((攻撃者.attack * 使用技.power) / 防御者.defense);

  // ランダム補正（85%〜100%）
  const ランダム補正 = 0.85 + Math.random() * 0.15;

  // クリティカル判定（1/16の確率）
  const クリティカル判定 = Math.random() < 0.0625;
  const クリティカル倍率 = クリティカル判定 ? 1.5 : 1;

  // タイプ相性（今は等倍固定、将来拡張可能）
  const タイプ相性倍率 = 1;

  // 最終ダメージ計算
  let 最終ダメージ = Math.floor(基本ダメージ * ランダム補正 * クリティカル倍率 * タイプ相性倍率);

  // 最低1ダメージ保証
  最終ダメージ = Math.max(1, 最終ダメージ);

  // 計算式の文字列化（学習用）
  const 計算式 = `(${攻撃者.attack} × ${使用技.power}) ÷ ${防御者.defense} × ${ランダム補正.toFixed(2)}${クリティカル判定 ? ' × 1.5(クリティカル)' : ''} = ${最終ダメージ}`;

  return {
    base_damage: 基本ダメージ,
    random_factor: ランダム補正,
    critical_multiplier: クリティカル倍率,
    type_effectiveness: タイプ相性倍率,
    final_damage: 最終ダメージ,
    calculation_formula: 計算式,
  };
}

/**
 * クリティカルヒット判定関数
 * 初学者向け：クリティカルヒットかどうかを判定
 */
export function クリティカル判定(): boolean {
  // 1/16の確率でクリティカル（約6.25%）
  return Math.random() < 0.0625;
}

/**
 * 命中判定関数
 * 初学者向け：技が命中するかどうかを判定
 */
export function 命中判定(技: 技データ): boolean {
  // 技の命中率と乱数で判定
  const 命中乱数 = Math.random() * 100;
  return 命中乱数 <= 技.accuracy;
}

/**
 * HP計算関数
 * 初学者向け：ダメージ後のHPを計算（0未満にならないよう調整）
 */
export function HP計算(現在HP: number, ダメージ: number): number {
  return Math.max(0, 現在HP - ダメージ);
}

/**
 * 戦闘不能判定関数
 * 初学者向け：ポケモンが戦闘不能かどうかを判定
 */
export function 戦闘不能判定(ポケモン: 参戦ポケモン): boolean {
  return ポケモン.current_hp <= 0;
}

/**
 * バトル終了判定関数
 * 初学者向け：バトルが終了したかどうかを判定
 */
export function バトル終了判定(
  プレイヤーポケモン: 参戦ポケモン,
  敵ポケモン: 参戦ポケモン
): '味方' | '敵' | '引き分け' | null {
  const プレイヤー戦闘不能 = 戦闘不能判定(プレイヤーポケモン);
  const 敵戦闘不能 = 戦闘不能判定(敵ポケモン);

  if (プレイヤー戦闘不能 && 敵戦闘不能) {
    return '引き分け';
  } else if (敵戦闘不能) {
    return '味方';
  } else if (プレイヤー戦闘不能) {
    return '敵';
  }

  return null; // バトル継続
}

/**
 * タイプ相性計算関数（将来拡張用）
 * 初学者向け：技のタイプと防御側ポケモンの相性を計算
 * 現在は等倍固定、将来的にタイプシステムを実装時に拡張
 */
export function タイプ相性計算(): 効果判定 {
  // 現在は相性システム未実装のため等倍固定
  // 将来的にはタイプ相性表を参照して計算
  return '普通';
}

/**
 * 経験値計算関数（将来拡張用）
 * 初学者向け：バトル勝利時の経験値を計算
 */
export function 経験値計算(勝利ポケモンレベル: number, 敗北ポケモンレベル: number): number {
  // 簡易経験値計算式
  // 基本経験値 = 敗北ポケモンレベル × 10
  // レベル差補正あり
  const 基本経験値 = 敗北ポケモンレベル * 10;
  const レベル差 = 敗北ポケモンレベル - 勝利ポケモンレベル;
  const レベル差補正 = Math.max(0.5, 1 + レベル差 * 0.1);

  return Math.floor(基本経験値 * レベル差補正);
}

/**
 * ランダムダメージ範囲計算
 * 初学者向け：技の最小〜最大ダメージ範囲を計算（表示用）
 */
export function ダメージ範囲計算(
  攻撃者: 参戦ポケモン,
  防御者: 参戦ポケモン,
  使用技: 技データ
): { 最小ダメージ: number; 最大ダメージ: number } {
  if (使用技.power === 0) {
    return { 最小ダメージ: 0, 最大ダメージ: 0 };
  }

  const 基本ダメージ = Math.floor((攻撃者.attack * 使用技.power) / 防御者.defense);

  const 最小ダメージ = Math.max(1, Math.floor(基本ダメージ * 0.85));
  const 最大ダメージ = Math.max(1, Math.floor(基本ダメージ * 1.0));

  return { 最小ダメージ, 最大ダメージ };
}

/**
 * PP消費処理
 * 初学者向け：技使用時のPP減少処理
 */
export function PP消費(現在PP: number, 消費PP: number = 1): number {
  return Math.max(0, 現在PP - 消費PP);
}

/**
 * PP残量チェック
 * 初学者向け：技が使用可能かどうかをPPで判定
 */
export function PP使用可能判定(現在PP: number): boolean {
  return 現在PP > 0;
}

/**
 * バトルメッセージ生成関数
 * 初学者向け：バトル状況に応じたメッセージを生成
 */
export function バトルメッセージ生成(
  攻撃者名: string,
  技名: string,
  ダメージ: number,
  クリティカル: boolean = false,
  効果: 効果判定 = '普通'
): string {
  let メッセージ = `${攻撃者名}の ${技名}！`;

  if (ダメージ > 0) {
    メッセージ += ` ${ダメージ}のダメージ！`;

    if (クリティカル) {
      メッセージ += ' きゅうしょにあたった！';
    }

    if (効果 === '効果抜群') {
      メッセージ += ' こうかはばつぐんだ！';
    } else if (効果 === '効果今ひとつ') {
      メッセージ += ' こうかはいまひとつのようだ...';
    } else if (効果 === '効果なし') {
      メッセージ += ' こうかがないようだ...';
    }
  }

  return メッセージ;
}
