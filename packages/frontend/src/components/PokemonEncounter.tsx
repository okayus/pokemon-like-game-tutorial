// 初学者向け：ポケモンエンカウントコンポーネント
// 野生のポケモンとの遭遇画面を表示し、捕獲処理を管理

import { useState } from 'react';
import type { ポケモンマスタ, ポケモン捕獲リクエスト } from '@pokemon-like-game-tutorial/shared';
import type { ポケモンAPIサービス } from '../services/pokemonApi';

interface PokemonEncounterProps {
  /** 遭遇中の野生ポケモン */
  野生ポケモン: ポケモンマスタ;
  /** プレイヤーID */
  プレイヤーID: string;
  /** APIサービス */
  APIサービス: ポケモンAPIサービス;
  /** 捕獲成功時のコールバック */
  on捕獲成功?: () => void;
  /** 逃げる時のコールバック */
  on逃げる?: () => void;
}

/**
 * ポケモンエンカウントコンポーネント
 * 初学者向け：野生ポケモンとの遭遇と捕獲処理を管理
 */
export function PokemonEncounter({
  野生ポケモン,
  プレイヤーID,
  APIサービス,
  on捕獲成功,
  on逃げる,
}: PokemonEncounterProps) {
  // 状態管理
  const [捕獲モード, set捕獲モード] = useState(false);
  const [捕獲中, set捕獲中] = useState(false);
  const [捕獲結果, set捕獲結果] = useState<'成功' | '失敗' | null>(null);
  const [エラー, setエラー] = useState<string | null>(null);

  // フォーム状態
  const [レベル, setレベル] = useState(5);
  const [ニックネーム, setニックネーム] = useState('');

  // 捕獲処理
  const 捕獲実行 = async () => {
    // バリデーション
    if (レベル < 1 || レベル > 100) {
      setエラー('レベルは1〜100の範囲で入力してください');
      return;
    }

    try {
      set捕獲中(true);
      setエラー(null);

      const 捕獲リクエスト: ポケモン捕獲リクエスト = {
        species_id: 野生ポケモン.species_id,
        level: レベル,
        nickname: ニックネーム.trim() || undefined,
      };

      // 捕獲APIを呼び出し
      await APIサービス.ポケモン捕獲(プレイヤーID, 捕獲リクエスト);

      // 成功演出
      set捕獲結果('成功');

      // 成功コールバックを実行
      if (on捕獲成功) {
        setTimeout(on捕獲成功, 2000);
      }
    } catch (error) {
      console.error('捕獲エラー:', error);
      setエラー('捕獲に失敗しました。もう一度お試しください。');
      set捕獲結果('失敗');
    } finally {
      set捕獲中(false);
    }
  };

  // 捕獲モードに切り替え
  const 捕獲開始 = () => {
    set捕獲モード(true);
    setエラー(null);
  };

  // キャンセル処理
  const キャンセル = () => {
    set捕獲モード(false);
    setエラー(null);
    setレベル(5);
    setニックネーム('');
  };

  // 捕獲成功時の表示
  if (捕獲結果 === '成功') {
    const 表示名 = ニックネーム || 野生ポケモン.name;
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">
              やったー！{表示名}を捕まえた！
            </h2>
            <p className="text-gray-600">{表示名}は手持ちポケモンに加わりました</p>
          </div>

          {野生ポケモン.sprite_url && (
            <img
              src={野生ポケモン.sprite_url}
              alt={表示名}
              className="mx-auto w-48 h-48 object-contain"
            />
          )}

          <p className="text-sm text-gray-500 mt-4">まもなく所有ポケモン一覧に移動します...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        {/* ポケモン表示エリア */}
        <div className="bg-gradient-to-b from-sky-100 to-green-100 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            野生の{野生ポケモン.name}が現れた！
          </h2>

          {野生ポケモン.sprite_url ? (
            <img
              src={野生ポケモン.sprite_url}
              alt={`野生の${野生ポケモン.name}`}
              className="mx-auto w-64 h-64 object-contain animate-bounce-slow"
            />
          ) : (
            <div className="w-64 h-64 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">画像なし</span>
            </div>
          )}

          {/* ステータス表示 */}
          <div className="mt-6 inline-block bg-white/80 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">HP:</span>
                <span className="font-bold ml-1">{野生ポケモン.hp}</span>
              </div>
              <div>
                <span className="text-gray-600">攻撃:</span>
                <span className="font-bold ml-1">{野生ポケモン.attack}</span>
              </div>
              <div>
                <span className="text-gray-600">防御:</span>
                <span className="font-bold ml-1">{野生ポケモン.defense}</span>
              </div>
            </div>
          </div>
        </div>

        {/* アクションエリア */}
        <div className="p-6">
          {!捕獲モード ? (
            // 初期アクションボタン
            <div className="flex gap-4">
              <button
                onClick={捕獲開始}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
              >
                捕まえる
              </button>
              <button
                onClick={on逃げる}
                className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 transition-colors"
              >
                逃げる
              </button>
            </div>
          ) : (
            // 捕獲フォーム
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">捕獲情報を入力</h3>

              {/* レベル入力 */}
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                  レベル
                </label>
                <input
                  id="level"
                  type="number"
                  min="1"
                  max="100"
                  value={レベル}
                  onChange={(e) => {
                    const 値 = e.target.value;
                    if (値 === '') {
                      setレベル(1);
                    } else {
                      const 数値 = parseInt(値);
                      if (!isNaN(数値)) {
                        setレベル(数値);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={捕獲中}
                />
              </div>

              {/* ニックネーム入力 */}
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                  ニックネーム（任意）
                </label>
                <input
                  id="nickname"
                  type="text"
                  value={ニックネーム}
                  onChange={(e) => setニックネーム(e.target.value)}
                  placeholder={`例: ${野生ポケモン.name}ちゃん`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={捕獲中}
                />
              </div>

              {/* エラー表示 */}
              {エラー && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{エラー}</p>
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex gap-3">
                <button
                  onClick={捕獲実行}
                  disabled={捕獲中}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {捕獲中 ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      捕獲中...
                    </span>
                  ) : (
                    'ボールを投げる'
                  )}
                </button>
                <button
                  onClick={キャンセル}
                  disabled={捕獲中}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition-colors disabled:cursor-not-allowed"
                >
                  やめる
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
