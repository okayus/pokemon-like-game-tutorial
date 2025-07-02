// 初学者向け：所有ポケモンリストコンポーネント
// プレイヤーが捕まえたポケモンを一覧表示し、検索・ソート機能を提供

import { useState, useEffect, useMemo } from 'react';
import type { フラット所有ポケモン, ポケモン検索フィルター } from '@pokemon-like-game-tutorial/shared';
import { ポケモンAPIサービス, デフォルトポケモンAPIサービス } from '../services/pokemonApi';

// ソート順の種類
// 初学者向け：ユーザーが選択できるソート方法を定義
type ソート種類 = 'caught_at' | 'level' | 'name' | 'species_id' | 'current_hp';

interface OwnedPokemonListProps {
  /** プレイヤーID */
  プレイヤーID: string;
  /** APIサービス（テスト用に外部から注入可能） */
  APIサービス?: Pick<ポケモンAPIサービス, '所有ポケモン一覧取得'>;
  /** ポケモンクリック時のコールバック */
  onポケモンクリック?: (ポケモン: フラット所有ポケモン) => void;
}

/**
 * 所有ポケモンリストコンポーネント
 * 初学者向け：プレイヤーが所有するポケモンを表示し、管理機能を提供
 */
export function OwnedPokemonList({ 
  プレイヤーID,
  APIサービス,
  onポケモンクリック 
}: OwnedPokemonListProps) {
  // 状態管理
  // 初学者向け：コンポーネントの状態をuseStateで管理
  const [所有ポケモンデータ, set所有ポケモンデータ] = useState<フラット所有ポケモン[]>([]);
  const [読み込み中, set読み込み中] = useState(true);
  const [エラー, setエラー] = useState<string | null>(null);
  const [検索文字, set検索文字] = useState('');
  const [ソート順, setソート順] = useState<ソート種類>('caught_at');
  const [選択中のポケモン, set選択中のポケモン] = useState<フラット所有ポケモン | null>(null);
  const [現在のページ, set現在のページ] = useState(1);
  const [総数, set総数] = useState(0);

  // 使用するAPIサービス（デフォルトまたは注入されたもの）
  const 使用するAPIサービス = APIサービス || デフォルトポケモンAPIサービス;

  // ページあたりの表示数
  const ページあたりの表示数 = 12;

  // 所有ポケモンデータを取得する関数
  // 初学者向け：バックエンドAPIから所有ポケモン情報を取得
  const 所有ポケモンデータ取得 = async (ページ: number = 1, 検索フィルター?: ポケモン検索フィルター) => {
    try {
      set読み込み中(true);
      setエラー(null);
      
      const フィルター: ポケモン検索フィルター = {
        page: ページ,
        limit: ページあたりの表示数,
        species_name: 検索フィルター?.species_name || (検索文字.trim() || undefined),
        ...検索フィルター
      };
      
      const 結果 = await 使用するAPIサービス.所有ポケモン一覧取得(プレイヤーID, フィルター);
      
      set所有ポケモンデータ(結果.ポケモンリスト);
      set総数(結果.総数);
      set現在のページ(ページ);
    } catch (エラー) {
      console.error('所有ポケモンデータ取得エラー:', エラー);
      setエラー('所有ポケモンデータの読み込みに失敗しました');
    } finally {
      set読み込み中(false);
    }
  };

  // コンポーネント初回表示時にデータを取得
  useEffect(() => {
    所有ポケモンデータ取得();
  }, [プレイヤーID]);

  // 検索文字が変更されたら検索実行（デバウンス処理）
  useEffect(() => {
    const タイマー = setTimeout(() => {
      if (現在のページ === 1) {
        所有ポケモンデータ取得(1);
      } else {
        set現在のページ(1);
        所有ポケモンデータ取得(1);
      }
    }, 300); // 300msの遅延で検索実行（入力中の無駄なAPI呼び出しを防ぐ）
    
    return () => clearTimeout(タイマー);
  }, [検索文字]);

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

  // ソート済みのポケモンリスト
  // 初学者向け：ソート順に基づいてリストを並び替え
  const ソート済みポケモンリスト = useMemo(() => {
    const 結果 = [...所有ポケモンデータ];

    結果.sort((a, b) => {
      switch (ソート順) {
        case 'level':
          return b.level - a.level; // レベル高い順
        case 'name': {
          const a名前 = a.nickname || a.species_name;
          const b名前 = b.nickname || b.species_name;
          return a名前.localeCompare(b名前);
        }
        case 'species_id':
          return a.species_id - b.species_id;
        case 'current_hp':
          return b.current_hp - a.current_hp; // HP高い順
        case 'caught_at':
        default:
          // 新しく捕まえた順（最新が先頭）
          return new Date(b.caught_at).getTime() - new Date(a.caught_at).getTime();
      }
    });

    return 結果;
  }, [所有ポケモンデータ, ソート順]);

  // ポケモンカードクリックハンドラー
  const ポケモンカードクリック = (ポケモン: フラット所有ポケモン) => {
    set選択中のポケモン(ポケモン);
    onポケモンクリック?.(ポケモン);
  };

  // 詳細モーダルを閉じる
  const 詳細モーダルを閉じる = () => {
    set選択中のポケモン(null);
  };

  // ページ変更ハンドラー
  const ページ変更 = (新しいページ: number) => {
    所有ポケモンデータ取得(新しいページ);
  };

  // 表示するポケモン名を取得（ニックネームまたは種族名）
  const ポケモン表示名取得 = (ポケモン: フラット所有ポケモン): string => {
    return ポケモン.nickname || ポケモン.species_name;
  };

  // HPバーの色を取得
  const HPバー色取得 = (現在HP: number, 最大HP: number): string => {
    const HP割合 = (現在HP / 最大HP) * 100;
    if (HP割合 > 50) return 'bg-green-500';
    if (HP割合 > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // 総ページ数を計算
  const 総ページ数 = Math.ceil(総数 / ページあたりの表示数);

  // 読み込み中の表示
  if (読み込み中) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 p-8">
        <div role="status" className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">所有ポケモンを読み込んでいます...</p>
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
            onClick={() => 所有ポケモンデータ取得()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">所有ポケモン一覧</h2>
          <p className="text-gray-600">所有ポケモン数: {総数}匹</p>
        </div>
      </div>

      {/* 検索・ソートコントロール */}
      <div className="space-y-4">
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
            { key: 'caught_at' as const, label: '捕獲順' },
            { key: 'level' as const, label: 'レベル順' },
            { key: 'name' as const, label: '名前順' },
            { key: 'species_id' as const, label: '図鑑順' },
            { key: 'current_hp' as const, label: 'HP順' }
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

      {/* 空のリスト表示 */}
      {ソート済みポケモンリスト.length === 0 && !読み込み中 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          {検索文字.trim() ? (
            <div>
              <p className="text-gray-600 mb-2">「{検索文字}」に一致するポケモンが見つかりませんでした。</p>
              <button
                onClick={() => set検索文字('')}
                className="text-blue-500 hover:text-blue-600"
              >
                検索をクリア
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">まだポケモンを捕まえていません</p>
              <p className="text-gray-500 text-sm">マップでポケモンを探してみましょう！</p>
            </div>
          )}
        </div>
      )}

      {/* ポケモンリスト */}
      {ソート済みポケモンリスト.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ソート済みポケモンリスト.map((ポケモン) => (
            <div
              key={ポケモン.pokemon_id}
              data-testid="owned-pokemon-card"
              onClick={() => ポケモンカードクリック(ポケモン)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 overflow-hidden"
            >
              {/* ポケモン画像 */}
              <div className="h-40 bg-gray-50 flex items-center justify-center relative">
                {ポケモン.sprite_url ? (
                  <img
                    src={ポケモン.sprite_url}
                    alt={ポケモン表示名取得(ポケモン)}
                    className="max-h-32 max-w-32 object-contain"
                  />
                ) : (
                  <div className="text-gray-400 text-sm">画像なし</div>
                )}
                
                {/* レベル表示 */}
                <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  Lv.{ポケモン.level}
                </div>
              </div>

              {/* ポケモン情報 */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {ポケモン表示名取得(ポケモン)}
                </h3>
                
                {/* ニックネームがある場合は種族名も表示 */}
                {ポケモン.nickname && (
                  <p className="text-sm text-gray-500 mb-2">({ポケモン.species_name})</p>
                )}
                
                {/* HP情報 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">HP:</span>
                    <span className="font-medium">{ポケモン.current_hp}/{ポケモン.max_hp}</span>
                  </div>
                  
                  {/* HPバー */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${HPバー色取得(ポケモン.current_hp, ポケモン.max_hp)}`}
                      style={{
                        width: `${(ポケモン.current_hp / ポケモン.max_hp) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* 捕獲日時 */}
                <div className="mt-3 text-xs text-gray-500">
                  捕獲日: {new Date(ポケモン.caught_at).toLocaleDateString('ja-JP')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ページネーション */}
      {総ページ数 > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          {/* 前のページボタン */}
          <button
            onClick={() => ページ変更(現在のページ - 1)}
            disabled={現在のページ <= 1}
            className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            前へ
          </button>
          
          {/* ページ番号 */}
          <span className="px-4 py-2 text-sm text-gray-600">
            {現在のページ} / {総ページ数}
          </span>
          
          {/* 次のページボタン */}
          <button
            onClick={() => ページ変更(現在のページ + 1)}
            disabled={現在のページ >= 総ページ数}
            className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次へ
          </button>
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
                {ポケモン表示名取得(選択中のポケモン)}の詳細情報
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
                    alt={ポケモン表示名取得(選択中のポケモン)}
                    className="mx-auto max-h-40 max-w-40 object-contain"
                  />
                ) : (
                  <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                    画像なし
                  </div>
                )}
              </div>

              {/* 詳細ステータス */}
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">種族:</span>
                  <span>{選択中のポケモン.species_name}</span>
                </div>
                {選択中のポケモン.nickname && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">ニックネーム:</span>
                    <span>{選択中のポケモン.nickname}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">レベル:</span>
                  <span>Lv.{選択中のポケモン.level}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">HP:</span>
                  <span>{選択中のポケモン.current_hp}/{選択中のポケモン.max_hp}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">基礎攻撃力:</span>
                  <span>{選択中のポケモン.base_attack}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">基礎防御力:</span>
                  <span>{選択中のポケモン.base_defense}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">捕獲日時:</span>
                  <span>{new Date(選択中のポケモン.caught_at).toLocaleString('ja-JP')}</span>
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