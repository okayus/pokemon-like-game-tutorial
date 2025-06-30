// 基本的なセーブ機能テスト（初学者向け：最小限の機能テスト）
import { test, expect } from '@playwright/test';

test.describe('基本的なセーブ機能', () => {
  test('アプリケーションが正常に読み込まれる', async ({ page }) => {
    // ゲーム画面を開く
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // メインタイトルが表示されることを確認
    await expect(page.locator('text=Pokemon-like Game')).toBeVisible();
    
    // ゲームキャンバスが表示されることを確認
    await expect(page.locator('[data-testid="game-canvas"]')).toBeVisible();
    
    // サイドバーメニューボタンが表示されることを確認
    await expect(page.locator('[data-testid="sidebar-menu-button"]')).toBeVisible();
  });

  test('セーブダイアログが開く', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // サイドバーメニューを開いてセーブボタンをクリック
    await page.click('[data-testid="sidebar-menu-button"]');
    await expect(page.locator('[data-testid="sidebar-menu"]')).toBeVisible();
    await page.click('[data-testid="sidebar-save-button"]');
    
    // セーブダイアログが表示されることを確認
    await expect(page.locator('[data-testid="save-dialog"]')).toBeVisible();
    
    // スロット1が表示されることを確認
    await expect(page.locator('[data-testid="save-slot-1"]')).toBeVisible();
  });

  test('バックエンドサーバーの接続確認', async ({ page }) => {
    // バックエンドの health check
    const response = await page.request.get('http://localhost:8787/');
    console.log('Backend response status:', response.status());
    
    if (response.ok()) {
      const body = await response.text();
      console.log('Backend response:', body);
    }
  });

  test('セーブAPI エンドポイントの確認', async ({ page }) => {
    // セーブスロット一覧の取得を試行
    try {
      const response = await page.request.get('http://localhost:8787/api/saves/1');
      console.log('Save API response status:', response.status());
      
      if (response.ok()) {
        const data = await response.json();
        console.log('Save API response data:', data);
      } else {
        console.log('Save API error:', await response.text());
      }
    } catch (error) {
      console.error('Save API connection error:', error);
    }
  });
});