// セーブ/ロード画面のコンポーネント（初学者向け：ゲームの保存と読み込み画面）
import { useState, useEffect } from 'react';
import { GameState, セーブスロット } from '@pokemon-like-game-tutorial/shared';
import { Button } from './ui/button';

interface SaveLoadDialogProps {
  開いている: boolean;
  モード: 'save' | 'load';
  現在のゲーム状態: GameState;
  プレイ時間: number;
  閉じる: () => void;
  ゲーム状態を設定: (state: GameState) => void;
}

export default function SaveLoadDialog({
  開いている,
  モード,
  現在のゲーム状態,
  プレイ時間,
  閉じる,
  ゲーム状態を設定,
}: SaveLoadDialogProps) {
  const [セーブスロット一覧, setセーブスロット一覧] = useState<(セーブスロット | null)[]>([
    null,
    null,
    null,
  ]);
  const [読み込み中, set読み込み中] = useState(false);
  const [エラー, setエラー] = useState<string | null>(null);

  // 仮のユーザーID（初学者向け：本来は認証システムから取得）
  const ユーザーID = 1;

  // セーブデータ一覧を取得（初学者向け：サーバーから保存済みデータを取得）
  useEffect(() => {
    if (開いている) {
      loadセーブデータ一覧();
    }
  }, [開いている]);

  const loadセーブデータ一覧 = async () => {
    try {
      const response = await fetch(`http://localhost:8787/api/saves/${ユーザーID}`);
      const data = await response.json();

      // スロット番号でデータを整理（初学者向け：1〜3のスロットに配置）
      const スロット配列: (セーブスロット | null)[] = [null, null, null];
      data.saves.forEach((save: セーブスロット) => {
        スロット配列[save.slot - 1] = save;
      });

      setセーブスロット一覧(スロット配列);
    } catch (error) {
      console.error('セーブデータ取得エラー:', error);
    }
  };

  // セーブ実行（初学者向け：現在のゲーム状態を保存）
  const handleセーブ = async (スロット番号: number) => {
    if (!confirm(`スロット${スロット番号}にセーブしますか？`)) {
      return;
    }

    set読み込み中(true);
    setエラー(null);

    try {
      const response = await fetch(
        `http://localhost:8787/api/saves/${ユーザーID}/${スロット番号}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player: {
              name: 現在のゲーム状態.player.name,
              position: 現在のゲーム状態.player.position,
              direction: 現在のゲーム状態.player.direction,
            },
            currentMap: 現在のゲーム状態.currentMap,
            playTime: プレイ時間,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('セーブに失敗しました');
      }

      await loadセーブデータ一覧();
      alert('セーブしました！');
    } catch {
      setエラー('セーブに失敗しました');
    } finally {
      set読み込み中(false);
    }
  };

  // ロード実行（初学者向け：保存されたデータを読み込み）
  const handleロード = async (スロット番号: number) => {
    const スロット = セーブスロット一覧[スロット番号 - 1];
    if (!スロット) return;

    if (!confirm(`スロット${スロット番号}からロードしますか？\n現在の進行状況は失われます。`)) {
      return;
    }

    set読み込み中(true);
    setエラー(null);

    try {
      // プレイヤー情報を復元（初学者向け：保存データからゲーム状態を再構築）
      ゲーム状態を設定({
        ...現在のゲーム状態,
        player: {
          ...現在のゲーム状態.player,
          name: スロット.data.player.name,
          position: スロット.data.player.position,
          direction: スロット.data.player.direction,
        },
        currentMap: スロット.data.currentMap,
      });

      alert('ロードしました！');
      閉じる();
    } catch {
      setエラー('ロードに失敗しました');
    } finally {
      set読み込み中(false);
    }
  };

  // プレイ時間を表示用に変換（初学者向け：秒を時:分:秒形式に）
  const formatプレイ時間 = (秒: number): string => {
    const 時間 = Math.floor(秒 / 3600);
    const 分 = Math.floor((秒 % 3600) / 60);
    const 残り秒 = 秒 % 60;
    return `${時間}:${分.toString().padStart(2, '0')}:${残り秒.toString().padStart(2, '0')}`;
  };

  // ダイアログが開いていない場合は何も表示しない
  if (!開いている) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      data-testid="save-dialog"
    >
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold">{モード === 'save' ? 'セーブ' : 'ロード'}</h2>
        </div>

        {エラー && (
          <div className="text-red-500 text-sm mb-4" data-testid="save-error">
            {エラー}
          </div>
        )}

        <div className="space-y-4">
          {[1, 2, 3].map((スロット番号) => {
            const スロット = セーブスロット一覧[スロット番号 - 1];

            return (
              <div
                key={スロット番号}
                className="border p-4 rounded"
                data-testid={`save-slot-${スロット番号}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">スロット {スロット番号}</h3>
                    {スロット ? (
                      <div className="text-sm text-gray-600 mt-1">
                        <p>{スロット.data.player.name}</p>
                        <p>プレイ時間: {formatプレイ時間(スロット.data.playTime)}</p>
                        <p>{new Date(スロット.data.savedAt).toLocaleString('ja-JP')}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 mt-1">空き</p>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      if (モード === 'save') {
                        handleセーブ(スロット番号);
                      } else {
                        handleロード(スロット番号);
                      }
                    }}
                    disabled={読み込み中 || (モード === 'load' && !スロット)}
                    variant={モード === 'save' ? 'default' : 'secondary'}
                    data-testid={`${モード}-slot-${スロット番号}-button`}
                  >
                    {モード === 'save' ? 'セーブ' : 'ロード'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={閉じる} variant="outline">
            閉じる
          </Button>
        </div>
      </div>
    </div>
  );
}
