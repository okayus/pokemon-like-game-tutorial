# Claude Code 設定ガイド

このプロジェクトはポケモンライクな2Dブラウザゲームの学習用プロジェクトです。
TypeScript、React、Hono、Cloudflareを使用して開発されています。

## ルール
- mainブランチで作業せず、issueとブランチを作成すること
- プログラミング初学者向けのコメントをソースコードに書くこと。日本語で
- ゲームの完成度は最低限でよい。その先の実装を初学者向けの学習コンテンツにするため
- t-wadaのTDDで実装すること
- 初学者向けに変数・関数名はなるべく日本語で命名すること（例:`initialGameState`は`shokiGameJotai`のような）
- docsに要件定義や仕様書などのドキュメントを作成すること

## MCPサーバー設定

このプロジェクトには以下のCloudflare MCPサーバーが設定されています：

### 1. Cloudflare Documentation Server
- **名前**: cloudflare
- **用途**: Cloudflareのドキュメントを検索
- **使用例**:
  ```
  @cloudflare で Workers のコストについて教えて
  @cloudflare で Workers Analytics Engine のインデックス数の制限は？
  @cloudflare で Workers AutoRAG バインディングの使い方を教えて
  ```

### 2. Cloudflare Workers Bindings Server
- **名前**: workers-bindings
- **用途**: Cloudflareリソースの管理（アカウント、KV、Workers、R2、D1、Hyperdrive）
- **使用例**:
  ```
  @workers-bindings でアカウント一覧を表示
  @workers-bindings でKVネームスペース一覧を表示
  @workers-bindings でWorkers一覧を表示
  @workers-bindings でR2バケット一覧を表示
  @workers-bindings でD1データベース一覧を表示
  ```

## プロジェクトのデプロイ

このプロジェクトはCloudflareにデプロイすることを前提としています。
MCPサーバーを使用してCloudflareのドキュメントを参照しながら、以下の設定を行うことができます：

1. Workers の設定とデプロイ
2. KV ネームスペースの作成と管理
3. R2 バケットの設定（必要に応じて）
4. D1 データベースの設定（必要に応じて）

## 開発時の注意事項

- フロントエンド: `packages/frontend/` - Vite + React + TypeScript
- バックエンド: `packages/backend/` - Hono + TypeScript
- 共通型定義: `packages/shared/` - 共通の型定義とユーティリティ

開発サーバーの起動:
```bash
pnpm dev
```