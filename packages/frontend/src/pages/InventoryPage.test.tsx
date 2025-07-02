// 初学者向け：インベントリページのテスト
// TDDアプローチでテストを先に作成

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import InventoryPage from './InventoryPage';
import type { インベントリアイテム } from '@pokemon-like-game-tutorial/shared';

// モックデータ
const モックインベントリアイテム: インベントリアイテム[] = [
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
  },
  {
    quantity: 2,
    obtained_at: '2025-07-01 11:00:00',
    item_id: 2,
    name: 'いいきずぐすり',
    description: 'ポケモンのHPを50回復する',
    category: '回復',
    buy_price: 700,
    sell_price: 350,
    usable: true,
    effect_type: 'HP回復',
    effect_value: 50,
    icon_url: '/icons/item_default.png',
    max_stack: 99,
    created_at: '2025-07-01 00:00:00',
    updated_at: '2025-07-01 00:00:00'
  }
];

// APIサービスのモック
vi.mock('../services/itemApi', () => {
  const mockItemApiService = {
    インベントリ取得: vi.fn(),
    アイテム使用: vi.fn()
  };
  return {
    デフォルトアイテムAPIサービス: mockItemApiService
  };
});

// PokemonSelectDialogのモック
vi.mock('../components/PokemonSelectDialog', () => ({
  PokemonSelectDialog: ({ isOpen, onClose, onSelectPokemon }: { isOpen: boolean; onClose: () => void; onSelectPokemon: (pokemon: { pokemon_id: string }) => void }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="pokemon-select-dialog">
        <h2>ポケモンを選択</h2>
        <button onClick={() => onSelectPokemon({ pokemon_id: 'test-pokemon' })}>
          テストポケモン
        </button>
        <button onClick={onClose}>キャンセル</button>
      </div>
    );
  }
}));

// LoadingSpinnerのモック
vi.mock('../components/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">読み込み中...</div>
}));

// ErrorMessageのモック
vi.mock('../components/ErrorMessage', () => ({
  ErrorMessage: ({ message, onClose }: { message: string; onClose: () => void }) => (
    <div data-testid="error-message">
      {message}
      <button onClick={onClose}>×</button>
    </div>
  )
}));

// SuccessNotificationのモック
vi.mock('../components/SuccessNotification', () => ({
  SuccessNotification: ({ message, onClose }: { message: string; onClose: () => void }) => (
    <div data-testid="success-notification">
      {message}
      <button onClick={onClose}>×</button>
    </div>
  )
}));

describe('InventoryPage', () => {
  let mockItemApiService: {
    インベントリ取得: ReturnType<typeof vi.fn>;
    アイテム使用: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // window.confirmのモック
    Object.defineProperty(window, 'confirm', {
      writable: true,
      value: vi.fn().mockReturnValue(true),
    });
    const { デフォルトアイテムAPIサービス } = await import('../services/itemApi');
    mockItemApiService = デフォルトアイテムAPIサービス as unknown as typeof mockItemApiService;
    
    // デフォルトのAPIレスポンス
    mockItemApiService.インベントリ取得.mockResolvedValue({
      items: モックインベントリアイテム,
      player_money: 5000,
      total_count: 2,
      total_pages: 1,
      current_page: 1
    });
    mockItemApiService.アイテム使用.mockResolvedValue({
      success: true,
      message: 'アイテムを使用しました'
    });
  });

  const renderInventoryPage = (playerId = 'test-player-001') => {
    return render(
      <MemoryRouter initialEntries={[`/items/inventory/${playerId}`]}>
        <Routes>
          <Route path="/items/inventory/:playerId" element={<InventoryPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  describe('基本表示', () => {
    it('インベントリページが正しく表示される', async () => {
      renderInventoryPage();

      // ヘッダーが表示される
      expect(screen.getByText('📦 インベントリ')).toBeInTheDocument();
      
      // 戻るボタンが表示される
      expect(screen.getByText('戻る')).toBeInTheDocument();

      // ロード完了を待つ
      await waitFor(() => {
        expect(screen.getByText('きずぐすり')).toBeInTheDocument();
      });

      // 所持金が表示される
      expect(screen.getByText('5,000円')).toBeInTheDocument();
    });
  });

  describe('アイテム一覧表示', () => {
    it('インベントリアイテムが正しく表示される', async () => {
      renderInventoryPage();

      await waitFor(() => {
        expect(screen.getByText('きずぐすり')).toBeInTheDocument();
      });

      // アイテム情報が表示される
      expect(screen.getByText('×5')).toBeInTheDocument();
      expect(screen.getByText('ポケモンのHPを20回復する')).toBeInTheDocument();
      expect(screen.getByText('効果: HP回復 +20')).toBeInTheDocument();

      // 使用ボタンが表示される
      const 使用ボタン = screen.getAllByText('使用');
      expect(使用ボタン.length).toBe(2); // きずぐすりといいきずぐすり
    });
  });

  describe('アイテム使用機能', () => {
    it('回復アイテムクリック時にポケモン選択ダイアログが表示される', async () => {
      renderInventoryPage();

      await waitFor(() => {
        expect(screen.getByText('きずぐすり')).toBeInTheDocument();
      });

      // 使用ボタンをクリック
      const 使用ボタン = screen.getAllByText('使用')[0];
      await userEvent.click(使用ボタン);

      // ポケモン選択ダイアログが表示される
      expect(screen.getByTestId('pokemon-select-dialog')).toBeInTheDocument();
      expect(screen.getByText('ポケモンを選択')).toBeInTheDocument();
    });

    it('ポケモン選択後にアイテム使用APIが呼ばれる', async () => {
      renderInventoryPage();

      await waitFor(() => {
        expect(screen.getByText('きずぐすり')).toBeInTheDocument();
      });

      // 使用ボタンをクリック
      const 使用ボタン = screen.getAllByText('使用')[0];
      await userEvent.click(使用ボタン);

      // ポケモンを選択
      const テストポケモンボタン = screen.getByText('テストポケモン');
      await userEvent.click(テストポケモンボタン);

      // APIが呼ばれることを確認
      await waitFor(() => {
        expect(mockItemApiService.アイテム使用).toHaveBeenCalledWith({
          player_id: 'test-player-001',
          item_id: 1,
          quantity: 1,
          target_id: 'test-pokemon'
        });
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('API取得エラー時にエラーメッセージが表示される', async () => {
      mockItemApiService.インベントリ取得.mockRejectedValue(new Error('API Error'));

      renderInventoryPage();

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('インベントリの取得に失敗しました')).toBeInTheDocument();
      });
    });
  });
});