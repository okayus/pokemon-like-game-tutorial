// 初学者向け：ダメージ数値表示コンポーネント
// バトル中に発生するダメージを視覚的に表示

import { useEffect, useState } from 'react';

/**
 * ダメージ表示の種類
 * 初学者向け：ダメージの性質に応じた表示スタイル
 */
type ダメージタイプ = 
  | '通常'         // 通常ダメージ
  | 'クリティカル'  // クリティカルヒット
  | '効果抜群'     // タイプ相性で効果抜群
  | '効果今ひとつ' // タイプ相性で効果今ひとつ
  | '回復'         // HP回復
  | 'ミス';        // 攻撃が外れた

/**
 * ダメージ数値コンポーネントのProps
 * 初学者向け：ダメージ表示に必要な情報
 */
interface DamageNumberProps {
  damage: number;
  type: ダメージタイプ;
  isVisible: boolean;
  onComplete?: () => void;
  startPosition?: { x: number; y: number };
  duration?: number; // ミリ秒
}

/**
 * ダメージタイプに応じたスタイルを取得
 * 初学者向け：各ダメージタイプの視覚的特徴を定義
 */
function getDamageStyles(type: ダメージタイプ): {
  textColor: string;
  shadowColor: string;
  fontSize: string;
  animation: string;
  prefix: string;
  suffix: string;
} {
  switch (type) {
    case 'クリティカル':
      return {
        textColor: 'text-yellow-300',
        shadowColor: 'shadow-yellow-500',
        fontSize: 'text-5xl',
        animation: 'animate-bounce',
        prefix: '',
        suffix: ' ！'
      };
    case '効果抜群':
      return {
        textColor: 'text-red-400',
        shadowColor: 'shadow-red-600',
        fontSize: 'text-4xl',
        animation: 'animate-pulse',
        prefix: '',
        suffix: ' ！'
      };
    case '効果今ひとつ':
      return {
        textColor: 'text-gray-400',
        shadowColor: 'shadow-gray-600',
        fontSize: 'text-3xl',
        animation: 'animate-pulse',
        prefix: '',
        suffix: '...'
      };
    case '回復':
      return {
        textColor: 'text-green-400',
        shadowColor: 'shadow-green-600',
        fontSize: 'text-4xl',
        animation: 'animate-bounce',
        prefix: '+',
        suffix: ' ♥'
      };
    case 'ミス':
      return {
        textColor: 'text-gray-500',
        shadowColor: 'shadow-gray-700',
        fontSize: 'text-3xl',
        animation: 'animate-pulse',
        prefix: '',
        suffix: ''
      };
    default: // 通常
      return {
        textColor: 'text-white',
        shadowColor: 'shadow-gray-800',
        fontSize: 'text-4xl',
        animation: 'animate-pulse',
        prefix: '',
        suffix: ''
      };
  }
}

/**
 * ダメージ数値表示コンポーネント
 * 初学者向け：ダメージをアニメーション付きで表示
 */
export function DamageNumber({
  damage,
  type,
  isVisible,
  onComplete,
  startPosition = { x: 50, y: 50 },
  duration = 2000
}: DamageNumberProps) {
  const [opacity, setOpacity] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [scale, setScale] = useState(1);

  const styles = getDamageStyles(type);

  useEffect(() => {
    if (!isVisible) {
      setOpacity(0);
      setTranslateY(0);
      setScale(1);
      return;
    }

    // アニメーション開始
    setOpacity(1);
    setScale(type === 'クリティカル' ? 1.2 : 1);

    // フェードアップアニメーション
    const animationTimer = setTimeout(() => {
      setTranslateY(-50);
    }, 100);

    // フェードアウト開始
    const fadeTimer = setTimeout(() => {
      setOpacity(0);
      setTranslateY(-100);
    }, duration * 0.7);

    // 完了処理
    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(animationTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [isVisible, type, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: `${startPosition.x}%`,
        top: `${startPosition.y}%`,
        transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`,
        opacity: opacity,
        transition: 'all 0.3s ease-out'
      }}
    >
      <div
        className={`
          font-bold ${styles.textColor} ${styles.fontSize} ${styles.animation}
          drop-shadow-lg ${styles.shadowColor}
        `}
        style={{
          textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px currentColor',
          fontFamily: 'monospace'
        }}
      >
        {type === 'ミス' ? 'MISS!' : 
         `${styles.prefix}${damage}${styles.suffix}`
        }
      </div>

      {/* 追加エフェクト */}
      {type === 'クリティカル' && (
        <div className="absolute -top-2 -right-2 text-2xl animate-spin">
          ⭐
        </div>
      )}

      {type === '効果抜群' && (
        <div className="absolute -top-1 -right-1 text-xl animate-ping">
          🔥
        </div>
      )}

      {type === '回復' && (
        <div className="absolute -top-1 -left-1 text-xl animate-bounce">
          ✨
        </div>
      )}
    </div>
  );
}

/**
 * 複数ダメージ表示管理コンポーネント
 * 初学者向け：複数のダメージを時間差で表示
 */
export function DamageNumberSequence({
  damages,
  onComplete
}: {
  damages: Array<{
    damage: number;
    type: ダメージタイプ;
    position?: { x: number; y: number };
    delay?: number;
    duration?: number;
  }>;
  onComplete?: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (damages.length === 0) {
      onComplete?.();
      return;
    }

    // 各ダメージを遅延付きで表示開始
    const timers = damages.map((_, index) => {
      const delay = damages[index].delay || index * 300;
      return setTimeout(() => {
        setActiveIndex(index);
      }, delay);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [damages, onComplete]);

  const handleDamageComplete = () => {
    const newCount = completedCount + 1;
    setCompletedCount(newCount);
    
    if (newCount >= damages.length) {
      onComplete?.();
    }
  };

  if (damages.length === 0) return null;

  return (
    <div className="absolute inset-0">
      {damages.map((damageInfo, index) => (
        <DamageNumber
          key={index}
          damage={damageInfo.damage}
          type={damageInfo.type}
          isVisible={index <= activeIndex}
          startPosition={damageInfo.position || { 
            x: 50 + (index * 10) % 40, 
            y: 50 + (index * 15) % 30 
          }}
          duration={damageInfo.duration}
          onComplete={handleDamageComplete}
        />
      ))}
    </div>
  );
}

/**
 * バトルログメッセージコンポーネント
 * 初学者向け：バトル中のメッセージをアニメーション表示
 */
export function BattleMessage({
  message,
  isVisible,
  onComplete,
  duration = 3000
}: {
  message: string;
  isVisible: boolean;
  onComplete?: () => void;
  duration?: number;
}) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setOpacity(0);
      return;
    }

    // フェードイン
    setOpacity(1);

    // フェードアウト
    const fadeTimer = setTimeout(() => {
      setOpacity(0);
    }, duration * 0.8);

    // 完了
    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [isVisible, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-40"
      style={{
        opacity: opacity,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      <div className="bg-white border-4 border-slate-800 rounded-lg px-6 py-3 shadow-lg max-w-md">
        <p className="text-lg font-medium text-center text-gray-800">
          {message}
        </p>
      </div>
    </div>
  );
}

export default DamageNumber;