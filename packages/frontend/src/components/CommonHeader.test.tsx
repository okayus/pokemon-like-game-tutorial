// 初学者向け：共通ヘッダーコンポーネントのテスト
// TDDアプローチでテストを先に作成

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CommonHeader } from './CommonHeader';

describe('CommonHeader（共通ヘッダーコンポーネント）', () => {
  const renderWithRouter = (currentPath = '/') => {
    return render(
      <MemoryRouter initialEntries={[currentPath]}>
        <CommonHeader />
      </MemoryRouter>
    );
  };

  describe('基本表示テスト', () => {
    it('アプリケーションタイトルが表示される', () => {
      // 初学者向け：ヘッダーにアプリ名が表示されることを確認
      renderWithRouter();

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText('ポケモンライクゲーム')).toBeInTheDocument();
    });

    it('ナビゲーションメニューが表示される', () => {
      // 初学者向け：すべてのナビゲーションリンクが表示されることを確認
      renderWithRouter();

      expect(screen.getByRole('link', { name: 'マップ' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: '図鑑' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: '手持ち' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'パーティ' })).toBeInTheDocument();
    });

    it('各ナビゲーションリンクが正しいURLを持つ', () => {
      // 初学者向け：リンクのhref属性が正しいことを確認
      renderWithRouter();

      expect(screen.getByRole('link', { name: 'マップ' })).toHaveAttribute('href', '/game');
      expect(screen.getByRole('link', { name: '図鑑' })).toHaveAttribute('href', '/pokemon/dex');
      expect(screen.getByRole('link', { name: '手持ち' })).toHaveAttribute(
        'href',
        '/pokemon/owned'
      );
      expect(screen.getByRole('link', { name: 'パーティ' })).toHaveAttribute(
        'href',
        '/pokemon/party'
      );
    });
  });

  describe('アクティブ状態テスト', () => {
    it('現在のページに対応するリンクがアクティブになる', () => {
      // 初学者向け：現在のページのナビゲーションがハイライトされることを確認
      renderWithRouter('/pokemon/dex');

      const 図鑑リンク = screen.getByRole('link', { name: '図鑑' });
      expect(図鑑リンク).toHaveClass('bg-blue-500', 'text-white');
    });

    it('手持ちページでは手持ちリンクがアクティブになる', () => {
      renderWithRouter('/pokemon/owned');

      const 手持ちリンク = screen.getByRole('link', { name: '手持ち' });
      expect(手持ちリンク).toHaveClass('bg-blue-500', 'text-white');
    });

    it('パーティページではパーティリンクがアクティブになる', () => {
      renderWithRouter('/pokemon/party');

      const パーティリンク = screen.getByRole('link', { name: 'パーティ' });
      expect(パーティリンク).toHaveClass('bg-blue-500', 'text-white');
    });

    it('非アクティブなリンクは通常の見た目になる', () => {
      renderWithRouter('/pokemon/dex');

      const 手持ちリンク = screen.getByRole('link', { name: '手持ち' });
      expect(手持ちリンク).toHaveClass('text-blue-600', 'hover:bg-blue-50');
      expect(手持ちリンク).not.toHaveClass('bg-blue-500', 'text-white');
    });
  });

  describe('レスポンシブ対応テスト', () => {
    it('モバイル向けのクラスが適用されている', () => {
      // 初学者向け：レスポンシブデザインの基本確認
      renderWithRouter();

      const ナビゲーション = screen.getByRole('navigation');
      expect(ナビゲーション).toHaveClass('flex');

      // モバイルでの表示調整を確認
      const ヘッダー = screen.getByRole('banner');
      expect(ヘッダー).toHaveClass('px-4');
    });

    it('アイコンが表示されている', () => {
      // 初学者向け：各ナビゲーション項目にアイコンがあることを確認
      renderWithRouter();

      // アイコンのテキスト確認（絵文字）
      expect(screen.getByText('🗺️')).toBeInTheDocument(); // マップ
      expect(screen.getByText('📖')).toBeInTheDocument(); // 図鑑
      expect(screen.getByText('🎒')).toBeInTheDocument(); // 手持ち
      expect(screen.getByText('⚔️')).toBeInTheDocument(); // パーティ
    });
  });

  describe('アクセシビリティテスト', () => {
    it('適切なARIAロールが設定されている', () => {
      // 初学者向け：アクセシビリティの基本確認
      renderWithRouter();

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('キーボードナビゲーションが可能', () => {
      // 初学者向け：tabindexなどが適切に設定されていることを確認
      renderWithRouter();

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });
});
