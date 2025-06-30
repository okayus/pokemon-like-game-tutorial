// 初学者向け：URLベースのマップルーティングを管理するカスタムフック
// ブラウザのURLとマップ状態を同期させます

import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { マップデータ } from '../../../shared/src/types/map';
import { 
  マップ取得,
  デフォルト開始マップID,
  全マップデータ
} from '../../../shared/src/data/mapDefinitions';

// マップルーター状態の型定義
interface マップルーター状態 {
  /** 現在のマップデータ */
  現在のマップ: マップデータ | null;
  /** プレイヤーの位置 */
  プレイヤー位置: { x: number; y: number };
  /** マップ移動中かどうか */
  移動中: boolean;
  /** エラーメッセージ */
  エラー: string | null;
}

// フックの戻り値の型
interface UseMapRouterReturn {
  /** 現在のマップデータ */
  現在のマップ: マップデータ | null;
  /** プレイヤーの位置 */
  プレイヤー位置: { x: number; y: number };
  /** マップ移動中かどうか */
  移動中: boolean;
  /** エラーメッセージ */
  エラー: string | null;
  /** プレイヤーを移動させる関数 */
  プレイヤー移動: (方向: '上' | '下' | '左' | '右') => void;
  /** 別のマップに移動する関数（URLも更新） */
  マップ移動: (マップID: string, x: number, y: number) => void;
  /** エラーをクリアする関数 */
  エラークリア: () => void;
}

/**
 * URLベースのマップルーティングを管理するカスタムフック
 * 初学者向け：ブラウザのURLでマップを管理し、戻る/進むボタンにも対応します
 */
export function useMapRouter(): UseMapRouterReturn {
  const navigate = useNavigate();
  const { mapId: rawマップID = デフォルト開始マップID } = useParams<{ mapId: string }>();
  
  // URLデコードを実行（初学者向け：ブラウザでエンコードされた日本語URLを元に戻します）
  const マップID = decodeURIComponent(rawマップID);
  
  // 状態の管理
  const [状態, set状態] = useState<マップルーター状態>({
    現在のマップ: null,
    プレイヤー位置: { x: 10, y: 7 }, // デフォルト位置
    移動中: false,
    エラー: null,
  });

  // URLパラメータに基づいてマップを読み込み
  useEffect(() => {
    // デバッグ用ログ（初学者向け：どのマップIDが処理されているか確認）
    console.log('useMapRouter: マップIDを処理中:', { rawマップID, マップID });
    
    const マップ = マップ取得(マップID);
    if (マップ) {
      console.log('useMapRouter: マップが見つかりました:', マップ.名前);
      set状態(prev => ({
        ...prev,
        現在のマップ: マップ,
        エラー: null,
      }));
    } else {
      console.error('useMapRouter: マップが見つかりません:', マップID);
      console.log('useMapRouter: 利用可能なマップ:', Object.keys(全マップデータ));
      set状態(prev => ({
        ...prev,
        エラー: `マップ "${マップID}" が見つかりません`,
      }));
    }
  }, [マップID, rawマップID]);

  /**
   * 指定された座標が歩行可能かチェック
   * 初学者向け：マップの範囲内で、かつ歩けるタイルかを確認します
   */
  const 歩行可能チェック = useCallback((x: number, y: number): boolean => {
    const { 現在のマップ } = 状態;
    if (!現在のマップ) return false;

    // マップの範囲内かチェック
    if (x < 0 || x >= 現在のマップ.幅 || 
        y < 0 || y >= 現在のマップ.高さ) {
      return false;
    }

    // タイルが歩行可能かチェック
    return 現在のマップ.タイル[y][x].歩行可能;
  }, [状態]);

  /**
   * プレイヤーを移動させる
   * 初学者向け：方向キーに応じてプレイヤーの位置を更新します
   */
  const プレイヤー移動 = useCallback((方向: '上' | '下' | '左' | '右') => {
    const { プレイヤー位置, 現在のマップ, 移動中 } = 状態;
    
    if (!現在のマップ || 移動中) return;

    // 移動先の座標を計算
    let 新しいX = プレイヤー位置.x;
    let 新しいY = プレイヤー位置.y;

    switch (方向) {
      case '上':
        新しいY -= 1;
        break;
      case '下':
        新しいY += 1;
        break;
      case '左':
        新しいX -= 1;
        break;
      case '右':
        新しいX += 1;
        break;
    }

    // 歩行可能かチェック
    if (!歩行可能チェック(新しいX, 新しいY)) {
      return;
    }

    // プレイヤー位置を更新
    set状態(prev => ({
      ...prev,
      プレイヤー位置: { x: 新しいX, y: 新しいY },
    }));

    // マップ出口のチェック
    const 出口 = 現在のマップ.出口.find(
      e => e.位置.x === 新しいX && e.位置.y === 新しいY
    );

    if (出口) {
      // マップ移動を実行（URLも更新）
      マップ移動(出口.移動先マップ, 出口.移動先位置.x, 出口.移動先位置.y);
    }
  }, [状態, 歩行可能チェック]);

  /**
   * 別のマップに移動する（URLも更新）
   * 初学者向け：新しいマップを読み込み、URLも変更してブラウザ履歴に追加します
   */
  const マップ移動 = useCallback((マップID: string, x: number, y: number) => {
    // 移動中フラグを立てる
    set状態(prev => ({ ...prev, 移動中: true }));

    // 新しいマップを取得
    const 新しいマップ = マップ取得(マップID);
    
    if (!新しいマップ) {
      set状態(prev => ({
        ...prev,
        移動中: false,
        エラー: `マップ "${マップID}" が見つかりません`,
      }));
      return;
    }

    // URLを更新（ブラウザ履歴に追加）
    // 初学者向け：これによりブラウザの戻るボタンでマップ移動履歴をたどれます
    navigate(`/map/${encodeURIComponent(マップID)}?x=${x}&y=${y}`);

    // 移動アニメーションのシミュレート（0.5秒）
    setTimeout(() => {
      set状態(prev => ({
        ...prev,
        現在のマップ: 新しいマップ,
        プレイヤー位置: { x, y },
        移動中: false,
        エラー: null,
      }));
    }, 500);
  }, [navigate]);

  /**
   * エラーをクリアする
   * 初学者向け：エラーメッセージを消去します
   */
  const エラークリア = useCallback(() => {
    set状態(prev => ({ ...prev, エラー: null }));
  }, []);

  return {
    現在のマップ: 状態.現在のマップ,
    プレイヤー位置: 状態.プレイヤー位置,
    移動中: 状態.移動中,
    エラー: 状態.エラー,
    プレイヤー移動,
    マップ移動,
    エラークリア,
  };
}