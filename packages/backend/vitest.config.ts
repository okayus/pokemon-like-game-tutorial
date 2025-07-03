// 初学者向け：Vitestテスト設定
// SQLiteとメモリデータベースを使用したテスト環境設定
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // Node.js環境でテスト実行（Cloudflare Workersランタイムではない）
    environment: 'node',
    
    // 各テスト前にデータベースセットアップを実行
    setupFiles: ['./src/test-utils/dbSetup.ts'],
    
    // テストタイムアウト（SQLiteは高速だが余裕を持って設定）
    testTimeout: 10000,
    
    // テストの分離を確実に（重要：データベース状態が漏れないように）
    isolate: true,
    
    // テストレポート設定
    reporter: ['default', 'json'],
    
    // カバレッジ設定（オプション）
    coverage: {
      reporter: ['text', 'json'],
      exclude: [
        'node_modules/',
        'src/test-utils/',
        '**/*.test.ts',
        '**/*.d.ts',
      ],
    },
  },
});
