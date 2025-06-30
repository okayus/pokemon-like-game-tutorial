# トラブルシューティング（初学者向け：よくある問題と解決方法）

## セーブ機能の問題

### 問題: 「セーブに失敗します」エラー

**症状:**
- セーブボタンをクリックしても保存されない
- 「セーブに失敗しました」のエラーメッセージが表示される
- コンソールに「FOREIGN KEY constraint failed」エラーが出る

**原因:**
データベースにテストユーザーが存在しないため、外部キー制約に違反している。

**解決方法:**

1. **データベースの初期化を確認**
   ```bash
   cd packages/backend
   npx wrangler d1 execute pokemon-game-db --local --file=./migrations/0001_initial.sql
   ```

2. **シードデータ（テストユーザー）を追加**
   ```bash
   npx wrangler d1 execute pokemon-game-db --local --file=./migrations/0002_seed_data.sql
   ```

3. **バックエンドサーバーの再起動**
   ```bash
   cd packages/backend
   pnpm dev
   ```

### 問題: バックエンドサーバーが起動しない

**症状:**
- E2Eテストで「Test timeout」エラーが発生する
- セーブリクエストが送信されない

**原因:**
- バックエンドサーバーが起動していない
- ポート番号が間違っている

**解決方法:**

1. **バックエンドサーバーの起動確認**
   ```bash
   cd packages/backend
   pnpm dev --port 8787
   ```

2. **ポート番号の確認**
   - フロントエンド: `http://localhost:5173`
   - バックエンド: `http://localhost:8787`

### 問題: CORSエラー

**症状:**
- ブラウザのコンソールに「CORS」関連のエラーが表示される
- APIリクエストが失敗する

**原因:**
CORSの設定が正しくない。

**解決方法:**
バックエンドのCORS設定を確認：
```typescript
// packages/backend/src/index.ts
app.use('/*', cors()); // 全てのルートでCORSを有効化
```

## E2Eテストの問題

### 問題: Playwrightブラウザがインストールされていない

**症状:**
- E2Eテストで「Executable doesn't exist」エラーが発生する

**解決方法:**
```bash
cd packages/frontend
npx playwright install
```

### 問題: テストがタイムアウトする

**症状:**
- 「Test timeout of 30000ms exceeded」エラーが発生する

**原因:**
- サーバーの起動が遅い
- データベースの初期化が完了していない

**解決方法:**
1. タイムアウト時間を延長する
2. サーバーの起動を待つ処理を追加する
3. データベースの初期化を確認する

## 開発環境のセットアップ

### 必要な手順

1. **依存関係のインストール**
   ```bash
   pnpm install
   ```

2. **データベースの初期化**
   ```bash
   cd packages/backend
   npx wrangler d1 execute pokemon-game-db --local --file=./migrations/0001_initial.sql
   npx wrangler d1 execute pokemon-game-db --local --file=./migrations/0002_seed_data.sql
   ```

3. **サーバーの起動**
   ```bash
   # バックエンド
   cd packages/backend
   pnpm dev

   # フロントエンド（別ターミナル）
   cd packages/frontend
   pnpm dev
   ```

4. **E2Eテストの実行**
   ```bash
   cd packages/frontend
   npx playwright install  # 初回のみ
   npm run test:e2e
   ```

## よくある質問

### Q: セーブデータはどこに保存されますか？
A: 開発環境では、Cloudflare D1のローカル データベース（`.wrangler/state/v3/d1`）に保存されます。

### Q: データベースをリセットしたい場合は？
A: `.wrangler`フォルダを削除して、再度マイグレーションを実行してください。

### Q: 本番環境ではどうなりますか？
A: 本番環境では、実際のCloudflare D1データベースを使用します。`wrangler.toml`の設定を確認してください。