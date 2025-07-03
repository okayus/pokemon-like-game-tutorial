// 初学者向け：所有ポケモン一覧ページ
// プレイヤーが捕まえたポケモンを管理する画面

import { OwnedPokemonList } from '../components/OwnedPokemonList';
import { CommonHeader } from '../components/CommonHeader';

/**
 * 所有ポケモン一覧ページコンポーネント
 * 初学者向け：プレイヤーが所有しているポケモンの管理画面
 */
export default function OwnedPokemonPage() {
  // プレイヤーIDを取得（本来はログイン機能から取得するが、今回は固定）
  // 初学者向け：認証システムが実装されるまではテスト用の固定値を使用
  const プレイヤーID = 'test-player-001';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 共通ヘッダー */}
      <CommonHeader />

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">手持ちポケモン</h2>
          <p className="text-gray-600">
            あなたが捕まえたポケモンの一覧です。ポケモンをクリックして詳細情報を確認できます。
          </p>
        </div>

        {/* 所有ポケモンリストコンポーネント */}
        <OwnedPokemonList プレイヤーID={プレイヤーID} />
      </main>
    </div>
  );
}
