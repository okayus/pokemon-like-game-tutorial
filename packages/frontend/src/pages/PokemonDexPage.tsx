// 初学者向け：ポケモン図鑑ページ
// ポケモン図鑑コンポーネントを表示するページコンポーネント

import React from 'react';
import { PokemonDex } from '../components/PokemonDex';
import type { ポケモンマスタ } from '@pokemon-like-game-tutorial/shared';

/**
 * ポケモン図鑑ページコンポーネント
 * 初学者向け：ポケモン図鑑を表示するためのページ
 */
export default function PokemonDexPage() {
  // ポケモンクリック時のハンドラー
  // 初学者向け：将来的に詳細ページに遷移したり、捕獲画面を開くなどの処理
  const ポケモンクリックハンドラー = (ポケモン: ポケモンマスタ) => {
    console.log('選択されたポケモン:', ポケモン);
    // TODO: 将来的に詳細ページへの遷移や追加アクションを実装
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーションヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">ポケモンライクゲーム</h1>
            <nav className="flex space-x-4">
              <a 
                href="/map/始まりの町" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                マップに戻る
              </a>
              <a 
                href="/pokemon/owned" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                所有ポケモン
              </a>
              <a 
                href="/pokemon/party" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                パーティ編成
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main>
        <PokemonDex onポケモンクリック={ポケモンクリックハンドラー} />
      </main>

      {/* フッター */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            <p>ポケモンライクゲーム - 学習用プロジェクト</p>
            <p className="text-sm mt-2">初学者向けのプログラミング学習コンテンツです</p>
          </div>
        </div>
      </footer>
    </div>
  );
}