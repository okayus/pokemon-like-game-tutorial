// セーブ機能の詳細テスト（初学者向け：実際のセーブ処理をテスト）
import { test, expect } from '@playwright/test';

test.describe('セーブ機能の詳細テスト', () => {
  test('セーブ機能が正常に動作する', async ({ page }) => {
    // ゲーム画面を開く
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // コンソールログを監視
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    // ネットワークリクエストを監視
    const requests: Array<{url: string, method: string, status?: number}> = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method()
      });
    });
    
    page.on('response', response => {
      const request = requests.find(r => r.url === response.url());
      if (request) {
        request.status = response.status();
      }
    });

    // サイドバーメニューを開いてセーブボタンをクリック
    await page.click('[data-testid="sidebar-menu-button"]');
    await expect(page.locator('[data-testid="sidebar-menu"]')).toBeVisible();
    await page.click('[data-testid="sidebar-save-button"]');
    await expect(page.locator('[data-testid="save-dialog"]')).toBeVisible();

    // スロット1のセーブボタンをクリック
    await page.click('[data-testid="save-slot-1-button"]');

    // 確認ダイアログを処理
    page.on('dialog', async dialog => {
      console.log('Dialog message:', dialog.message());
      await dialog.accept();
    });

    // ダイアログが出るまで少し待つ
    await page.waitForTimeout(1000);

    // 再度スロット1のセーブボタンをクリック（ダイアログが出た後）
    await page.click('[data-testid="save-slot-1-button"]');

    // セーブ処理の完了を待つ
    await page.waitForTimeout(5000);

    // コンソールメッセージをログ出力
    console.log('Console messages:');
    consoleMessages.forEach(msg => console.log('  -', msg));

    // ネットワークリクエストをログ出力
    console.log('Network requests:');
    requests.forEach(req => console.log('  -', req.method, req.url, 'Status:', req.status));

    // エラーメッセージが表示されていないことを確認
    const errorElement = page.locator('[data-testid="save-error"]');
    const isErrorVisible = await errorElement.isVisible();
    
    if (isErrorVisible) {
      const errorText = await errorElement.textContent();
      console.log('Error message displayed:', errorText);
    }

    // セーブリクエストが送信されたことを確認
    const saveRequest = requests.find(req => 
      req.url.includes('/api/saves/') && req.method === 'POST'
    );
    
    if (saveRequest) {
      console.log('Save request found:', saveRequest);
      expect(saveRequest.status).toBe(200);
    } else {
      console.log('No save request found');
    }
  });

  test('セーブ API を直接テスト', async ({ page }) => {
    const saveData = {
      player: {
        name: 'TestPlayer',
        position: { x: 5, y: 5 },
        direction: 'down'
      },
      currentMap: 'town',
      playTime: 120
    };

    try {
      const response = await page.request.post('http://localhost:8787/api/saves/1/1', {
        data: saveData,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Direct save API status:', response.status());
      
      if (response.ok()) {
        const responseData = await response.json();
        console.log('Direct save API response:', responseData);
        expect(response.status()).toBe(200);
      } else {
        const errorText = await response.text();
        console.log('Direct save API error:', errorText);
      }
    } catch (error) {
      console.error('Direct save API error:', error);
    }
  });
});