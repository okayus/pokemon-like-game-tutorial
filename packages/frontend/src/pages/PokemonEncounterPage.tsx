// 初学者向け：ポケモンエンカウント（遭遇）ページ
// 野生のポケモンに遭遇して捕獲するページ

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ポケモンマスタ } from '@pokemon-like-game-tutorial/shared';
import { ポケモンAPIサービス } from '../services/pokemonApi';
import { PokemonEncounter } from '../components/PokemonEncounter';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { SuccessNotification, useSuccessNotification } from '../components/SuccessNotification';

/**
 * ポケモンエンカウントページコンポーネント
 * 初学者向け：URLパラメータから種族IDを取得し、その野生ポケモンと遭遇
 */
export default function PokemonEncounterPage() {
  const { speciesId } = useParams<{ speciesId: string }>();
  const navigate = useNavigate();

  // 状態管理
  // 初学者向け：遭遇中のポケモン情報を管理
  const [野生ポケモン, set野生ポケモン] = useState<ポケモンマスタ | null>(null);
  const [読み込み中, set読み込み中] = useState(true);
  const [エラー, setエラー] = useState<string | null>(null);

  // プレイヤーID（本来は認証システムから取得）
  const プレイヤーID = 'test-player-001';

  // APIサービスのインスタンス（useMemoで安定化）
  const apiサービス = useMemo(() => new ポケモンAPIサービス(), []);

  // 成功通知のフック
  const { 通知状態, 成功通知表示, 成功通知を閉じる } = useSuccessNotification();

  // ポケモンデータの取得
  useEffect(() => {
    const ポケモンデータ取得 = async () => {
      if (!speciesId) {
        setエラー('ポケモンIDが指定されていません');
        set読み込み中(false);
        return;
      }

      try {
        set読み込み中(true);
        setエラー(null);

        // 全種族データから該当するポケモンを探す
        const 全種族 = await apiサービス.全種族データ取得();
        const 対象ポケモン = 全種族.find((p) => p.species_id === parseInt(speciesId));

        if (!対象ポケモン) {
          setエラー('指定されたポケモンが見つかりません');
        } else {
          set野生ポケモン(対象ポケモン);
        }
      } catch (error) {
        console.error('ポケモンデータ取得エラー:', error);
        setエラー('ポケモンデータの取得に失敗しました');
      } finally {
        set読み込み中(false);
      }
    };

    ポケモンデータ取得();
  }, [speciesId, apiサービス]);

  // 捕獲成功時のハンドラー
  const 捕獲成功ハンドラー = () => {
    // 成功通知を表示
    成功通知表示(`${野生ポケモン?.name}の捕獲に成功しました！`, {
      ラベル: '手持ちを確認',
      実行: () => navigate('/pokemon/owned'),
    });
  };

  // 逃げるハンドラー
  const 逃げるハンドラー = () => {
    // 初学者向け：前のページに戻る
    navigate(-1);
  };

  // 読み込み中の表示
  if (読み込み中) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200">
        <LoadingSpinner message="ポケモンを探しています..." fullScreen={true} />
      </div>
    );
  }

  // エラー時の表示
  if (エラー || !野生ポケモン) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200">
        <ErrorMessage
          message={エラー || 'ポケモンが見つかりません'}
          type="error"
          showRetry={true}
          retryLabel="戻る"
          onRetry={() => navigate(-1)}
          fullScreen={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">野生のポケモンが現れた！</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        <PokemonEncounter
          野生ポケモン={野生ポケモン}
          プレイヤーID={プレイヤーID}
          APIサービス={apiサービス}
          on捕獲成功={捕獲成功ハンドラー}
          on逃げる={逃げるハンドラー}
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
        autoCloseMs={0}
      />
    </div>
  );
}
