// 更新されたセーブ・ロード機能テスト（初学者向け：サイドバーメニュー対応）
import { test, expect } from '@playwright/test';

test.describe('更新されたセーブ・ロード機能のテスト', () => {
  test('固定サイドバーからセーブ機能を実行', async ({ page }) => {
    // ネットワークリクエストをモニタリング（初学者向け：APIの呼び出しを監視）
    const セーブリクエスト = page.waitForRequest(request => 
      request.url().includes('/api/saves/') && request.method() === 'POST'
    );

    // ゲーム画面を開く
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // サイドバーのセーブボタンをクリック（サイドバーは常に表示されている）
    await page.click('[data-testid="sidebar-save-button"]');
    await expect(page.locator('[data-testid="save-dialog"]')).toBeVisible();

    // スロット1のセーブボタンをクリック
    await page.click('[data-testid="save-slot-1-button"]');

    // 確認ダイアログを処理
    page.on('dialog', async dialog => {
      console.log('確認ダイアログ:', dialog.message());
      await dialog.accept();
    });

    // セーブリクエストの完了を待つ
    const request = await セーブリクエスト;
    console.log('セーブリクエスト送信完了:', request.url());
    
    // セーブ完了のレスポンスを確認
    const response = await request.response();
    expect(response?.status()).toBe(200);
  });

  test('固定サイドバーからロード機能を実行', async ({ page }) => {
    // ゲーム画面を開く
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // サイドバーのロードボタンをクリック（サイドバーは常に表示されている）
    await page.click('[data-testid="sidebar-load-button"]');
    await expect(page.locator('[data-testid="load-dialog"]')).toBeVisible();

    // ロードダイアログが正常に表示されることを確認
    await expect(page.locator('[data-testid="load-slot-1"]')).toBeVisible();
  });

  test('固定サイドバーの表示確認', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // サイドバーが常に表示されていることを確認
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();

    // プレイヤー情報が表示されることを確認
    await expect(sidebar).toContainText('Player');
    await expect(sidebar).toContainText('ゲームメニュー');
  });


  test('キーボードショートカット情報の表示', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // サイドバーが常に表示されている
    const sidebar = page.locator('aside').first();
    
    // キーボードショートカット情報が表示されることを確認
    await expect(sidebar).toContainText('キーボードショートカット');
    await expect(sidebar).toContainText('矢印キー');
    await expect(sidebar).toContainText('S キー');
    await expect(sidebar).toContainText('L キー');
  });
});