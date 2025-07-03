// 初学者向け：ポケモン選択ダイアログコンポーネント
// アイテム使用時にポケモンを選択するためのダイアログ

import { useState, useEffect } from 'react';
import type { 所有ポケモン } from '@pokemon-like-game-tutorial/shared';

/**
 * ポケモン選択ダイアログのプロパティ
 */
interface PokemonSelectDialogProps {
  /** ダイアログを表示するかどうか */
  isOpen: boolean;
  /** 使用するアイテムの名前 */
  itemName: string;
  /** アイテムの効果タイプ */
  effectType: string;
  /** 閉じる時の処理 */
  onClose: () => void;
  /** ポケモンを選択した時の処理 */
  onSelectPokemon: (pokemon: 所有ポケモン) => void;
  /** プレイヤーID */
  playerId: string;
}

/**
 * ポケモンカードコンポーネント
 * 初学者向け：1匹のポケモンの情報を表示
 */
function PokemonCard({ 
  pokemon, 
  canUse, 
  onSelect 
}: { 
  pokemon: 所有ポケモン; 
  canUse: boolean;
  onSelect: () => void;
}) {
  // HP割合を計算
  const hpPercentage = (pokemon.current_hp / pokemon.stats.max_hp) * 100;
  
  // HP状態による色分け
  const getHpColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-500';
    if (percentage >= 50) return 'text-yellow-500';
    if (percentage >= 25) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div 
      className={`bg-slate-700 rounded-lg p-4 transition-all cursor-pointer ${
        canUse 
          ? 'hover:bg-slate-600 border-2 border-transparent hover:border-blue-500' 
          : 'opacity-50 cursor-not-allowed'
      }`}
      onClick={canUse ? onSelect : undefined}
    >
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-16 h-16 bg-slate-600 rounded-lg flex items-center justify-center">
          <span className="text-2xl">🐾</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white">{pokemon.nickname || pokemon.species.name}</h3>
          <p className="text-sm text-slate-300">Lv.{pokemon.level}</p>
          <p className="text-xs text-slate-400">{pokemon.species.name}</p>
        </div>
      </div>
      
      {/* HP バー */}
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-300">HP</span>
          <span className={`font-bold ${getHpColor(hpPercentage)}`}>
            {pokemon.current_hp}/{pokemon.stats.max_hp}
          </span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              hpPercentage >= 75 ? 'bg-green-500' :
              hpPercentage >= 50 ? 'bg-yellow-500' :
              hpPercentage >= 25 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${hpPercentage}%` }}
          />
        </div>
      </div>

      {/* 状態表示 */}
      <div className="text-xs text-gray-400 mt-1">
        HP: {Math.round(hpPercentage)}%
      </div>

      {!canUse && (
        <div className="text-xs text-red-400 mt-2">
          このアイテムは使用できません
        </div>
      )}
    </div>
  );
}

/**
 * ポケモン選択ダイアログコンポーネント
 * 初学者向け：アイテム使用対象のポケモンを選択
 */
export function PokemonSelectDialog({
  isOpen,
  itemName,
  effectType,
  onClose,
  onSelectPokemon,
  playerId
}: PokemonSelectDialogProps) {
  const [所有ポケモン一覧, set所有ポケモン一覧] = useState<所有ポケモン[]>([]);
  const [読み込み中, set読み込み中] = useState(false);
  const [エラーメッセージ, setエラーメッセージ] = useState('');

  /**
   * 所有ポケモン一覧を取得
   * 初学者向け：プレイヤーの手持ちポケモンを取得
   */
  const ポケモン一覧取得 = async () => {
    try {
      set読み込み中(true);
      setエラーメッセージ('');

      // ここでは仮のデータを使用（実際のAPIが実装されていない場合）
      const mockPokemon: 所有ポケモン[] = [
        {
          pokemon_id: 'owned-1',
          player_id: playerId,
          species_id: 1,
          nickname: undefined,
          level: 5,
          current_hp: 15,
          caught_at: '2025-07-01T10:00:00Z',
          updated_at: '2025-07-01T10:00:00Z',
          species: {
            species_id: 1,
            name: 'フシギダネ',
            hp: 20,
            attack: 12,
            defense: 12,
            created_at: '2025-07-01T00:00:00Z'
          },
          stats: {
            max_hp: 20,
            attack: 12,
            defense: 12
          }
        },
        {
          pokemon_id: 'owned-2',
          player_id: playerId,
          species_id: 4,
          nickname: 'ファイア',
          level: 7,
          current_hp: 5,
          caught_at: '2025-07-01T11:00:00Z',
          updated_at: '2025-07-01T11:00:00Z',
          species: {
            species_id: 4,
            name: 'ヒトカゲ',
            hp: 22,
            attack: 15,
            defense: 10,
            created_at: '2025-07-01T00:00:00Z'
          },
          stats: {
            max_hp: 22,
            attack: 15,
            defense: 10
          }
        },
        {
          pokemon_id: 'owned-3',
          player_id: playerId,
          species_id: 7,
          nickname: undefined,
          level: 6,
          current_hp: 21,
          caught_at: '2025-07-01T12:00:00Z',
          updated_at: '2025-07-01T12:00:00Z',
          species: {
            species_id: 7,
            name: 'ゼニガメ',
            hp: 21,
            attack: 11,
            defense: 14,
            created_at: '2025-07-01T00:00:00Z'
          },
          stats: {
            max_hp: 21,
            attack: 11,
            defense: 14
          }
        }
      ];

      set所有ポケモン一覧(mockPokemon);
    } catch (error) {
      console.error('ポケモン一覧取得エラー:', error);
      setエラーメッセージ('ポケモンの一覧取得に失敗しました');
    } finally {
      set読み込み中(false);
    }
  };

  /**
   * アイテムが使用可能かどうかを判定
   * 初学者向け：アイテムの効果とポケモンの状態を確認
   */
  const canUseItemOnPokemon = (pokemon: 所有ポケモン): boolean => {
    switch (effectType) {
      case 'HP回復':
        return pokemon.current_hp < pokemon.stats.max_hp;
      case '状態異常回復':
        // 簡素版では状態異常なし、常に false
        return false;
      case '全回復':
        return pokemon.current_hp < pokemon.stats.max_hp;
      default:
        return true;
    }
  };

  // ダイアログが開かれた時にポケモン一覧を取得
  useEffect(() => {
    if (isOpen) {
      ポケモン一覧取得();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, playerId]);

  if (!isOpen) return null;

  return (
    <>
      {/* 背景オーバーレイ */}
      <div 
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />
      
      {/* ダイアログ本体 */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 rounded-lg shadow-2xl z-50 w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">ポケモンを選択</h2>
              <p className="text-slate-300">
                {itemName}を使用するポケモンを選んでください
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <span className="text-2xl text-slate-400">×</span>
            </button>
          </div>

          {/* エラーメッセージ */}
          {エラーメッセージ && (
            <div className="mb-4 p-3 bg-red-600/20 border border-red-500 rounded-lg">
              <p className="text-red-300">{エラーメッセージ}</p>
            </div>
          )}

          {/* コンテンツ */}
          <div className="max-h-96 overflow-y-auto">
            {読み込み中 ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : 所有ポケモン一覧.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🐾</div>
                <h3 className="text-xl font-bold text-white mb-2">ポケモンがいません</h3>
                <p className="text-slate-300">まずはポケモンを捕まえましょう</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {所有ポケモン一覧.map((pokemon) => (
                  <PokemonCard
                    key={pokemon.pokemon_id}
                    pokemon={pokemon}
                    canUse={canUseItemOnPokemon(pokemon)}
                    onSelect={() => onSelectPokemon(pokemon)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="mt-6 pt-4 border-t border-slate-700">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </>
  );
}