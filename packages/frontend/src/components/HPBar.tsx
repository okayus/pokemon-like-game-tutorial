// 初学者向け：HPバー表示コンポーネント
// ポケモンの現在HPを視覚的に表示するバー

import React, { useEffect, useState } from 'react';

/**
 * HPバーのProps型定義
 * 初学者向け：HPバーに必要な情報
 */
interface HPBarProps {
  currentHP: number;      // 現在のHP
  maxHP: number;          // 最大HP
  pokemonName: string;    // ポケモン名（表示用）
  showNumbers?: boolean;  // 数値表示の有無
  animated?: boolean;     // アニメーション有無
  size?: 'small' | 'medium' | 'large'; // サイズ
}

/**
 * HPバーコンポーネント
 * 初学者向け：ポケモンのHPを視覚的に表示
 */
export function HPBar({
  currentHP,
  maxHP,
  pokemonName,
  showNumbers = true,
  animated = true,
  size = 'medium'
}: HPBarProps) {
  // アニメーション用の表示HP状態
  const [displayHP, setDisplayHP] = useState(currentHP);

  // HP変更時のアニメーション処理
  useEffect(() => {
    if (!animated) {
      setDisplayHP(currentHP);
      return;
    }

    // HP減少のアニメーション（段階的に減少）
    if (currentHP < displayHP) {
      const difference = displayHP - currentHP;
      const steps = Math.min(20, difference); // 最大20ステップ
      const stepSize = difference / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        const newHP = displayHP - (stepSize * currentStep);
        
        if (currentStep >= steps || newHP <= currentHP) {
          setDisplayHP(currentHP);
          clearInterval(interval);
        } else {
          setDisplayHP(Math.max(currentHP, newHP));
        }
      }, 50); // 50ms間隔でアニメーション

      return () => clearInterval(interval);
    } else {
      // HP回復は即座に反映
      setDisplayHP(currentHP);
    }
  }, [currentHP, displayHP, animated]);

  // HP割合を計算（0-100%）
  const hpPercentage = maxHP > 0 ? Math.max(0, (displayHP / maxHP) * 100) : 0;

  // HP状態に応じた色を決定
  const getHPColor = (percentage: number): string => {
    if (percentage > 50) return 'bg-green-500';      // 緑（健康）
    if (percentage > 25) return 'bg-yellow-500';     // 黄（注意）
    if (percentage > 10) return 'bg-orange-500';     // オレンジ（危険）
    return 'bg-red-500';                             // 赤（瀕死）
  };

  // サイズに応じたスタイル
  const getSizeStyles = (size: string) => {
    switch (size) {
      case 'small':
        return {
          container: 'w-24 h-2',
          text: 'text-xs',
          padding: 'p-1'
        };
      case 'large':
        return {
          container: 'w-48 h-6',
          text: 'text-lg',
          padding: 'p-3'
        };
      default: // medium
        return {
          container: 'w-32 h-4',
          text: 'text-sm',
          padding: 'p-2'
        };
    }
  };

  const styles = getSizeStyles(size);

  return (
    <div className={`bg-slate-800 rounded-lg ${styles.padding}`}>
      {/* ポケモン名表示 */}
      <div className={`text-white font-bold ${styles.text} mb-1`}>
        {pokemonName}
      </div>

      {/* HPバー本体 */}
      <div className="flex items-center space-x-2">
        <span className={`text-white font-medium ${styles.text} min-w-fit`}>
          HP
        </span>
        
        {/* HPバーの枠 */}
        <div className={`${styles.container} bg-slate-600 rounded-full overflow-hidden relative`}>
          {/* HPバーの塗りつぶし部分 */}
          <div
            className={`h-full ${getHPColor(hpPercentage)} transition-all duration-300 ease-out`}
            style={{ width: `${hpPercentage}%` }}
          />
          
          {/* HPバーの光沢効果 */}
          <div 
            className="absolute top-0 left-0 h-1/2 bg-white opacity-20 transition-all duration-300"
            style={{ width: `${hpPercentage}%` }}
          />
        </div>

        {/* HP数値表示 */}
        {showNumbers && (
          <span className={`text-white font-mono ${styles.text} min-w-fit`}>
            {Math.ceil(displayHP)}/{maxHP}
          </span>
        )}
      </div>

      {/* HP割合表示（オプション） */}
      {size === 'large' && (
        <div className="text-xs text-slate-400 mt-1">
          {hpPercentage.toFixed(1)}%
        </div>
      )}
    </div>
  );
}

/**
 * 簡易HPバーコンポーネント
 * 初学者向け：名前や数値なしのシンプルなHPバー
 */
export function SimpleHPBar({
  currentHP,
  maxHP,
  className = ''
}: {
  currentHP: number;
  maxHP: number;
  className?: string;
}) {
  const hpPercentage = maxHP > 0 ? Math.max(0, (currentHP / maxHP) * 100) : 0;

  const getHPColor = (percentage: number): string => {
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 25) return 'bg-yellow-500';
    if (percentage > 10) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={`w-20 h-2 bg-slate-600 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full ${getHPColor(hpPercentage)} transition-all duration-300`}
        style={{ width: `${hpPercentage}%` }}
      />
    </div>
  );
}

export default HPBar;