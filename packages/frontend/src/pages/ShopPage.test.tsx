// 初学者向け：ショップページのテスト
// TDDアプローチでテストを先に作成

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
// userEvent は現在未使用
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ShopPage from './ShopPage';
import type { アイテムマスタ, インベントリアイテム } from '@pokemon-like-game-tutorial/shared';

// モックデータ
const モックアイテムマスタ: アイテムマスタ[] = [
  {
    item_id: 1,
    name: 'きずぐすり',
    description: 'ポケモンのHPを20回復する',
    category: '回復',
    buy_price: 300,
    sell_price: 150,
    usable: true,
    effect_type: 'HP回復',
    effect_value: 20,
    icon_url: '/icons/item_default.png',
    max_stack: 99,
    created_at: '2025-07-01 00:00:00',
    updated_at: '2025-07-01 00:00:00'
  }
];

const モック所持アイテム: インベントリアイテム[] = [
  {
    quantity: 5,
    obtained_at: '2025-07-01 10:00:00',
    item_id: 1,
    name: 'きずぐすり',
    description: 'ポケモンのHPを20回復する',
    category: '回復',
    buy_price: 300,
    sell_price: 150,
    usable: true,
    effect_type: 'HP回復',
    effect_value: 20,
    icon_url: '/icons/item_default.png',
    max_stack: 99,
    created_at: '2025-07-01 00:00:00',
    updated_at: '2025-07-01 00:00:00'
  }
];

// APIサービスのモック
vi.mock('../services/itemApi', () => {
  const mockItemApiService = {
    全アイテムマスター取得: vi.fn(),
    インベントリ取得: vi.fn(),
    所持金取得: vi.fn(),
    アイテム購入: vi.fn(),
    アイテム売却: vi.fn()
  };
  return {
    デフォルトアイテムAPIサービス: mockItemApiService
  };
});

// 共通コンポーネントのモック
vi.mock('../components/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">読み込み中...</div>
}));

vi.mock('../components/ErrorMessage', () => ({
  ErrorMessage: ({ message, onClose }: { message: string; onClose: () => void }) => (
    <div data-testid="error-message">
      {message}
      <button onClick={onClose}>×</button>
    </div>
  )
}));

vi.mock('../components/SuccessNotification', () => ({
  SuccessNotification: ({ message, onClose }: { message: string; onClose: () => void }) => (
    <div data-testid="success-notification">
      {message}
      <button onClick={onClose}>×</button>
    </div>
  )
}));

describe('ShopPage', () => {
  let mockItemApiService: {
    全アイテムマスター取得: ReturnType<typeof vi.fn>;
    インベントリ取得: ReturnType<typeof vi.fn>;
    所持金取得: ReturnType<typeof vi.fn>;
    アイテム購入: ReturnType<typeof vi.fn>;
    アイテム売却: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // window.confirmのモック
    Object.defineProperty(window, 'confirm', {
      writable: true,
      value: vi.fn().mockReturnValue(true),
    });
    const { デフォルトアイテムAPIサービス } = await import('../services/itemApi');
    mockItemApiService = デフォルトアイテムAPIサービス as any;
    
    // デフォルトのAPIレスポンス
    mockItemApiService.全アイテムマスター取得.mockResolvedValue(モックアイテムマスタ);
    mockItemApiService.インベントリ取得.mockResolvedValue({
      items: モック所持アイテム,
      player_money: 5000,
      total_count: 1,
      total_pages: 1,
      current_page: 1
    });
    mockItemApiService.所持金取得.mockResolvedValue(5000);
    mockItemApiService.アイテム購入.mockResolvedValue({
      success: true,
      message: 'アイテムを購入しました'
    });
    mockItemApiService.アイテム売却.mockResolvedValue({
      success: true,
      message: 'アイテムを売却しました'
    });
  });

  const renderShopPage = (playerId = 'test-player-001') => {
    return render(
      <MemoryRouter initialEntries={[`/items/shop/${playerId}`]}>
        <Routes>
          <Route path="/items/shop/:playerId" element={<ShopPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  describe('基本表示', () => {
    it('ショップページが正しく表示される', async () => {
      renderShopPage();

      // ヘッダーが表示される
      expect(screen.getByText('🏪 ショップ')).toBeInTheDocument();
      
      // 戻るボタンが表示される
      expect(screen.getByText('戻る')).toBeInTheDocument();

      // ショップモードタブが表示される
      expect(screen.getByText('🛒 購入')).toBeInTheDocument();
      expect(screen.getByText('💰 売却')).toBeInTheDocument();

      // ロード完了を待つ
      await waitFor(() => {
        expect(screen.getByText('きずぐすり')).toBeInTheDocument();
      });

      // 所持金が表示される
      expect(screen.getByText('5,000円')).toBeInTheDocument();
    });
  });

  describe('購入モード', () => {
    it('購入可能なアイテムが表示される', async () => {
      renderShopPage();

      await waitFor(() => {
        expect(screen.getByText('きずぐすり')).toBeInTheDocument();
      });

      // アイテム情報が表示される
      expect(screen.getByText('ポケモンのHPを20回復する')).toBeInTheDocument();
      expect(screen.getByText('300円')).toBeInTheDocument();
      
      // 購入ボタンが表示される
      const 購入ボタン = screen.getAllByText('購入');
      expect(購入ボタン.length).toBeGreaterThan(0);
    });
  });

  describe('エラーハンドリング', () => {
    it('データ取得エラー時にエラーメッセージが表示される', async () => {
      mockItemApiService.全アイテムマスター取得.mockRejectedValue(new Error('API Error'));

      renderShopPage();

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument();
      });
    });
  });
});