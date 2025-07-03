# Pokemon-like Game Tutorial

非プログラマーが、Webアプリ開発を学習するためのポケモンライクな2Dブラウザゲームです。TypeScript、React、Honoを使用して開発されています。

## 特徴

- 🎮 Gridレイアウトベースの2Dゲーム
- 🎨 Tailwind CSS v4 + shadcn/ui でスタイリング
- 📦 TypeScriptモノレポ構成
- ⚡ Vite + React (フロントエンド)
- 🔥 Hono (バックエンド)
- ☁️ Cloudflareでホスティング

## ドキュメント

詳細なドキュメントは[こちら](./docs/README.md)をご覧ください。

## クイックスタート

```bash
# リポジトリのクローン
git clone https://github.com/okayus/pokemon-like-game-tutorial.git
cd pokemon-like-game-tutorial

# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

## プロジェクト構成

```
pokemon-like-game-tutorial/
├── packages/
│   ├── frontend/     # Vite + React + TypeScript
│   ├── backend/      # Hono + TypeScript
│   └── shared/       # 共通の型定義・ユーティリティ
├── docs/             # ドキュメント
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## ライセンス

MIT
