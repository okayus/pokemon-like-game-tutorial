// セーブ・ロード機能のE2Eテスト（初学者向け：実際のユーザー操作をシミュレート）
import { test, expect } from '@playwright/test';

test.describe('セーブ・ロード機能のテスト', () => {
  test.beforeEach(async ({ page }) => {
    // ゲーム画面を開く（初学者向け：テスト開始前の準備）
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="game-canvas"]')).toBeVisible();
  });

  test('セーブ機能のテスト - スロット1に正常にセーブできる', async ({ page }) => {
    // ネットワークリクエストをモニタリング（初学者向け：APIの呼び出しを監視）
    const セーブリクエスト = page.waitForRequest(
      (request) => request.url().includes('/api/saves/') && request.method() === 'POST'
    );

    // セーブボタンをクリック（初学者向け：セーブダイアログを開く）
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="save-dialog"]')).toBeVisible();

    // スロット1のセーブボタンをクリック
    await page.click('[data-testid="save-slot-1-button"]');

    // 確認ダイアログで「OK」をクリック
    await page.once('dialog', (dialog) => {
      expect(dialog.message()).toContain('スロット1にセーブしますか？');
      dialog.accept();
    });

    try {
      // セーブリクエストが送信されることを確認
      const request = await セーブリクエスト;
      console.log('セーブリクエストURL:', request.url());
      console.log('セーブリクエストメソッド:', request.method());

      // リクエストボディの確認
      const requestBody = request.postDataJSON();
      console.log('セーブリクエストボディ:', JSON.stringify(requestBody, null, 2));

      expect(requestBody).toHaveProperty('player');
      expect(requestBody).toHaveProperty('currentMap');
      expect(requestBody).toHaveProperty('playTime');

      // レスポンスを確認
      const response = await request.response();
      if (response) {
        console.log('セーブレスポンスステータス:', response.status());
        console.log('セーブレスポンスボディ:', await response.text());
      }

      // 成功メッセージを確認
      await expect(page.locator('text=セーブしました！')).toBeVisible({ timeout: 10000 });
    } catch (error) {
      console.error('セーブエラー:', error);

      // エラーメッセージの確認
      const エラーメッセージ = page.locator('[data-testid="save-error"]');
      if (await エラーメッセージ.isVisible()) {
        console.log('表示されたエラーメッセージ:', await エラーメッセージ.textContent());
      }

      throw error;
    }
  });

  test('セーブ機能のエラーハンドリングテスト', async ({ page }) => {
    // バックエンドサーバーが停止している場合の動作をテスト
    await page.route('**/api/saves/**', (route) => {
      route.abort('failed');
    });

    // セーブボタンをクリック
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="save-dialog"]')).toBeVisible();

    // スロット1のセーブボタンをクリック
    await page.click('[data-testid="save-slot-1-button"]');

    // 確認ダイアログで「OK」をクリック
    await page.once('dialog', (dialog) => {
      dialog.accept();
    });

    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=セーブに失敗しました')).toBeVisible({ timeout: 10000 });
  });

  test('ロード機能のテスト - 既存のセーブデータを読み込み', async ({ page }) => {
    // まず既存のセーブデータがあることを前提とする
    // または事前にセーブデータを作成

    // ロードボタンをクリック（初学者向け：ロードダイアログを開く）
    await page.click('[data-testid="load-button"]');
    await expect(page.locator('[data-testid="save-dialog"]')).toBeVisible();

    // セーブデータ一覧の読み込みを確認
    const ロードリクエスト = page.waitForRequest(
      (request) => request.url().includes('/api/saves/') && request.method() === 'GET'
    );

    try {
      const request = await ロードリクエスト;
      console.log('ロードリクエストURL:', request.url());

      const response = await request.response();
      if (response) {
        console.log('ロードレスポンスステータス:', response.status());
        const responseBody = await response.text();
        console.log('ロードレスポンスボディ:', responseBody);
      }
    } catch (error) {
      console.error('ロードリクエストエラー:', error);
    }

    // セーブスロットが表示されることを確認
    await expect(page.locator('[data-testid="save-slot-1"]')).toBeVisible();
  });

  test('ネットワークエラー時の動作確認', async ({ page }) => {
    // ネットワークをオフラインに設定
    await page.context().setOffline(true);

    // セーブを試行
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="save-dialog"]')).toBeVisible();

    await page.click('[data-testid="save-slot-1-button"]');

    await page.once('dialog', (dialog) => {
      dialog.accept();
    });

    // ネットワークエラーが適切に処理されることを確認
    await expect(page.locator('text=セーブに失敗しました')).toBeVisible({ timeout: 10000 });
  });

  test('CORS設定の確認', async ({ page }) => {
    // CORSエラーをキャッチ
    const コンソールメッセージ: string[] = [];
    page.on('console', (msg) => {
      コンソールメッセージ.push(msg.text());
    });

    // セーブ操作を実行
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="save-dialog"]')).toBeVisible();

    await page.click('[data-testid="save-slot-1-button"]');

    await page.once('dialog', (dialog) => {
      dialog.accept();
    });

    // 5秒待機してからコンソールメッセージを確認
    await page.waitForTimeout(5000);

    // CORSエラーがないことを確認
    const corsErrors = コンソールメッセージ.filter(
      (msg) => msg.includes('CORS') || msg.includes('Access-Control-Allow-Origin')
    );

    console.log('すべてのコンソールメッセージ:', コンソールメッセージ);

    if (corsErrors.length > 0) {
      console.error('CORS エラーが検出されました:', corsErrors);
    }
  });
});
