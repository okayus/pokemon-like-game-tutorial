// 初学者向け：マップシステムを管理するカスタムフック
// マップの読み込み、移動、状態管理を行います

import { useState, useCallback, useEffect } from 'react';
import { マップデータ } from '../../../shared/src/types/map';
import { 
  マップ取得,
  デフォルト開始マップID 
} from '../../../shared/src/data/mapDefinitions';

// マップシステムの状態
interface マップシステム状態 {
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
interface UseMapSystemReturn {
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
  /** 別のマップに移動する関数 */
  マップ移動: (マップID: string, x: number, y: number) => void;
  /** エラーをクリアする関数 */
  エラークリア: () => void;
}

/**
 * マップシステムを管理するカスタムフック
 * 初学者向け：Reactのカスタムフックは再利用可能なロジックをまとめたものです
 */
export function useMapSystem(
  初期マップID: string = デフォルト開始マップID,
  初期位置: { x: number; y: number } = { x: 10, y: 7 }
): UseMapSystemReturn {
  // 状態の管理
  const [状態, set状態] = useState<マップシステム状態>({
    現在のマップ: null,
    プレイヤー位置: 初期位置,
    移動中: false,
    エラー: null,
  });

  // 初期マップの読み込み
  useEffect(() => {
    const マップ = マップ取得(初期マップID);
    if (マップ) {
      set状態(prev => ({
        ...prev,
        現在のマップ: マップ,
        エラー: null,
      }));
    } else {
      set状態(prev => ({
        ...prev,
        エラー: `マップ "${初期マップID}" が見つかりません`,
      }));
    }
  }, [初期マップID]);

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
      // マップ移動を実行
      マップ移動(出口.移動先マップ, 出口.移動先位置.x, 出口.移動先位置.y);
    }
  }, [状態, 歩行可能チェック]);

  /**
   * 別のマップに移動する
   * 初学者向け：新しいマップを読み込んで、プレイヤーを配置します
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

    // 移動アニメーションのシミュレート（0.5秒）
    setTimeout(() => {
      set状態({
        現在のマップ: 新しいマップ,
        プレイヤー位置: { x, y },
        移動中: false,
        エラー: null,
      });
    }, 500);
  }, []);

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