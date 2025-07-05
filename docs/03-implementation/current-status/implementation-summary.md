# 実装のポイントまとめ

## 1. モノレポ構成の理解

### プロジェクト構造

```
pokemon-like-game-tutorial/
├── packages/
│   ├── frontend/     # Vite + React + TypeScript
│   ├── backend/      # Hono + Cloudflare Workers
│   └── shared/       # 共通の型定義・ユーティリティ
```

### ポイント

- **pnpm-workspace.yaml** でワークスペースを定義
- **turbo.json** でビルド・開発タスクを管理
- 各パッケージは独立した package.json を持つ

## 2. 共有パッケージ（shared）の実装

### 役割

- フロントエンドとバックエンドで共通の型定義を提供
- ゲームロジックの定数を一元管理

### 重要な型定義

- `GameState`: ゲーム全体の状態管理
- `Position`, `Direction`: プレイヤーの位置と向き
- `MapData`, `Tile`: マップ構造の定義

### 実装のポイント

```typescript
// 型のエクスポートは index.ts でまとめて行う
export * from './types/game';
export * from './constants/game';
```

## 3. フロントエンド実装

### 技術スタック

- **Vite**: 高速な開発サーバーとビルドツール
- **React**: UI ライブラリ
- **Tailwind CSS v4**: ユーティリティファーストの CSS フレームワーク

### 実装のポイント

#### Vite 設定での共有パッケージ解決

```typescript
// vite.config.ts
resolve: {
  alias: {
    '@pokemon-like-game-tutorial/shared': path.resolve(__dirname, '../shared/src'),
  },
},
```

#### ゲームループの実装

```typescript
// キーボード入力の処理
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        movePlayer('up');
        break;
      // ...
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [movePlayer]);
```

#### グリッドベースの描画

- CSS Grid や absolute positioning を使用
- タイルサイズ（32px）を基準にした座標計算

## 4. バックエンド実装

### 技術スタック

- **Hono**: 軽量な Web フレームワーク
- **Cloudflare Workers**: エッジコンピューティング環境

### 実装のポイント

#### CORS の設定

```typescript
app.use('/*', cors());
```

#### RESTful API の設計

- `/api/health` - ヘルスチェック
- `/api/maps/:mapId` - マップデータ取得
- `/api/player/:playerId` - プレイヤーデータ取得

## 5. 開発環境の構築

### 依存関係のインストール

```bash
pnpm install
```

### 開発サーバーの起動

```bash
pnpm dev  # turbo が frontend と backend を同時起動
```

### ポート設定

- Frontend: http://localhost:5173
- Backend: http://localhost:8787

## 6. トラブルシューティング

### 共有パッケージのインポートエラー

- パッケージ名が package.json と一致しているか確認
- Vite のエイリアス設定が正しいか確認
- TypeScript の paths 設定を確認

### 型定義が認識されない場合

- shared パッケージの index.ts でエクスポートされているか確認
- IDE を再起動して TypeScript サーバーをリフレッシュ

## 7. 最小限の実装から始める重要性

### メリット

1. **動作確認が早い**: 基本機能だけでシステム全体の動作を確認
2. **問題の特定が容易**: シンプルな構成で問題箇所を特定しやすい
3. **段階的な拡張**: 基盤ができてから機能を追加

### 実装順序

1. 共有パッケージの型定義
2. フロントエンドの最小限の画面
3. バックエンドの基本的な API
4. 動作確認後に機能追加
