# トラブルシューティング（初学者向け：よくある問題と解決方法）

## 目次

1. [セーブ機能の問題](#セーブ機能の問題)
2. [E2Eテストの問題](#e2eテストの問題)
3. [マップシステムの問題](#マップシステムの問題)
4. [GitHub Actions / CI/CDの問題](#github-actions--cicdの問題)
5. [開発環境のセットアップ](#開発環境のセットアップ)
6. [デバッグ方法](#デバッグ方法)
7. [よくある質問](#よくある質問)

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

## マップシステムの問題

### 問題: 矢印キーでプレイヤーが移動しない

**症状:**
- 矢印キーを押してもプレイヤーが移動しない
- URLのx,yパラメータが更新されない
- 「現在地」の表示が変わらない

**原因と解決方法:**

#### 1. **キーイベントが処理されていない**
**確認方法:**
```javascript
// ブラウザの開発者ツール（F12）でコンソールを確認
// 矢印キーを押した時に「プレイヤー移動が呼ばれました」ログが出るか確認
```

**解決方法:**
- ページがフォーカスされているか確認（ページ内をクリック）
- 他の入力要素にフォーカスが当たっていないか確認

#### 2. **マップデータが読み込まれていない**
**確認方法:**
```javascript
// コンソールで以下をチェック:
// - "useMapRouter: マップが見つかりました" ログがあるか
// - "現在のマップがnullです" エラーがないか
```

**解決方法:**
```bash
# マップデータの確認
cd packages/shared
npm run test mapDefinitions
```

#### 3. **歩行可能判定の問題**
**確認方法:**
```javascript
// コンソールで以下をチェック:
// - "歩行可能チェック: {歩行可能: false}" となっていないか
// - "範囲外のため歩行不可" エラーがないか
```

**解決方法:**
- マップの境界（端）から移動しようとしていないか確認
- 移動先が歩行不可能なタイル（木、岩など）でないか確認

#### 4. **URL同期の問題**
**症状:**
- キーイベントは処理されるがURLが更新されない
- 内部状態は更新されるが画面表示が古いまま

**確認方法:**
```javascript
// コンソールで以下をチェック:
// - "プレイヤー位置を更新します" ログの後にURLが変わるか
// - window.location.search でURLパラメータを確認
```

**解決方法:**
```typescript
// useMapRouter.ts の修正確認
// 以下のコードが含まれているか確認:
const 現在のURL = new URL(window.location.href);
現在のURL.searchParams.set('x', 新しいX.toString());
現在のURL.searchParams.set('y', 新しいY.toString());
window.history.replaceState(null, '', 現在のURL.toString());
```

### 問題: マップが404エラーで表示されない

**症状:**
- `/map/始まりの町` にアクセスすると「404 - ページが見つかりません」が表示される
- URLエンコードされたマップ名で問題が発生

**原因:**
日本語マップIDのURLデコード処理が不足している。

**解決方法:**
```typescript
// useMapRouter.ts で以下を確認:
const { mapId: rawマップID = デフォルト開始マップID } = useParams<{ mapId: string }>();
const マップID = decodeURIComponent(rawマップID); // この行が必要
```

### 問題: マップ間移動ができない

**症状:**
- マップの出口に移動しても別のマップに切り替わらない
- 「マップ移動中...」が表示されたまま止まる

**確認方法:**
```javascript
// コンソールで以下をチェック:
// - "出口を発見、マップ移動します" ログが出るか
// - 移動先マップが存在するか
```

**解決方法:**
1. **出口データの確認**
   ```typescript
   // mapDefinitions.ts で出口が正しく定義されているか確認
   export const 始まりの町: マップデータ = {
     // ...
     出口: [
       {
         位置: { x: 9, y: 0 },
         移動先マップ: "北の森", // 実在するマップIDか確認
         移動先位置: { x: 9, y: 14 }
       }
     ]
   };
   ```

2. **移動先マップの存在確認**
   ```bash
   # 利用可能なマップ一覧を確認
   cd packages/shared
   npm run test mapDefinitions
   ```

## GitHub Actions / CI/CDの問題

### 問題: startup_failure エラー

**症状:**
```
completed	startup_failure	<commit message>	Main Pipeline	main	push
```

**原因:**
ワークフローファイル（`.github/workflows/*.yml`）に構文エラーや設定ミスがある。

**解決方法:**

#### 1. workflow_call でのシークレット参照エラー
```yaml
# ❌ 間違い - workflow_call内でif条件でsecretsを参照
- name: "☁️ Deploy"
  if: ${{ secrets.CLOUDFLARE_API_TOKEN != '' }}

# ✅ 正しい - 条件を削除
- name: "☁️ Deploy"
  uses: cloudflare/pages-action@v1
```

#### 2. シークレットの継承
```yaml
# main.yml でworkflow_callする際に必要
jobs:
  deploy:
    uses: ./.github/workflows/deploy.yml
    secrets: inherit  # これが重要！
```

### 問題: TypeScriptエラーでCIが失敗

**症状:**
```
src/utils/battleAI.ts(264,9): error TS2304: Cannot find name 'battleType'.
```

**解決方法:**

#### 1. パラメータ名の統一
```typescript
// ❌ 間違い - パラメータ名が不一致
function action(_battleType: string) {
  if (battleType === '野生') { // エラー！

// ✅ 正しい - アンダースコア付きで統一
function action(_battleType: string) {
  if (_battleType === '野生') { // 正しい
```

#### 2. 関数シグネチャの変更への対応
```bash
# 関数定義を確認
rg "export function タイプ相性計算" --type ts

# テストを新しいシグネチャに合わせて修正
```

### 問題: Cloudflareシークレットが設定されていない

**症状:**
- ワークフローは開始するが、デプロイステップで失敗
- 「シークレットが見つかりません」的なエラー

**解決方法:**
```bash
# シークレット一覧を確認
gh secret list

# シークレットを設定
gh secret set CLOUDFLARE_API_TOKEN --body "your-api-token"
gh secret set CLOUDFLARE_ACCOUNT_ID --body "your-account-id"
```

### 問題: バックエンドテストでDB接続エラー

**症状:**
```
TypeError: Cannot read properties of undefined (reading 'DB')
```

**原因:**
テスト環境でCloudflare D1のモックが正しく設定されていない。

**解決方法:**
テストファイルでのモック設定を確認：
```typescript
// モックDBの設定
const mockDB = {
  prepare: vi.fn().mockReturnValue({
    bind: vi.fn().mockReturnThis(),
    first: vi.fn(),
    all: vi.fn(),
    run: vi.fn()
  })
};

// 環境変数のモック
vi.mock('../db/database', () => ({
  getDB: vi.fn(() => mockDB)
}));
```

### GitHub Actions デバッグ方法

#### 1. ワークフロー実行履歴の確認
```bash
# 最新5件の実行を確認
gh run list --limit 5

# 特定の実行の詳細
gh run view <run-id>

# 失敗したログのみ表示
gh run view <run-id> --log-failed
```

#### 2. ローカルでCIコマンドを実行
```bash
# CIと同じ環境で実行
pnpm install --frozen-lockfile
pnpm run type-check
pnpm run lint
pnpm run test:run
```

#### 3. ワークフローにデバッグステップを追加
```yaml
- name: Debug Info
  run: |
    echo "Node: $(node --version)"
    echo "pnpm: $(pnpm --version)"
    echo "Directory: $(pwd)"
    ls -la
```

## デバッグ方法

### 開発者ツールでのデバッグ

1. **ブラウザで F12 キーを押してコンソールを開く**

2. **矢印キーを押した時のログを確認:**
   ```
   ✅ 正常: プレイヤー移動が呼ばれました: {方向: "右", 状態: Object}
   ❌ 異常: ログが出ない → キーイベントの問題
   ```

3. **マップ読み込みログを確認:**
   ```
   ✅ 正常: useMapRouter: マップが見つかりました: はじまりの町
   ❌ 異常: マップが見つかりません → マップデータの問題
   ```

4. **移動処理ログを確認:**
   ```
   ✅ 正常: プレイヤー位置を更新します: {新しいX: 11, 新しいY: 7}
   ❌ 異常: 歩行不可能なため移動キャンセル → タイル判定の問題
   ```

### ログの詳細分析

**完全な正常ログの例:**
```
useMapRouter: マップIDを処理中: {rawマップID: "始まりの町", マップID: "始まりの町"}
useMapRouter: マップが見つかりました: はじまりの町
プレイヤー移動が呼ばれました: {方向: "右", 状態: Object}
移動先座標: {新しいX: 11, 新しいY: 7}
歩行可能チェック開始: {x: 11, y: 7, 現在のマップ: true}
範囲チェック: {x: 11, y: 7, 幅: 20, 高さ: 15, 範囲内: true}
タイル情報: {タイル: Object, y座標: 7, x座標: 11}
最終歩行可能判定: true
歩行可能チェック: {歩行可能: true, 新しいX: 11, 新しいY: 7}
プレイヤー位置を更新します: {新しいX: 11, 新しいY: 7}
```

## よくある質問

### Q: セーブデータはどこに保存されますか？
A: 開発環境では、Cloudflare D1のローカル データベース（`.wrangler/state/v3/d1`）に保存されます。

### Q: データベースをリセットしたい場合は？
A: `.wrangler`フォルダを削除して、再度マイグレーションを実行してください。

### Q: 本番環境ではどうなりますか？
A: 本番環境では、実際のCloudflare D1データベースを使用します。`wrangler.toml`の設定を確認してください。

### Q: プレイヤーが壁に向かって移動しようとするとどうなりますか？
A: 歩行不可能なタイル（木、岩、壁など）に移動しようとすると、移動はキャンセルされ、プレイヤーはその場に留まります。コンソールに「歩行不可能なため移動キャンセル」のログが出力されます。

### Q: URLを直接編集してプレイヤー位置を変更できますか？
A: はい。`/map/始まりの町?x=5&y=5` のようにURLを直接編集することで、プレイヤーの位置を変更できます。ただし、移動後は通常の移動ルールが適用されます。

### Q: マップの追加方法は？
A: `packages/shared/src/data/mapDefinitions.ts` に新しいマップデータを追加し、`全マップデータ` オブジェクトに登録してください。テストも忘れずに追加してください。