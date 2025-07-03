// 初学者向け：インベントリページコンポーネント
// プレイヤーの所持アイテムを表示・管理するメインページ

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { デフォルトアイテムAPIサービス } from '../services/itemApi';
import type { 
  インベントリアイテム, 
  アイテムカテゴリ, 
  インベントリフィルター, 
  アイテム使用リクエスト,
  所有ポケモン 
} from '@pokemon-like-game-tutorial/shared';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { SuccessNotification } from '../components/SuccessNotification';
import { PokemonSelectDialog } from '../components/PokemonSelectDialog';

/**
 * インベントリページコンポーネント
 * 初学者向け：プレイヤーのアイテム管理画面
 */
function InventoryPage() {
  const navigate = useNavigate();
  const { playerId } = useParams<{ playerId: string }>();
  
  // 状態管理：インベントリのアイテム一覧
  const [インベントリアイテム一覧, setインベントリアイテム一覧] = useState<インベントリアイテム[]>([]);
  
  // 状態管理：所持金
  const [所持金, set所持金] = useState<number>(0);
  
  // 状態管理：ローディング状態
  const [読み込み中, set読み込み中] = useState<boolean>(true);
  
  // 状態管理：エラーメッセージ
  const [エラーメッセージ, setエラーメッセージ] = useState<string>('');
  
  // 状態管理：成功メッセージ
  const [成功メッセージ, set成功メッセージ] = useState<string>('');
  
  // 状態管理：選択中のカテゴリタブ
  const [選択中カテゴリ, set選択中カテゴリ] = useState<アイテムカテゴリ | 'all'>('all');
  
  // 状態管理：検索キーワード
  const [検索キーワード, set検索キーワード] = useState<string>('');
  
  // 状態管理：ページネーション
  const [現在ページ, set現在ページ] = useState<number>(1);
  const [総ページ数, set総ページ数] = useState<number>(1);
  
  // 状態管理：アイテム使用中フラグ
  const [使用中アイテムID, set使用中アイテムID] = useState<number | null>(null);
  
  // 状態管理：ポケモン選択ダイアログ
  const [ポケモン選択ダイアログ表示, setポケモン選択ダイアログ表示] = useState<boolean>(false);
  const [選択中アイテム, set選択中アイテム] = useState<{ id: number; name: string; effectType: string } | null>(null);

  // 定数：カテゴリ一覧（タブ表示用）
  const カテゴリ一覧: Array<{ key: アイテムカテゴリ | 'all'; label: string; icon: string }> = [
    { key: 'all', label: 'すべて', icon: '📦' },
    { key: '回復', label: '回復', icon: '💊' },
    { key: 'ボール', label: 'ボール', icon: '⚾' },
    { key: '戦闘', label: '戦闘', icon: '⚔️' },
    { key: '大切なもの', label: '大切なもの', icon: '💎' },
    { key: 'その他', label: 'その他', icon: '📋' }
  ];

  /**
   * インベントリデータを取得する関数
   * 初学者向け：フィルター条件に基づいてアイテム一覧を取得
   */
  const インベントリ取得 = async () => {
    if (!playerId) {
      setエラーメッセージ('プレイヤーIDが指定されていません');
      set読み込み中(false);
      return;
    }

    try {
      set読み込み中(true);
      setエラーメッセージ('');

      // フィルター条件の構築
      const フィルター: インベントリフィルター = {
        search_keyword: 検索キーワード || undefined,
        category: 選択中カテゴリ === 'all' ? undefined : 選択中カテゴリ,
        sort_by: 'obtained_at',
        sort_order: 'desc',
        page: 現在ページ,
        limit: 20
      };

      // APIからデータ取得
      const result = await デフォルトアイテムAPIサービス.インベントリ取得(playerId, フィルター);
      
      setインベントリアイテム一覧(result.items);
      set所持金(result.player_money);
      set総ページ数(result.total_pages);
      
    } catch (error) {
      console.error('インベントリ取得エラー:', error);
      setエラーメッセージ('インベントリの取得に失敗しました');
    } finally {
      set読み込み中(false);
    }
  };

  /**
   * アイテムを使用する関数
   * 初学者向け：選択されたアイテムを1個使用する
   */
  const アイテム使用 = async (itemId: number, itemName: string, effectType?: string) => {
    if (!playerId || 使用中アイテムID) return;

    // 回復アイテムの場合、ポケモン選択ダイアログを表示
    if (effectType && (effectType === 'HP回復' || effectType === '状態異常回復' || effectType === '全回復')) {
      set選択中アイテム({ id: itemId, name: itemName, effectType });
      setポケモン選択ダイアログ表示(true);
      return;
    }

    // 通常のアイテム使用（プレイヤー自身への使用）
    await アイテム直接使用(itemId, itemName, 'player');
  };

  /**
   * アイテムを直接使用する関数
   * 初学者向け：対象が決まっているアイテムの使用処理
   */
  const アイテム直接使用 = async (itemId: number, itemName: string, targetId: string) => {
    if (!playerId || 使用中アイテムID) return;

    // 使用確認ダイアログ
    const 使用確認 = window.confirm(`${itemName}を使用しますか？`);
    if (!使用確認) return;

    try {
      set使用中アイテムID(itemId);
      setエラーメッセージ('');

      const 使用リクエスト: アイテム使用リクエスト = {
        player_id: playerId,
        item_id: itemId,
        quantity: 1,
        target_id: targetId
      };

      const result = await デフォルトアイテムAPIサービス.アイテム使用(使用リクエスト);
      
      if (result.success) {
        set成功メッセージ(result.message || `${itemName}を使用しました`);
        // インベントリを再取得して最新状態に更新
        await インベントリ取得();
      } else {
        setエラーメッセージ(result.message || 'アイテムの使用に失敗しました');
      }

    } catch (error) {
      console.error('アイテム使用エラー:', error);
      setエラーメッセージ('アイテムの使用に失敗しました');
    } finally {
      set使用中アイテムID(null);
    }
  };

  /**
   * ポケモンを選択してアイテムを使用
   * 初学者向け：選択されたポケモンに対してアイテムを使用
   */
  const ポケモンにアイテム使用 = async (pokemon: 所有ポケモン) => {
    if (!選択中アイテム) return;

    setポケモン選択ダイアログ表示(false);
    await アイテム直接使用(選択中アイテム.id, 選択中アイテム.name, pokemon.pokemon_id);
    set選択中アイテム(null);
  };

  /**
   * ポケモン選択ダイアログを閉じる
   * 初学者向け：ダイアログキャンセル時の処理
   */
  const ポケモン選択ダイアログ閉じる = () => {
    setポケモン選択ダイアログ表示(false);
    set選択中アイテム(null);
  };

  /**
   * カテゴリタブの変更処理
   * 初学者向け：選択されたカテゴリに応じてフィルタリング
   */
  const カテゴリ変更 = (category: アイテムカテゴリ | 'all') => {
    set選択中カテゴリ(category);
    set現在ページ(1); // ページを最初に戻す
  };

  /**
   * 検索キーワードの変更処理
   * 初学者向け：入力された検索キーワードでフィルタリング
   */
  const 検索実行 = (keyword: string) => {
    set検索キーワード(keyword);
    set現在ページ(1); // ページを最初に戻す
  };

  /**
   * ページ変更処理
   * 初学者向け：ページネーションの処理
   */
  const ページ変更 = (newPage: number) => {
    if (newPage >= 1 && newPage <= 総ページ数) {
      set現在ページ(newPage);
    }
  };

  // 初回ロード時とフィルター条件変更時にデータ取得
  useEffect(() => {
    インベントリ取得();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, 選択中カテゴリ, 検索キーワード, 現在ページ]);

  // プレイヤーIDが無い場合のエラー画面
  if (!playerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">エラー</h1>
          <p className="text-slate-300 mb-8">プレイヤーIDが指定されていません</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* ヘッダー部分 */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <span>←</span>
                <span>戻る</span>
              </button>
              <h1 className="text-2xl font-bold text-white">📦 インベントリ</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 所持金表示 */}
              <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 rounded-lg">
                <span className="text-yellow-100">💰</span>
                <span className="text-white font-bold">{所持金.toLocaleString()}円</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 通知メッセージ */}
        {エラーメッセージ && (
          <div className="mb-4">
            <ErrorMessage message={エラーメッセージ} onClose={() => setエラーメッセージ('')} />
          </div>
        )}
        
        {成功メッセージ && (
          <div className="mb-4">
            <SuccessNotification 
              message={成功メッセージ} 
              show={!!成功メッセージ}
              onClose={() => set成功メッセージ('')} 
            />
          </div>
        )}

        {/* 検索とフィルター */}
        <div className="mb-6 bg-slate-800 rounded-lg p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 検索ボックス */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="アイテム名で検索..."
                value={検索キーワード}
                onChange={(e) => 検索実行(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* カテゴリタブ */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {カテゴリ一覧.map((category) => (
              <button
                key={category.key}
                onClick={() => カテゴリ変更(category.key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  選択中カテゴリ === category.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* アイテム一覧 */}
        {読み込み中 ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : インベントリアイテム一覧.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-white mb-2">アイテムがありません</h3>
            <p className="text-slate-300">
              {検索キーワード || 選択中カテゴリ !== 'all' 
                ? '検索条件に該当するアイテムが見つかりませんでした' 
                : 'まだアイテムを所持していません'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {インベントリアイテム一覧.map((item) => (
              <div key={item.item_id} className="bg-slate-800 rounded-lg p-4 hover:bg-slate-700 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
                      {item.category === '回復' && '💊'}
                      {item.category === 'ボール' && '⚾'}
                      {item.category === '戦闘' && '⚔️'}
                      {item.category === '大切なもの' && '💎'}
                      {item.category === 'その他' && '📋'}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{item.name}</h3>
                      <p className="text-sm text-slate-400">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-400">×{item.quantity}</span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-300 mb-4">{item.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    {item.effect_type && (
                      <span>効果: {item.effect_type} {item.effect_value > 0 && `+${item.effect_value}`}</span>
                    )}
                  </div>
                  
                  {item.usable && (
                    <button
                      onClick={() => アイテム使用(item.item_id, item.name, item.effect_type)}
                      disabled={使用中アイテムID === item.item_id}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                    >
                      {使用中アイテムID === item.item_id ? '使用中...' : '使用'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ポケモン選択ダイアログ */}
        <PokemonSelectDialog
          isOpen={ポケモン選択ダイアログ表示}
          itemName={選択中アイテム?.name || ''}
          effectType={選択中アイテム?.effectType || ''}
          onClose={ポケモン選択ダイアログ閉じる}
          onSelectPokemon={ポケモンにアイテム使用}
          playerId={playerId || ''}
        />

        {/* ページネーション */}
        {総ページ数 > 1 && (
          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={() => ページ変更(現在ページ - 1)}
              disabled={現在ページ <= 1}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded-lg transition-colors"
            >
              前のページ
            </button>
            
            <span className="text-white">
              {現在ページ} / {総ページ数}
            </span>
            
            <button
              onClick={() => ページ変更(現在ページ + 1)}
              disabled={現在ページ >= 総ページ数}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded-lg transition-colors"
            >
              次のページ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default InventoryPage;