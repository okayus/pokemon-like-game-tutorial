// 初学者向け：技エフェクト表示コンポーネント
// ポケモンの技使用時に視覚的エフェクトを表示

import { useEffect, useState } from 'react';

/**
 * 技エフェクトの種類
 * 初学者向け：技タイプに応じたエフェクトパターン
 */
type エフェクトタイプ =
  | 'でんき' // 電気系エフェクト
  | 'ほのお' // 炎系エフェクト
  | 'みず' // 水系エフェクト
  | 'くさ' // 草系エフェクト
  | '物理' // 物理攻撃エフェクト
  | '特殊' // 特殊攻撃エフェクト
  | '変化' // 変化技エフェクト
  | 'クリティカル' // クリティカルヒット
  | 'ダメージ'; // ダメージ数値表示

/**
 * 技エフェクトコンポーネントのProps
 * 初学者向け：エフェクト表示に必要な情報
 */
interface MoveEffectProps {
  type: エフェクトタイプ;
  isVisible: boolean;
  onComplete?: () => void;
  damage?: number;
  position?: 'attacker' | 'target';
  duration?: number; // ミリ秒
}

/**
 * 技タイプに応じた色とエフェクトを取得
 * 初学者向け：各技タイプの視覚的特徴を定義
 */
function getEffectStyles(type: エフェクトタイプ): {
  colors: string[];
  particles: string;
  glow: string;
} {
  switch (type) {
    case 'でんき':
      return {
        colors: ['#FFD700', '#FFFF00', '#FFA500'],
        particles: '⚡',
        glow: 'shadow-yellow-400',
      };
    case 'ほのお':
      return {
        colors: ['#FF4500', '#FF6347', '#FFD700'],
        particles: '🔥',
        glow: 'shadow-red-400',
      };
    case 'みず':
      return {
        colors: ['#00BFFF', '#1E90FF', '#87CEEB'],
        particles: '💧',
        glow: 'shadow-blue-400',
      };
    case 'くさ':
      return {
        colors: ['#32CD32', '#90EE90', '#00FF00'],
        particles: '🍃',
        glow: 'shadow-green-400',
      };
    case '物理':
      return {
        colors: ['#DC143C', '#B22222', '#FF6347'],
        particles: '💥',
        glow: 'shadow-red-600',
      };
    case '特殊':
      return {
        colors: ['#9370DB', '#8A2BE2', '#DDA0DD'],
        particles: '✨',
        glow: 'shadow-purple-400',
      };
    case '変化':
      return {
        colors: ['#20B2AA', '#48D1CC', '#00CED1'],
        particles: '🔄',
        glow: 'shadow-cyan-400',
      };
    case 'クリティカル':
      return {
        colors: ['#FFD700', '#FFA500', '#FF4500'],
        particles: '⭐',
        glow: 'shadow-orange-400',
      };
    case 'ダメージ':
      return {
        colors: ['#FF4500', '#DC143C'],
        particles: '',
        glow: 'shadow-red-500',
      };
    default:
      return {
        colors: ['#FFFFFF', '#F0F0F0'],
        particles: '✨',
        glow: 'shadow-gray-400',
      };
  }
}

/**
 * パーティクル要素コンポーネント
 * 初学者向け：個別のパーティクルアニメーション
 */
interface ParticleProps {
  particle: string;
  delay: number;
  colors: string[];
}

function Particle({ particle, delay, colors }: ParticleProps) {
  return (
    <div
      className="absolute text-2xl animate-ping opacity-0"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${delay}ms`,
        animationDuration: '1000ms',
        color: colors[Math.floor(Math.random() * colors.length)],
      }}
    >
      {particle}
    </div>
  );
}

/**
 * 技エフェクトコンポーネント
 * 初学者向け：技使用時の視覚エフェクト表示
 */
export function MoveEffect({
  type,
  isVisible,
  onComplete,
  damage,
  position = 'target',
  duration = 2000,
}: MoveEffectProps) {
  const [showParticles, setShowParticles] = useState(false);
  const [showDamage, setShowDamage] = useState(false);
  const effectStyles = getEffectStyles(type);

  useEffect(() => {
    if (!isVisible) {
      setShowParticles(false);
      setShowDamage(false);
      return;
    }

    // エフェクト開始
    setShowParticles(true);

    // ダメージ数値表示（少し遅らせる）
    const damageTimer = setTimeout(() => {
      if (damage !== undefined) {
        setShowDamage(true);
      }
    }, 500);

    // エフェクト終了
    const completeTimer = setTimeout(() => {
      setShowParticles(false);
      setShowDamage(false);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(damageTimer);
      clearTimeout(completeTimer);
    };
  }, [isVisible, damage, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${
        position === 'attacker' ? 'z-20' : 'z-30'
      }`}
    >
      {/* 背景フラッシュエフェクト */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          showParticles ? 'opacity-30' : 'opacity-0'
        }`}
        style={{
          background: `radial-gradient(circle, ${effectStyles.colors[0]}20 0%, transparent 70%)`,
        }}
      />

      {/* パーティクルエフェクト */}
      {showParticles && effectStyles.particles && (
        <div className="absolute inset-0">
          {Array.from({ length: 8 }, (_, i) => (
            <Particle
              key={i}
              particle={effectStyles.particles}
              delay={i * 100}
              colors={effectStyles.colors}
            />
          ))}
        </div>
      )}

      {/* 波紋エフェクト */}
      {showParticles && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`w-32 h-32 rounded-full border-4 animate-ping ${effectStyles.glow}`}
            style={{
              borderColor: effectStyles.colors[0],
              animationDuration: '0.8s',
            }}
          />
        </div>
      )}

      {/* ダメージ数値表示 */}
      {showDamage && damage !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`text-4xl font-bold animate-bounce ${
              type === 'クリティカル' ? 'text-yellow-300' : 'text-white'
            }`}
            style={{
              textShadow: `2px 2px 4px ${effectStyles.colors[0]}`,
              filter: 'drop-shadow(0 0 8px currentColor)',
            }}
          >
            -{damage}
            {type === 'クリティカル' && <span className="text-2xl ml-2">💥</span>}
          </div>
        </div>
      )}

      {/* 特殊エフェクト：クリティカルヒット */}
      {type === 'クリティカル' && showParticles && (
        <div className="absolute inset-0">
          <div className="absolute top-4 right-4 text-yellow-300 text-lg font-bold animate-pulse">
            きゅうしょにあたった！
          </div>
          {/* 星のエフェクト */}
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={`star-${i}`}
              className="absolute text-yellow-300 text-xl animate-spin"
              style={{
                left: `${20 + ((i * 60) % 80)}%`,
                top: `${20 + ((i * 40) % 60)}%`,
                animationDelay: `${i * 50}ms`,
                animationDuration: '1500ms',
              }}
            >
              ⭐
            </div>
          ))}
        </div>
      )}

      {/* 特殊エフェクト：でんき技 */}
      {type === 'でんき' && showParticles && (
        <div className="absolute inset-0">
          {/* 稲妻エフェクト */}
          <div
            className="absolute top-0 left-1/4 w-1 h-full bg-yellow-300 animate-pulse opacity-80"
            style={{ transform: 'skew(-10deg)', animationDuration: '200ms' }}
          />
          <div
            className="absolute top-0 right-1/3 w-1 h-full bg-yellow-400 animate-pulse opacity-60"
            style={{
              transform: 'skew(15deg)',
              animationDuration: '300ms',
              animationDelay: '100ms',
            }}
          />
        </div>
      )}

      {/* 特殊エフェクト：ほのお技 */}
      {type === 'ほのお' && showParticles && (
        <div className="absolute inset-0">
          {/* 炎の渦エフェクト */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, ${effectStyles.colors[0]}40, transparent, ${effectStyles.colors[1]}40)`,
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * 複数エフェクト管理コンポーネント
 * 初学者向け：複数のエフェクトを順次表示
 */
export function MoveEffectSequence({
  effects,
  onComplete,
}: {
  effects: Array<{
    type: エフェクトタイプ;
    damage?: number;
    position?: 'attacker' | 'target';
    duration?: number;
  }>;
  onComplete?: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const handleEffectComplete = () => {
    if (currentIndex < effects.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false);
      onComplete?.();
    }
  };

  if (!isPlaying || currentIndex >= effects.length) return null;

  const currentEffect = effects[currentIndex];

  return (
    <MoveEffect
      type={currentEffect.type}
      isVisible={true}
      damage={currentEffect.damage}
      position={currentEffect.position}
      duration={currentEffect.duration}
      onComplete={handleEffectComplete}
    />
  );
}

export default MoveEffect;
