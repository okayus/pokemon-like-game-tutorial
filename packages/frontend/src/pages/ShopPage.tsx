// 初学者向け：ショップページコンポーネント
// アイテムの購入・売却を行うショップシステム

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { デフォルトアイテムAPIサービス } from '../services/itemApi';
import type { 
  アイテムマスタ,
  インベントリアイテム,
  アイテムカテゴリ,
  アイテム購入リクエスト,
  アイテム売却リクエスト
} from '@pokemon-like-game-tutorial/shared';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { SuccessNotification } from '../components/SuccessNotification';

/**
 * ショップページコンポーネント
 * 初学者向け：アイテムの購入と売却を管理する画面
 */
function ShopPage() {
  const navigate = useNavigate();
  const { playerId } = useParams<{ playerId: string }>();
  
  // 状態管理：ショップモード（購入/売却）
  const [ショップモード, setショップモード] = useState<'購入' | '売却'>('購入');
  
  // 状態管理：アイテムマスター一覧（購入用）
  const [アイテムマスター一覧, setアイテムマスター一覧] = useState<アイテムマスタ[]>([]);
  
  // 状態管理：所持アイテム一覧（売却用）
  const [所持アイテム一覧, set所持アイテム一覧] = useState<インベントリアイテム[]>([]);
  
  // 状態管理：所持金
  const [所持金, set所持金] = useState<number>(0);
  
  // 状態管理：ローディング状態
  const [読み込み中, set読み込み中] = useState<boolean>(true);
  
  // 状態管理：エラーメッセージ
  const [エラーメッセージ, setエラーメッセージ] = useState<string>('');
  
  // 状態管理：成功メッセージ
  const [成功メッセージ, set成功メッセージ] = useState<string>('');
  
  // 状態管理：選択中のカテゴリ
  const [選択中カテゴリ, set選択中カテゴリ] = useState<アイテムカテゴリ | 'all'>('all');
  
  // 状態管理：処理中のアイテムID
  const [処理中アイテムID, set処理中アイテムID] = useState<number | null>(null);

  // 定数：カテゴリ一覧
  const カテゴリ一覧: Array<{ key: アイテムカテゴリ | 'all'; label: string; icon: string }> = [
    { key: 'all', label: 'すべて', icon: '📦' },
    { key: '回復', label: '回復', icon: '💊' },
    { key: 'ボール', label: 'ボール', icon: '⚾' },
    { key: '戦闘', label: '戦闘', icon: '⚔️' },
    { key: '大切なもの', label: '大切なもの', icon: '💎' },
    { key: 'その他', label: 'その他', icon: '📋' }
  ];

  /**
   * 初回ロード時のデータ取得
   * 初学者向け：ショップに必要なデータを取得
   */
  const 初期データ取得 = async () => {
    if (!playerId) {
      setエラーメッセージ('プレイヤーIDが指定されていません');
      set読み込み中(false);
      return;
    }

    try {
      set読み込み中(true);
      setエラーメッセージ('');

      // 並列でデータ取得
      const [アイテムマスター, インベントリ] = await Promise.all([
        デフォルトアイテムAPIサービス.全アイテムマスター取得(),
        デフォルトアイテムAPIサービス.インベントリ取得(playerId, { limit: 100 })
      ]);

      setアイテムマスター一覧(アイテムマスター);
      set所持アイテム一覧(インベントリ.items);
      set所持金(インベントリ.player_money);
      
    } catch (error) {
      console.error('初期データ取得エラー:', error);
      setエラーメッセージ('データの取得に失敗しました');
    } finally {
      set読み込み中(false);
    }
  };

  /**
   * アイテムを購入する関数
   * 初学者向け：選択されたアイテムを購入する処理
   */
  const アイテム購入 = async (itemId: number, itemName: string, price: number) => {
    if (!playerId || 処理中アイテムID) return;

    // 所持金チェック
    if (所持金 < price) {
      setエラーメッセージ('所持金が不足しています');
      return;
    }

    // 購入確認ダイアログ
    const 購入確認 = window.confirm(
      `${itemName}を${price.toLocaleString()}円で購入しますか？\n現在の所持金: ${所持金.toLocaleString()}円`
    );
    if (!購入確認) return;

    try {
      set処理中アイテムID(itemId);
      setエラーメッセージ('');

      const 購入リクエスト: アイテム購入リクエスト = {
        player_id: playerId,
        item_id: itemId,
        quantity: 1
      };

      const result = await デフォルトアイテムAPIサービス.アイテム購入(購入リクエスト);
      
      if (result.success) {
        set成功メッセージ(result.message || `${itemName}を購入しました`);
        set所持金(result.new_money_amount);
        // インベントリを再取得
        await 初期データ取得();
      } else {
        setエラーメッセージ(result.message || 'アイテムの購入に失敗しました');
      }

    } catch (error) {
      console.error('アイテム購入エラー:', error);
      setエラーメッセージ('アイテムの購入に失敗しました');
    } finally {
      set処理中アイテムID(null);
    }
  };

  /**
   * アイテムを売却する関数
   * 初学者向け：選択されたアイテムを売却する処理
   */
  const アイテム売却 = async (item: インベントリアイテム) => {
    if (!playerId || 処理中アイテムID) return;

    // 売却可能チェック
    if (item.sell_price === 0) {
      setエラーメッセージ('このアイテムは売却できません');
      return;
    }

    // 売却確認ダイアログ
    const 売却確認 = window.confirm(
      `${item.name}を${item.sell_price.toLocaleString()}円で売却しますか？\n所持数: ${item.quantity}個`
    );
    if (!売却確認) return;

    try {
      set処理中アイテムID(item.item_id);
      setエラーメッセージ('');

      const 売却リクエスト: アイテム売却リクエスト = {
        player_id: playerId,
        item_id: item.item_id,
        quantity: 1
      };

      const result = await デフォルトアイテムAPIサービス.アイテム売却(売却リクエスト);
      
      if (result.success) {
        set成功メッセージ(result.message || `${item.name}を売却しました`);
        set所持金(result.new_money_amount);
        // インベントリを再取得
        await 初期データ取得();
      } else {
        setエラーメッセージ(result.message || 'アイテムの売却に失敗しました');
      }

    } catch (error) {
      console.error('アイテム売却エラー:', error);
      setエラーメッセージ('アイテムの売却に失敗しました');
    } finally {
      set処理中アイテムID(null);
    }
  };

  /**
   * カテゴリでフィルタリングされたアイテム一覧を取得
   * 初学者向け：選択されたカテゴリに応じてアイテムを絞り込む
   */
  const フィルター済みアイテム取得 = (): (アイテムマスタ | インベントリアイテム)[] => {
    if (ショップモード === '購入') {
      // 購入可能なアイテムのみ表示
      const 購入可能アイテム = アイテムマスター一覧.filter(item => item.buy_price > 0);
      
      if (選択中カテゴリ === 'all') {
        return 購入可能アイテム;
      }
      return 購入可能アイテム.filter(item => item.category === 選択中カテゴリ);
    } else {
      // 売却可能なアイテムのみ表示
      const 売却可能アイテム = 所持アイテム一覧.filter(item => item.sell_price > 0);
      
      if (選択中カテゴリ === 'all') {
        return 売却可能アイテム;
      }
      return 売却可能アイテム.filter(item => item.category === 選択中カテゴリ);
    }
  };

  // 初回ロード時にデータ取得
  useEffect(() => {
    初期データ取得();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId]);

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

  const フィルター済みアイテム = フィルター済みアイテム取得();

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
              <h1 className="text-2xl font-bold text-white">🏪 ショップ</h1>
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

        {/* モード切り替えタブ */}
        <div className="mb-6 bg-slate-800 rounded-lg p-2 flex">
          <button
            onClick={() => setショップモード('購入')}
            className={`flex-1 py-2 px-4 rounded-md font-bold transition-colors ${
              ショップモード === '購入'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            🛒 購入
          </button>
          <button
            onClick={() => setショップモード('売却')}
            className={`flex-1 py-2 px-4 rounded-md font-bold transition-colors ${
              ショップモード === '売却'
                ? 'bg-green-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            💰 売却
          </button>
        </div>

        {/* カテゴリフィルター */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {カテゴリ一覧.map((category) => (
              <button
                key={category.key}
                onClick={() => set選択中カテゴリ(category.key)}
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
        ) : フィルター済みアイテム.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-white mb-2">
              {ショップモード === '購入' ? '購入可能なアイテムがありません' : '売却可能なアイテムがありません'}
            </h3>
            <p className="text-slate-300">
              {選択中カテゴリ !== 'all' && 'カテゴリを変更してみてください'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {フィルター済みアイテム.map((item) => {
              const isアイテムマスタ = 'item_id' in item && 'buy_price' in item;
              const isinベントリアイテム = 'item_id' in item && 'quantity' in item;
              
              const itemId = item.item_id;
              const itemName = item.name;
              const itemCategory = item.category;
              const itemDescription = item.description;
              
              const 価格 = ショップモード === '購入' 
                ? (isアイテムマスタ ? (item as アイテムマスタ).buy_price : 0)
                : (isアイテムマスタ ? (item as アイテムマスタ).sell_price : (item as インベントリアイテム).sell_price);
              const 所持数 = isinベントリアイテム ? (item as インベントリアイテム).quantity : 0;

              return (
                <div key={itemId} className="bg-slate-800 rounded-lg p-4 hover:bg-slate-700 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
                        {itemCategory === '回復' && '💊'}
                        {itemCategory === 'ボール' && '⚾'}
                        {itemCategory === '戦闘' && '⚔️'}
                        {itemCategory === '大切なもの' && '💎'}
                        {itemCategory === 'その他' && '📋'}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{itemName}</h3>
                        <p className="text-sm text-slate-400">{itemCategory}</p>
                      </div>
                    </div>
                    {ショップモード === '売却' && (
                      <div className="text-right">
                        <span className="text-lg font-bold text-blue-400">×{所持数}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-300 mb-4">{itemDescription}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-yellow-400">
                      {価格.toLocaleString()}円
                    </div>
                    
                    <button
                      onClick={() => {
                        if (ショップモード === '購入') {
                          アイテム購入(itemId, itemName, 価格);
                        } else {
                          アイテム売却(item as インベントリアイテム);
                        }
                      }}
                      disabled={処理中アイテムID === itemId}
                      className={`px-4 py-2 font-bold rounded transition-colors ${
                        ショップモード === '購入'
                          ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white'
                          : 'bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white'
                      }`}
                    >
                      {処理中アイテムID === itemId 
                        ? '処理中...' 
                        : ショップモード === '購入' ? '購入' : '売却'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ShopPage;