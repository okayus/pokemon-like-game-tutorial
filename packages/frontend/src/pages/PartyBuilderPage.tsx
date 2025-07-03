// 初学者向け：パーティ編成ページ
// 最大6体のポケモンでパーティを編成する画面

import { useState, useEffect } from 'react';
import type { フラット所有ポケモン, パーティポケモン } from '@pokemon-like-game-tutorial/shared';
import { ポケモンAPIサービス } from '../services/pokemonApi';
import { PartyBuilder } from '../components/PartyBuilder';
import { CommonHeader } from '../components/CommonHeader';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { SuccessNotification, useSuccessNotification } from '../components/SuccessNotification';

/**
 * パーティ編成ページコンポーネント
 * 初学者向け：プレイヤーの手持ちポケモン（最大6体）を管理
 */
export default function PartyBuilderPage() {
  // 状態管理
  const [所有ポケモン一覧, set所有ポケモン一覧] = useState<フラット所有ポケモン[]>([]);
  const [現在のパーティ, set現在のパーティ] = useState<パーティポケモン[]>([]);
  const [読み込み中, set読み込み中] = useState(true);
  const [エラー, setエラー] = useState<string | null>(null);

  // プレイヤーID（本来は認証システムから取得）
  const プレイヤーID = 'test-player-001';

  // APIサービスのインスタンス
  const apiサービス = new ポケモンAPIサービス();

  // 成功通知のフック
  const { 通知状態, 成功通知表示, 成功通知を閉じる } = useSuccessNotification();

  // データの取得
  useEffect(() => {
    データ取得();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const データ取得 = async () => {
    try {
      set読み込み中(true);
      setエラー(null);

      // 並行してデータを取得
      const [所有ポケモン結果, パーティ結果] = await Promise.all([
        apiサービス.所有ポケモン一覧取得(プレイヤーID),
        apiサービス.パーティ取得(プレイヤーID),
      ]);

      set所有ポケモン一覧(所有ポケモン結果.ポケモンリスト);
      set現在のパーティ(パーティ結果);
    } catch (error) {
      console.error('データ取得エラー:', error);
      setエラー('データの読み込みに失敗しました');
    } finally {
      set読み込み中(false);
    }
  };

  // パーティ更新ハンドラー
  const パーティ更新 = async (position: number, pokemonId: string | null) => {
    try {
      const 更新後のパーティ = await apiサービス.パーティ編成更新(プレイヤーID, {
        position,
        pokemon_id: pokemonId || undefined,
      });

      set現在のパーティ(更新後のパーティ);

      // 成功通知を表示
      if (pokemonId) {
        成功通知表示('パーティにポケモンを追加しました！');
      } else {
        成功通知表示('パーティからポケモンを外しました');
      }
    } catch (error) {
      console.error('パーティ更新エラー:', error);
      setエラー('パーティの更新に失敗しました');
    }
  };

  // 読み込み中の表示
  if (読み込み中) {
    return <LoadingSpinner message="パーティデータを読み込んでいます..." fullScreen={true} />;
  }

  // エラー時の表示
  if (エラー && !所有ポケモン一覧.length) {
    return (
      <ErrorMessage
        message={エラー}
        type="error"
        showRetry={true}
        retryLabel="再読み込み"
        onRetry={データ取得}
        fullScreen={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 共通ヘッダー */}
      <CommonHeader />

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">パーティ編成</h2>
          <p className="text-gray-600">
            最大6体のポケモンでパーティを編成できます。
            空きスロットをクリックしてポケモンを追加しましょう。
          </p>
          {エラー && (
            <div className="mt-2">
              <ErrorMessage message={エラー} type="error" onClose={() => setエラー(null)} />
            </div>
          )}
        </div>

        {/* パーティ編成コンポーネント */}
        <PartyBuilder
          所有ポケモン一覧={所有ポケモン一覧}
          現在のパーティ={現在のパーティ}
          onパーティ更新={パーティ更新}
        />
      </main>

      {/* 成功通知 */}
      <SuccessNotification
        message={通知状態.メッセージ}
        show={通知状態.表示中}
        onClose={成功通知を閉じる}
        showAction={!!通知状態.アクション}
        actionLabel={通知状態.アクション?.ラベル}
        onAction={通知状態.アクション?.実行}
      />
    </div>
  );
}
