// 初学者向け：ポケモン図鑑ページ
// ポケモン図鑑コンポーネントを表示するページコンポーネント

import { PokemonDex } from '../components/PokemonDex';
import { CommonHeader } from '../components/CommonHeader';
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
      {/* 共通ヘッダー */}
      <CommonHeader />

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
