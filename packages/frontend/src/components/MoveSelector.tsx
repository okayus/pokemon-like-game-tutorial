// 初学者向け：技選択コンポーネント
// ポケモンの技を選択するためのUI

import React from 'react';
import type { 技データ } from '@pokemon-like-game-tutorial/shared';

/**
 * 覚えている技（現在のPP付き）の型定義
 * 初学者向け：ポケモンが現在覚えている技の情報
 */
interface 覚えている技 extends 技データ {
  current_pp: number; // 現在のPP
}

/**
 * 技選択コンポーネントのProps型定義
 * 初学者向け：技選択に必要な情報
 */
interface MoveSelectorProps {
  moves: 覚えている技[];           // 選択可能な技リスト
  selectedMoveId: number | null;   // 現在選択中の技ID
  onMoveSelect: (moveId: number | null) => void; // 技選択時のコールバック
  disabled?: boolean;              // 選択を無効にするかどうか
  showDetails?: boolean;           // 技の詳細情報を表示するか
}

/**
 * 技タイプに応じた色を取得
 * 初学者向け：ポケモンの技タイプごとに色分け
 */
function getTechnicalTypeColor(type: string): string {
  const typeColors: Record<string, string> = {
    'ノーマル': 'bg-gray-400',
    'ほのお': 'bg-red-500',
    'みず': 'bg-blue-500',
    'でんき': 'bg-yellow-400',
    'くさ': 'bg-green-500',
    'こおり': 'bg-cyan-400',
    'かくとう': 'bg-red-700',
    'どく': 'bg-purple-500',
    'じめん': 'bg-yellow-600',
    'ひこう': 'bg-indigo-400',
    'エスパー': 'bg-pink-500',
    'むし': 'bg-green-600',
    'いわ': 'bg-yellow-700',
    'ゴースト': 'bg-purple-700',
    'ドラゴン': 'bg-indigo-700',
    'あく': 'bg-gray-800',
    'はがね': 'bg-gray-500',
    'フェアリー': 'bg-pink-300'
  };
  
  return typeColors[type] || 'bg-gray-400';
}

/**
 * 技カテゴリに応じたアイコンを取得
 * 初学者向け：物理・特殊・変化技の区別表示
 */
function getTechnicalCategoryIcon(category: string): string {
  switch (category) {
    case '物理':
      return '⚔️'; // 剣のアイコン
    case '特殊':
      return '✨'; // 星のアイコン
    case '変化':
      return '🔄'; // 変化のアイコン
    default:
      return '❓'; // 不明のアイコン
  }
}

/**
 * 技選択コンポーネント
 * 初学者向け：ポケモンの技を選択するためのUI
 */
export function MoveSelector({
  moves,
  selectedMoveId,
  onMoveSelect,
  disabled = false,
  showDetails = true
}: MoveSelectorProps) {
  
  // 技選択ハンドラー
  const handleMoveClick = (moveId: number, currentPP: number) => {
    if (disabled || currentPP === 0) return;
    
    // 同じ技を再度クリックした場合は選択解除
    if (selectedMoveId === moveId) {
      onMoveSelect(null);
    } else {
      onMoveSelect(moveId);
    }
  };

  // 技が使用可能かチェック
  const isMoveUsable = (move: 覚えている技): boolean => {
    return !disabled && move.current_pp > 0;
  };

  // 技の効果説明を短縮
  const shortenDescription = (description: string, maxLength: number = 50): string => {
    if (description.length <= maxLength) return description;
    return description.slice(0, maxLength) + '...';
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-white mb-4">
        技を選択してください
      </h3>
      
      {moves.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <p>覚えている技がありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {moves.map((move) => {
            const isSelected = selectedMoveId === move.move_id;
            const isUsable = isMoveUsable(move);
            const typeColor = getTechnicalTypeColor(move.type);
            const categoryIcon = getTechnicalCategoryIcon(move.category);
            
            return (
              <button
                key={move.move_id}
                onClick={() => handleMoveClick(move.move_id, move.current_pp)}
                disabled={!isUsable}
                className={`
                  relative p-4 rounded-lg border-2 text-left transition-all transform hover:scale-105
                  ${isSelected
                    ? 'bg-blue-600 border-blue-400 shadow-lg'
                    : isUsable
                    ? 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500'
                    : 'bg-gray-600 border-gray-500 opacity-50 cursor-not-allowed'
                  }
                `}
              >
                {/* 技名とカテゴリ */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-lg">
                    {move.name}
                  </h4>
                  <span className="text-xl" title={`カテゴリ: ${move.category}`}>
                    {categoryIcon}
                  </span>
                </div>

                {/* 技タイプ */}
                <div className="flex items-center mb-2">
                  <span 
                    className={`${typeColor} text-white text-xs px-2 py-1 rounded-full font-medium`}
                  >
                    {move.type}
                  </span>
                </div>

                {/* 技の基本情報 */}
                <div className="flex justify-between items-center mb-2 text-sm text-gray-300">
                  <div className="flex space-x-4">
                    <span>威力: {move.power || '−'}</span>
                    <span>命中: {move.accuracy}%</span>
                  </div>
                </div>

                {/* PP表示 */}
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm">
                    <span className={`font-medium ${move.current_pp === 0 ? 'text-red-400' : 'text-gray-300'}`}>
                      PP: {move.current_pp}/{move.pp}
                    </span>
                  </div>
                  
                  {/* PPバー */}
                  <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        move.current_pp / move.pp > 0.5 ? 'bg-green-500' :
                        move.current_pp / move.pp > 0.25 ? 'bg-yellow-500' :
                        move.current_pp > 0 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(move.current_pp / move.pp) * 100}%` }}
                    />
                  </div>
                </div>

                {/* 技の説明（詳細表示時のみ） */}
                {showDetails && (
                  <p className="text-xs text-gray-400 mt-2">
                    {shortenDescription(move.description)}
                  </p>
                )}

                {/* PP切れ警告 */}
                {move.current_pp === 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    PP切れ
                  </div>
                )}

                {/* 選択中インジケーター */}
                {isSelected && (
                  <div className="absolute top-2 left-2 bg-blue-400 text-white text-xs px-2 py-1 rounded">
                    選択中
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 操作ヒント */}
      {moves.length > 0 && (
        <div className="text-xs text-gray-400 text-center mt-4">
          {disabled ? 
            'アニメーション中は技を選択できません' :
            '技をクリックして選択、再度クリックで選択解除'
          }
        </div>
      )}
    </div>
  );
}

/**
 * 簡易技選択コンポーネント
 * 初学者向け：最小限の情報のみ表示する技選択
 */
export function SimpleMoveSelector({
  moves,
  selectedMoveId,
  onMoveSelect,
  disabled = false
}: MoveSelectorProps) {
  return (
    <MoveSelector
      moves={moves}
      selectedMoveId={selectedMoveId}
      onMoveSelect={onMoveSelect}
      disabled={disabled}
      showDetails={false}
    />
  );
}

export default MoveSelector;