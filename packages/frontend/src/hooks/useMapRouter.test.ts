// 初学者向け：マップルーターフックのテストファイル
// useMapRouterの動作をテストして品質を保証します

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMapRouter } from './useMapRouter';

// React Routerのモック
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
}));

describe('useMapRouter', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ mapId: '始まりの町' });
  });

  describe('初期化', () => {
    it('デフォルトマップを正しく読み込む', () => {
      const { result } = renderHook(() => useMapRouter());
      
      // 初期状態では移動中ではない
      expect(result.current.移動中).toBe(false);
      expect(result.current.エラー).toBeNull();
    });

    it('存在しないマップの場合はエラーを表示', () => {
      mockUseParams.mockReturnValue({ mapId: '存在しないマップ' });
      
      const { result } = renderHook(() => useMapRouter());
      
      // エラーが設定される
      expect(result.current.エラー).toContain('存在しないマップ');
    });
  });

  describe('マップ移動', () => {
    it('マップ移動時にURLが更新される', () => {
      const { result } = renderHook(() => useMapRouter());
      
      // マップ移動を実行
      result.current.マップ移動('北の森', 5, 5);
      
      // navigate関数が正しいURLで呼ばれたか確認
      expect(mockNavigate).toHaveBeenCalledWith('/map/北の森?x=5&y=5');
    });

    it('移動中フラグが正しく管理される', () => {
      const { result } = renderHook(() => useMapRouter());
      
      // マップ移動を実行
      result.current.マップ移動('北の森', 5, 5);
      
      // 移動中フラグが立つ
      expect(result.current.移動中).toBe(true);
    });
  });

  describe('エラーハンドリング', () => {
    it('エラークリア機能が動作する', () => {
      mockUseParams.mockReturnValue({ mapId: '存在しないマップ' });
      
      const { result } = renderHook(() => useMapRouter());
      
      // エラーが設定されている状態
      expect(result.current.エラー).toBeTruthy();
      
      // エラーをクリア
      result.current.エラークリア();
      
      // エラーがクリアされる
      expect(result.current.エラー).toBeNull();
    });
  });
});