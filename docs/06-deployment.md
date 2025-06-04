# 6. デプロイ手順

## Cloudflareへのデプロイ

### 前提条件

1. Cloudflareアカウントの作成（無料）
2. Wrangler CLIのインストール

```bash
pnpm add -g wrangler
```

### ステップ1: Cloudflareログイン

```bash
wrangler login
```

ブラウザが開くので、Cloudflareアカウントでログインして認証を完了させます。

### ステップ2: プロジェクトのビルド

```bash
# プロジェクトルートで実行
pnpm build
```

### ステップ3: Cloudflare Pagesの設定（フロントエンド）

#### 1. wrangler.toml の作成

```toml
# packages/frontend/wrangler.toml
name = "pokemon-game-frontend"
compatibility_date = "2025-01-01"

[site]
bucket = "./dist"
```

#### 2. デプロイコマンド

```bash
cd packages/frontend
pnpm build
wrangler pages deploy dist
```

初回デプロイ時は以下を選択：
- プロジェクト名: pokemon-game-frontend
- プロダクション環境にデプロイ: Yes

### ステップ4: Cloudflare Workersの設定（バックエンド）

#### 1. wrangler.toml の作成

```toml
# packages/backend/wrangler.toml
name = "pokemon-game-api"
main = "src/index.ts"
compatibility_date = "2025-01-01"

[vars]
ENVIRONMENT = "production"

[[d1_databases]]
binding = "DB"
database_name = "pokemon-game-db"
database_id = "YOUR_DATABASE_ID"

[env.production]
vars = { ENVIRONMENT = "production" }
```

#### 2. D1データベースの作成

```bash
cd packages/backend

# データベース作成
wrangler d1 create pokemon-game-db

# 作成されたIDをwrangler.tomlに記載
# database_id = "表示されたID"
```

#### 3. データベースマイグレーション

```bash
# マイグレーションファイルの作成
mkdir migrations
```

```sql
-- migrations/0001_initial.sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  slot INTEGER NOT NULL,
  data TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, slot)
);

CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  achievements TEXT,
  play_time INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

```bash
# マイグレーション実行
wrangler d1 execute pokemon-game-db --local --file=./migrations/0001_initial.sql
wrangler d1 execute pokemon-game-db --remote --file=./migrations/0001_initial.sql
```

#### 4. Workersデプロイ

```bash
pnpm build
wrangler deploy
```

### ステップ5: 環境変数の設定

#### フロントエンド環境変数

```bash
# packages/frontend/.env.production
VITE_API_URL=https://pokemon-game-api.YOUR_SUBDOMAIN.workers.dev
```

#### バックエンド環境変数（Cloudflare Dashboard）

1. Cloudflareダッシュボードにログイン
2. Workers & Pages → 対象のWorker選択
3. Settings → Variables
4. 必要な環境変数を追加

### ステップ6: カスタムドメインの設定（オプション）

#### Cloudflare Pagesのカスタムドメイン

1. Cloudflareダッシュボード → Pages
2. プロジェクト選択 → Custom domains
3. 「Set up a custom domain」をクリック
4. ドメインを入力して設定

#### CORS設定の更新

```typescript
// packages/backend/src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: [
      'http://localhost:5173', // 開発環境
      'https://pokemon-game.example.com', // 本番環境
      'https://pokemon-game-frontend.pages.dev', // Cloudflare Pages
    ],
    credentials: true,
  })
);
```

## GitHub Actionsによる自動デプロイ

### GitHub Actionsワークフローの設定

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare

on:
  push:
    branches:
      - main

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 9
          
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
          
      - run: pnpm install
      
      - run: pnpm build
        working-directory: packages/frontend
        
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: pokemon-game-frontend
          directory: packages/frontend/dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
          
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 9
          
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
          
      - run: pnpm install
      
      - run: pnpm build
        working-directory: packages/backend
        
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          workingDirectory: packages/backend
```

### GitHub Secretsの設定

1. GitHubリポジトリ → Settings → Secrets and variables → Actions
2. 以下のシークレットを追加：
   - `CLOUDFLARE_API_TOKEN`: CloudflareのAPIトークン
   - `CLOUDFLARE_ACCOUNT_ID`: CloudflareアカウントID

## 本番環境のモニタリング

### Cloudflare Analytics

1. Cloudflareダッシュボード → Analytics
2. 以下の情報を確認：
   - リクエスト数
   - 帯域幅使用量
   - エラー率
   - レスポンスタイム

### エラーログの確認

```bash
# Workers のログを確認
wrangler tail --name pokemon-game-api

# D1 データベースのログを確認
wrangler d1 execute pokemon-game-db --command "SELECT * FROM sqlite_master"
```

### パフォーマンス最適化

#### 1. 画像の最適化

```typescript
// Cloudflare Imagesを使用
const optimizedImageUrl = `https://imagedelivery.net/${accountHash}/${imageId}/public`;
```

#### 2. キャッシュ設定

```typescript
// packages/backend/src/middleware/cache.ts
export function cacheMiddleware() {
  return async (c: Context, next: () => Promise<void>) => {
    const url = new URL(c.req.url);
    
    // 静的なゲームデータはキャッシュ
    if (url.pathname.startsWith('/api/game/data')) {
      c.header('Cache-Control', 'public, max-age=3600'); // 1時間
    }
    
    await next();
  };
}
```

## トラブルシューティング

### よくある問題と解決方法

1. **デプロイエラー: "Build failed"**
   ```bash
   # ローカルでビルドを確認
   pnpm build
   
   # node_modulesを削除して再インストール
   rm -rf node_modules packages/*/node_modules
   pnpm install
   ```

2. **CORS エラー**
   - バックエンドのCORS設定を確認
   - フロントエンドのAPI URLが正しいか確認

3. **D1 データベース接続エラー**
   - database_id が正しく設定されているか確認
   - マイグレーションが実行されているか確認

4. **環境変数が読み込まれない**
   - Cloudflareダッシュボードで環境変数を確認
   - wrangler.tomlの設定を確認

### デプロイ後のチェックリスト

- [ ] フロントエンドが正しく表示される
- [ ] APIエンドポイントが応答する
- [ ] ゲームの基本機能が動作する
- [ ] セーブ/ロード機能が動作する
- [ ] エラーログを確認
- [ ] パフォーマンスメトリクスを確認