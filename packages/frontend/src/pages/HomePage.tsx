// 初学者向け：ホームページコンポーネント
// ゲームの開始画面とマップ選択を提供します

import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { 全マップデータ, デフォルト開始マップID } from '../../../shared/src/data/mapDefinitions';

/**
 * ホームページコンポーネント
 * 初学者向け：ゲームのトップページです
 */
export default function HomePage() {
  const navigate = useNavigate();

  /**
   * 新しいゲームを開始する
   * 初学者向け：デフォルトのマップでゲームを開始します
   */
  const 新しいゲーム開始 = () => {
    // デフォルトマップの中央位置で開始
    navigate(`/map/${encodeURIComponent(デフォルト開始マップID)}?x=10&y=7`);
  };

  /**
   * 特定のマップに直接移動する
   * 初学者向け：開発・デバッグ用の機能です
   */
  const マップに移動 = (マップID: string) => {
    navigate(`/map/${encodeURIComponent(マップID)}?x=10&y=7`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* ゲームタイトル */}
        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-8">
          Pokemon-like Game
        </h1>

        {/* 説明文 */}
        <p className="text-slate-300 text-xl mb-12 leading-relaxed">
          初学者向けのポケモンライクな2Dブラウザゲーム
          <br />
          矢印キーで移動して、マップを探検しよう！
        </p>

        {/* ゲーム開始ボタン */}
        <div className="space-y-6 mb-12">
          <Button
            onClick={新しいゲーム開始}
            className="text-xl px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-2xl transform transition-all duration-200 hover:scale-105"
          >
            🎮 新しいゲームを開始
          </Button>

          {/* 継続してプレイする場合 */}
          <div className="text-slate-400 text-sm">
            セーブデータがある場合は、ゲーム内でLキーを押してロードできます
          </div>
        </div>

        {/* マップ選択（開発用） */}
        <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">🗺️ マップ選択（開発用）</h2>
          <p className="text-slate-400 text-sm mb-4">直接特定のマップに移動できます</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(全マップデータ).map(([マップID, マップ]) => (
              <Button
                key={マップID}
                onClick={() => マップに移動(マップID)}
                variant="outline"
                className="p-4 text-left border-slate-600 hover:border-blue-500 hover:bg-slate-700/50 transition-all duration-200"
              >
                <div>
                  <div className="font-semibold text-white">{マップ.名前}</div>
                  <div className="text-sm text-slate-400">
                    {マップ.幅}×{マップ.高さ} タイル
                  </div>
                  <div className="text-xs text-slate-500 mt-1">出口: {マップ.出口.length}箇所</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* フッター */}
        <div className="mt-12 text-slate-500 text-sm">
          <p>🎯 学習目的で作成されたゲームです</p>
          <p className="mt-2">操作方法: 矢印キー（移動）| S（セーブ）| L（ロード）</p>
        </div>
      </div>
    </div>
  );
}
