// 初学者向け：ポケモン図鑑コンポーネント
// 全種族のポケモンを一覧表示し、検索・ソート機能を提供

import { useState, useEffect, useMemo } from 'react';
import type { ポケモンマスタ } from '@pokemon-like-game-tutorial/shared';
import { ポケモンAPIサービス } from '../services/pokemonApi';

// ソート順の種類
// 初学者向け：ユーザーが選択できるソート方法を定義
type ソート種類 = 'id' | 'name' | 'hp' | 'attack' | 'defense';

interface PokemonDexProps {
  /** APIサービス（テスト用に外部から注入可能） */
  APIサービス?: Pick<ポケモンAPIサービス, '全種族データ取得'>;
  /** ポケモンクリック時のコールバック */
  onポケモンクリック?: (ポケモン: ポケモンマスタ) => void;
}

/**
 * ポケモン図鑑コンポーネント
 * 初学者向け：すべてのポケモン種族を表示し、詳細情報を確認できる画面
 */
export function PokemonDex({ 
  APIサービス,
  onポケモンクリック 
}: PokemonDexProps) {
  // 状態管理
  // 初学者向け：コンポーネントの状態をuseStateで管理
  const [ポケモンデータ, setポケモンデータ] = useState<ポケモンマスタ[]>([]);
  const [読み込み中, set読み込み中] = useState(true);
  const [エラー, setエラー] = useState<string | null>(null);
  const [検索文字, set検索文字] = useState('');
  const [ソート順, setソート順] = useState<ソート種類>('id');
  const [選択中のポケモン, set選択中のポケモン] = useState<ポケモンマスタ | null>(null);

  // 使用するAPIサービス（デフォルトまたは注入されたもの）
  const 使用するAPIサービス = APIサービス || new ポケモンAPIサービス();

  // ポケモンデータを取得する関数
  // 初学者向け：バックエンドAPIからポケモン情報を取得
  const ポケモンデータ取得 = async () => {
    try {
      set読み込み中(true);
      setエラー(null);
      
      const データ = await 使用するAPIサービス.全種族データ取得();
      setポケモンデータ(データ);
    } catch (エラー) {
      console.error('ポケモンデータ取得エラー:', エラー);
      setエラー('ポケモンデータの読み込みに失敗しました');
    } finally {
      set読み込み中(false);
    }
  };

  // コンポーネント初回表示時にデータを取得
  useEffect(() => {
    ポケモンデータ取得();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escキーでモーダルを閉じる機能
  useEffect(() => {
    const Escキー処理 = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && 選択中のポケモン) {
        詳細モーダルを閉じる();
      }
    };

    document.addEventListener('keydown', Escキー処理);
    return () => document.removeEventListener('keydown', Escキー処理);
  }, [選択中のポケモン]);

  // フィルタリングとソート済みのポケモンリスト
  // 初学者向け：検索文字とソート順に基づいてリストを加工
  const フィルタ済みポケモンリスト = useMemo(() => {
    let 結果 = [...ポケモンデータ];

    // 検索フィルター適用
    if (検索文字.trim()) {
      結果 = 結果.filter(ポケモン => 
        ポケモン.name.toLowerCase().includes(検索文字.toLowerCase())
      );
    }

    // ソート適用
    結果.sort((a, b) => {
      switch (ソート順) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'hp':
          return a.hp - b.hp;
        case 'attack':
          return a.attack - b.attack;
        case 'defense':
          return a.defense - b.defense;
        case 'id':
        default:
          return a.species_id - b.species_id;
      }
    });

    return 結果;
  }, [ポケモンデータ, 検索文字, ソート順]);

  // ポケモンカードクリックハンドラー
  const ポケモンカードクリック = (ポケモン: ポケモンマスタ) => {
    set選択中のポケモン(ポケモン);
    onポケモンクリック?.(ポケモン);
  };

  // 詳細モーダルを閉じる
  const 詳細モーダルを閉じる = () => {
    set選択中のポケモン(null);
  };

  // 読み込み中の表示
  if (読み込み中) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 p-8">
        <div role="status" className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">ポケモン図鑑を読み込んでいます...</p>
      </div>
    );
  }

  // エラー時の表示
  if (エラー) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{エラー}</p>
          <button
            onClick={ポケモンデータ取得}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">ポケモン図鑑</h1>
        <p className="text-gray-600">図鑑登録数: {フィルタ済みポケモンリスト.length}種類</p>
      </div>

      {/* 検索・ソートコントロール */}
      <div className="mb-6 space-y-4">
        {/* 検索ボックス */}
        <div>
          <input
            type="text"
            placeholder="ポケモン名で検索..."
            value={検索文字}
            onChange={(e) => set検索文字(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* ソートボタン */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'id' as const, label: 'ID順' },
            { key: 'name' as const, label: '名前順' },
            { key: 'hp' as const, label: 'HPでソート' },
            { key: 'attack' as const, label: '攻撃力順' },
            { key: 'defense' as const, label: '防御力順' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setソート順(key)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                ソート順 === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ポケモンリスト */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {フィルタ済みポケモンリスト.map((ポケモン) => (
          <div
            key={ポケモン.species_id}
            data-testid="pokemon-card"
            onClick={() => ポケモンカードクリック(ポケモン)}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 overflow-hidden"
          >
            {/* ポケモン画像 */}
            <div className="h-48 bg-gray-50 flex items-center justify-center">
              {ポケモン.sprite_url ? (
                <img
                  src={ポケモン.sprite_url}
                  alt={ポケモン.name}
                  className="max-h-40 max-w-40 object-contain"
                />
              ) : (
                <div className="text-gray-400 text-sm">画像なし</div>
              )}
            </div>

            {/* ポケモン情報 */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                #{ポケモン.species_id.toString().padStart(3, '0')} {ポケモン.name}
              </h3>
              
              {/* ステータス */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">HP:</span>
                  <span className="font-medium">{ポケモン.hp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">攻撃:</span>
                  <span className="font-medium">{ポケモン.attack}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">防御:</span>
                  <span className="font-medium">{ポケモン.defense}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 検索結果が空の場合 */}
      {フィルタ済みポケモンリスト.length === 0 && ポケモンデータ.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">「{検索文字}」に一致するポケモンが見つかりませんでした。</p>
        </div>
      )}

      {/* 詳細モーダル */}
      {選択中のポケモン && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={詳細モーダルを閉じる}
        >
          <div 
            role="dialog" 
            className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {選択中のポケモン.name}の詳細情報
              </h2>
              <button
                onClick={詳細モーダルを閉じる}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* 詳細情報 */}
            <div className="space-y-4">
              {/* 画像 */}
              <div className="text-center">
                {選択中のポケモン.sprite_url ? (
                  <img
                    src={選択中のポケモン.sprite_url}
                    alt={選択中のポケモン.name}
                    className="mx-auto max-h-40 max-w-40 object-contain"
                  />
                ) : (
                  <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                    画像なし
                  </div>
                )}
              </div>

              {/* 基本情報 */}
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">図鑑番号:</span>
                  <span>#{選択中のポケモン.species_id.toString().padStart(3, '0')}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">HP:</span>
                  <span>{選択中のポケモン.hp}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">攻撃力:</span>
                  <span>{選択中のポケモン.attack}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">防御力:</span>
                  <span>{選択中のポケモン.defense}</span>
                </div>
              </div>
            </div>

            {/* 閉じるボタン */}
            <div className="mt-6 text-center">
              <button
                onClick={詳細モーダルを閉じる}
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}