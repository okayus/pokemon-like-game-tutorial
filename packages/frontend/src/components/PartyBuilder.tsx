// 初学者向け：パーティ編成コンポーネント
// 6体のポケモンスロットとポケモン選択機能を提供

import { useState, useMemo } from 'react';
import type { フラット所有ポケモン, パーティポケモン } from '@pokemon-like-game-tutorial/shared';

interface PartyBuilderProps {
  /** 所有しているポケモンの一覧 */
  所有ポケモン一覧: フラット所有ポケモン[];
  /** 現在のパーティ構成 */
  現在のパーティ: パーティポケモン[];
  /** パーティ更新時のコールバック */
  onパーティ更新: (position: number, pokemonId: string | null) => void;
}

/**
 * パーティ編成コンポーネント
 * 初学者向け：手持ちポケモン（最大6体）を視覚的に管理
 */
export function PartyBuilder({
  所有ポケモン一覧,
  現在のパーティ,
  onパーティ更新,
}: PartyBuilderProps) {
  // 状態管理
  const [選択中のスロット, set選択中のスロット] = useState<number | null>(null);
  const [ドラッグ中のスロット, setドラッグ中のスロット] = useState<number | null>(null);

  // パーティに含まれているポケモンIDのセット
  const パーティポケモンIDセット = useMemo(() => {
    return new Set(現在のパーティ.map((p) => p.pokemon_id));
  }, [現在のパーティ]);

  // 各スロットのポケモン情報を取得
  const スロット情報取得 = (position: number) => {
    const パーティメンバー = 現在のパーティ.find((p) => p.position === position);
    if (!パーティメンバー) return null;

    // フラット所有ポケモンから詳細情報を取得
    return 所有ポケモン一覧.find((p) => p.pokemon_id === パーティメンバー.pokemon_id);
  };

  // パーティの統計情報
  const パーティ統計 = useMemo(() => {
    const メンバー = 現在のパーティ
      .map((p) => 所有ポケモン一覧.find((owned) => owned.pokemon_id === p.pokemon_id))
      .filter(Boolean);

    if (メンバー.length === 0) {
      return { 総HP: 0, 平均レベル: 0, メンバー数: 0 };
    }

    const 総HP = メンバー.reduce((sum, p) => sum + (p?.max_hp || 0), 0);
    const 平均レベル = Math.floor(
      メンバー.reduce((sum, p) => sum + (p?.level || 0), 0) / メンバー.length
    );

    return { 総HP, 平均レベル, メンバー数: メンバー.length };
  }, [現在のパーティ, 所有ポケモン一覧]);

  // スロットクリックハンドラー
  const スロットクリック = (position: number) => {
    const 既存ポケモン = スロット情報取得(position);
    if (既存ポケモン) {
      // 既にポケモンがいる場合は選択解除
      set選択中のスロット(null);
    } else {
      // 空きスロットの場合は選択モードに
      set選択中のスロット(position);
    }
  };

  // ポケモン選択ハンドラー
  const ポケモン選択 = (pokemonId: string) => {
    if (選択中のスロット !== null) {
      onパーティ更新(選択中のスロット, pokemonId);
      set選択中のスロット(null);
    }
  };

  // ポケモン削除ハンドラー
  const ポケモン削除 = (position: number) => {
    onパーティ更新(position, null);
  };

  // ドラッグ開始
  const ドラッグ開始 = (position: number) => {
    setドラッグ中のスロット(position);
  };

  // ドラッグオーバー
  const ドラッグオーバー = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // ドロップ
  const ドロップ = (targetPosition: number) => {
    if (ドラッグ中のスロット === null || ドラッグ中のスロット === targetPosition) {
      return;
    }

    // 初学者向け：ドラッグ&ドロップでの並び替えは複雑なため、今回は簡略化
    // TODO: 実装は学習課題として残す
    setドラッグ中のスロット(null);
  };

  return (
    <div className="space-y-6">
      {/* パーティスロット */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">現在のパーティ</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((position) => {
            const ポケモン = スロット情報取得(position);

            return (
              <div
                key={position}
                data-testid={`party-slot-${position}`}
                draggable={!!ポケモン}
                onDragStart={() => ドラッグ開始(position)}
                onDragOver={ドラッグオーバー}
                onDrop={() => ドロップ(position)}
                onClick={() => スロットクリック(position)}
                className={`
                  relative h-32 border-2 rounded-lg p-4 cursor-pointer transition-all
                  ${ポケモン ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-gray-50 border-dashed'}
                  ${選択中のスロット === position ? 'ring-2 ring-blue-500' : ''}
                  hover:shadow-md
                `}
              >
                <div className="absolute top-1 left-2 text-sm font-bold text-gray-500">
                  {position}
                </div>

                {ポケモン ? (
                  <div className="flex items-center h-full">
                    {/* ポケモン画像 */}
                    <div className="w-20 h-20 flex-shrink-0">
                      {ポケモン.sprite_url ? (
                        <img
                          src={ポケモン.sprite_url}
                          alt={ポケモン.nickname || ポケモン.species_name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                          画像なし
                        </div>
                      )}
                    </div>

                    {/* ポケモン情報 */}
                    <div className="ml-3 flex-1">
                      <h3 className="font-bold text-gray-800 text-sm">
                        {ポケモン.nickname || ポケモン.species_name}
                      </h3>
                      <p className="text-xs text-gray-600">Lv.{ポケモン.level}</p>
                      <p className="text-xs text-gray-600">
                        HP: {ポケモン.current_hp}/{ポケモン.max_hp}
                      </p>
                    </div>

                    {/* 削除ボタン */}
                    <button
                      data-testid={`remove-pokemon-${position}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        ポケモン削除(position);
                      }}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-gray-400 text-sm">空きスロット</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* パーティ統計 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3">パーティステータス</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">メンバー数</p>
            <p className="text-2xl font-bold text-blue-600">{パーティ統計.メンバー数}/6</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">総HP:</p>
            <p className="text-2xl font-bold text-green-600">{パーティ統計.総HP}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">平均レベル:</p>
            <p className="text-2xl font-bold text-purple-600">{パーティ統計.平均レベル}</p>
          </div>
        </div>
      </div>

      {/* ポケモン選択モーダル */}
      {選択中のスロット !== null && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">ポケモンを選択</h3>
            <button
              onClick={() => set選択中のスロット(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {所有ポケモン一覧.map((ポケモン) => {
              const 既にパーティにいる = パーティポケモンIDセット.has(ポケモン.pokemon_id);

              return (
                <div
                  key={ポケモン.pokemon_id}
                  data-testid="pokemon-select-card"
                  data-disabled={既にパーティにいる}
                  onClick={() => !既にパーティにいる && ポケモン選択(ポケモン.pokemon_id)}
                  className={`
                    border rounded-lg p-3 cursor-pointer transition-all
                    ${
                      既にパーティにいる
                        ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                        : 'border-gray-300 hover:border-blue-400 hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex items-center">
                    {/* ポケモン画像 */}
                    <div className="w-16 h-16 flex-shrink-0">
                      {ポケモン.sprite_url ? (
                        <img
                          src={ポケモン.sprite_url}
                          alt={ポケモン.nickname || ポケモン.species_name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                          画像なし
                        </div>
                      )}
                    </div>

                    {/* ポケモン情報 */}
                    <div className="ml-3 flex-1">
                      <h4 className="font-bold text-gray-800">
                        {ポケモン.nickname || ポケモン.species_name}
                      </h4>
                      <p className="text-sm text-gray-600">Lv.{ポケモン.level}</p>
                      {既にパーティにいる && (
                        <p className="text-xs text-red-600">パーティに編成済み</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {所有ポケモン一覧.length === 0 && (
            <p className="text-center text-gray-500 py-8">所有しているポケモンがいません</p>
          )}
        </div>
      )}
    </div>
  );
}
