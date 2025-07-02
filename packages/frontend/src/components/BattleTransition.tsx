// 初学者向け：バトル開始・終了演出コンポーネント
// バトルの始まりと終わりを演出する画面遷移エフェクト

import React, { useEffect, useState } from 'react';

/**
 * バトル演出の種類
 * 初学者向け：演出パターンの定義
 */
type 演出タイプ = 
  | 'バトル開始'    // バトル開始時の演出
  | 'バトル終了'    // バトル終了時の演出
  | '勝利'         // プレイヤー勝利時
  | '敗北'         // プレイヤー敗北時
  | '逃走';        // バトルから逃走時

/**
 * バトル演出コンポーネントのProps
 * 初学者向け：演出表示に必要な情報
 */
interface BattleTransitionProps {
  type: 演出タイプ;
  isVisible: boolean;
  onComplete?: () => void;
  playerName?: string;
  enemyName?: string;
  duration?: number; // ミリ秒
}

/**
 * 演出タイプに応じたスタイルを取得
 * 初学者向け：各演出の視覚的特徴を定義
 */
function getTransitionStyles(type: 演出タイプ): {
  backgroundColor: string;
  textColor: string;
  message: string;
  effects: string[];
} {
  switch (type) {
    case 'バトル開始':
      return {
        backgroundColor: 'from-red-900 via-orange-900 to-yellow-900',
        textColor: 'text-white',
        message: 'バトル開始！',
        effects: ['⚔️', '🔥', '⚡', '💥']
      };
    case '勝利':
      return {
        backgroundColor: 'from-yellow-400 via-orange-400 to-red-400',
        textColor: 'text-white',
        message: '勝利！',
        effects: ['🎉', '⭐', '👑', '🏆']
      };
    case '敗北':
      return {
        backgroundColor: 'from-gray-800 via-slate-800 to-black',
        textColor: 'text-gray-300',
        message: '敗北...',
        effects: ['💀', '🌙', '😵', '💔']
      };
    case '逃走':
      return {
        backgroundColor: 'from-blue-800 via-indigo-800 to-purple-800',
        textColor: 'text-blue-200',
        message: '逃げ出した！',
        effects: ['💨', '🏃', '💙', '🌪️']
      };
    default: // バトル終了
      return {
        backgroundColor: 'from-slate-800 via-gray-800 to-slate-900',
        textColor: 'text-white',
        message: 'バトル終了',
        effects: ['✨', '🌟', '💫', '🔚']
      };
  }
}

/**
 * 浮遊エフェクトパーティクル
 * 初学者向け：背景を浮遊するエフェクト要素
 */
interface FloatingEffectProps {
  effect: string;
  delay: number;
  duration: number;
}

function FloatingEffect({ effect, delay, duration }: FloatingEffectProps) {
  return (
    <div
      className="absolute text-4xl opacity-70 animate-bounce"
      style={{
        left: `${Math.random() * 80 + 10}%`,
        top: `${Math.random() * 60 + 20}%`,
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`
      }}
    >
      {effect}
    </div>
  );
}

/**
 * スライドイン・アウトエフェクト
 * 初学者向け：画面の端からスライドするエフェクト
 */
interface SlideEffectProps {
  direction: 'left' | 'right' | 'top' | 'bottom';
  isVisible: boolean;
  duration: number;
}

function SlideEffect({ direction, isVisible, duration }: SlideEffectProps) {
  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case 'left': return 'translateX(-100%)';
        case 'right': return 'translateX(100%)';
        case 'top': return 'translateY(-100%)';
        case 'bottom': return 'translateY(100%)';
      }
    }
    return 'translate(0, 0)';
  };

  return (
    <div
      className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-90"
      style={{
        transform: getTransform(),
        transition: `transform ${duration}ms ease-in-out`
      }}
    />
  );
}

/**
 * バトル演出コンポーネント
 * 初学者向け：バトルの開始・終了演出を表示
 */
export function BattleTransition({
  type,
  isVisible,
  onComplete,
  playerName = 'プレイヤー',
  enemyName = '野生のポケモン',
  duration = 3000
}: BattleTransitionProps) {
  const [phase, setPhase] = useState<'入場' | 'メイン' | '退場'>('入場');
  const [showText, setShowText] = useState(false);
  const [showEffects, setShowEffects] = useState(false);

  const styles = getTransitionStyles(type);

  useEffect(() => {
    if (!isVisible) {
      setPhase('入場');
      setShowText(false);
      setShowEffects(false);
      return;
    }

    // 演出シーケンス
    const sequence = [
      // フェーズ1: 入場演出
      { delay: 0, action: () => setPhase('メイン') },
      // フェーズ2: テキスト表示
      { delay: 300, action: () => setShowText(true) },
      // フェーズ3: エフェクト表示
      { delay: 600, action: () => setShowEffects(true) },
      // フェーズ4: 退場演出
      { delay: duration * 0.7, action: () => setPhase('退場') },
      // フェーズ5: 完了
      { delay: duration, action: () => onComplete?.() }
    ];

    const timers = sequence.map(({ delay, action }) =>
      setTimeout(action, delay)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isVisible, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* 背景グラデーション */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.backgroundColor}`} />

      {/* スライドエフェクト */}
      <SlideEffect
        direction="left"
        isVisible={phase !== '入場'}
        duration={300}
      />
      <SlideEffect
        direction="right"
        isVisible={phase !== '入場'}
        duration={300}
      />

      {/* 浮遊エフェクト */}
      {showEffects && (
        <div className="absolute inset-0">
          {styles.effects.map((effect, index) => (
            <FloatingEffect
              key={index}
              effect={effect}
              delay={index * 200}
              duration={2000 + index * 100}
            />
          ))}
        </div>
      )}

      {/* 中央コンテンツ */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`text-center transform transition-all duration-500 ${
            showText
              ? 'translate-y-0 opacity-100 scale-100'
              : 'translate-y-8 opacity-0 scale-95'
          }`}
        >
          {/* メインメッセージ */}
          <h1
            className={`text-6xl font-bold ${styles.textColor} mb-4`}
            style={{
              textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
              fontFamily: 'serif'
            }}
          >
            {styles.message}
          </h1>

          {/* サブメッセージ */}
          {type === 'バトル開始' && (
            <div className={`text-2xl ${styles.textColor} space-y-2`}>
              <p className="animate-pulse">
                {playerName} VS {enemyName}
              </p>
            </div>
          )}

          {type === '勝利' && (
            <div className={`text-xl ${styles.textColor} space-y-2`}>
              <p className="animate-bounce">
                {enemyName}を倒した！
              </p>
              <p className="text-lg opacity-80">
                経験値を獲得！
              </p>
            </div>
          )}

          {type === '敗北' && (
            <div className={`text-xl ${styles.textColor} space-y-2`}>
              <p className="animate-pulse">
                {playerName}は倒れた...
              </p>
              <p className="text-lg opacity-60">
                ポケモンセンターへ急ごう
              </p>
            </div>
          )}

          {type === '逃走' && (
            <div className={`text-xl ${styles.textColor} space-y-2`}>
              <p className="animate-pulse">
                うまく逃げ切った！
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 画面端のライトエフェクト */}
      {showEffects && (
        <>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-pulse" />
          <div className="absolute left-0 top-0 w-2 h-full bg-gradient-to-b from-transparent via-white to-transparent opacity-60 animate-pulse" />
          <div className="absolute right-0 top-0 w-2 h-full bg-gradient-to-b from-transparent via-white to-transparent opacity-60 animate-pulse" />
        </>
      )}

      {/* フェードアウトオーバーレイ */}
      {phase === '退場' && (
        <div
          className="absolute inset-0 bg-black transition-opacity duration-1000"
          style={{ opacity: 0.8 }}
        />
      )}
    </div>
  );
}

/**
 * バトル演出シーケンス管理コンポーネント
 * 初学者向け：複数の演出を連続で表示
 */
export function BattleTransitionSequence({
  transitions,
  onComplete
}: {
  transitions: Array<{
    type: 演出タイプ;
    playerName?: string;
    enemyName?: string;
    duration?: number;
  }>;
  onComplete?: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const handleTransitionComplete = () => {
    if (currentIndex < transitions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
      onComplete?.();
    }
  };

  if (!isPlaying || currentIndex >= transitions.length) return null;

  const currentTransition = transitions[currentIndex];

  return (
    <BattleTransition
      type={currentTransition.type}
      isVisible={true}
      playerName={currentTransition.playerName}
      enemyName={currentTransition.enemyName}
      duration={currentTransition.duration}
      onComplete={handleTransitionComplete}
    />
  );
}

export default BattleTransition;