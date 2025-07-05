# Drizzle ORM 導入計画書

## 概要

現在のデータベースアクセス層で発生しているTypeScript型エラーを根本的に解決するため、型安全なORMであるDrizzle ORMとバリデーションライブラリZodを導入します。

## 現状の問題点

### 1. 手動SQL操作による型の不整合
- SQLクエリ結果の型が`unknown`や`any`になる
- JOINクエリの結果型が複雑で管理困難
- パラメータバインディングの型チェックが弱い

### 2. モックアダプターの複雑性
- SimplifiedMockAdapterで18個の型エラー
- SQL文字列解析による脆弱な実装
- テスト環境と本番環境の実装乖離

## Drizzle ORM選定理由

### 1. 完全な型安全性
```typescript
// 型安全なクエリ
const players = await db.select().from(playersTable).where(eq(playersTable.id, playerId));
// players の型は Player[] として推論される
```

### 2. SQLiteとCloudflare D1の両対応
- 開発環境: SQLite
- 本番環境: Cloudflare D1
- 同一のスキーマ定義で両環境をサポート

### 3. 軽量で高性能
- ランタイムオーバーヘッドが最小
- バンドルサイズが小さい
- Cloudflare Workersに最適

### 4. Zodとの統合
- スキーマからZodバリデーションを自動生成
- 入力検証と型定義の一元化

## 実装計画

### Phase 1: 基盤整備
1. **パッケージインストール**
   - drizzle-orm
   - drizzle-kit (開発ツール)
   - zod
   - drizzle-zod (統合パッケージ)

2. **スキーマ定義**
   - `packages/backend/src/db/schema/`ディレクトリ作成
   - 各テーブルのスキーマ定義
   - リレーション定義

### Phase 2: アダプター実装
1. **DrizzleAdapter基底クラス**
   - 共通インターフェース定義
   - 環境別の実装分岐

2. **環境別実装**
   - DrizzleSQLiteAdapter (開発/テスト)
   - DrizzleD1Adapter (本番)
   - DrizzleMockAdapter (テスト用)

### Phase 3: リポジトリ層の更新
1. **既存リポジトリの移行**
   - ItemRepository
   - PlayerRepository
   - PokemonRepository

2. **型定義の統一**
   - Zodスキーマからの型生成
   - sharedパッケージへの型エクスポート

### Phase 4: マイグレーション
1. **Drizzle Kit設定**
   - マイグレーション生成
   - スキーマ同期

2. **既存データの移行**
   - 開発環境データ
   - テストデータ

## 期待される効果

### 1. 型安全性の向上
- コンパイル時の完全な型チェック
- 実行時エラーの大幅削減
- IDE支援の向上

### 2. 開発効率の改善
- SQLクエリの自動補完
- リファクタリングの容易性
- テストの簡潔化

### 3. 保守性の向上
- スキーマ定義の一元化
- マイグレーション管理の自動化
- 環境差異の吸収

## リスクと対策

### リスク
1. 学習コスト
2. 既存コードの大規模変更
3. パフォーマンスへの影響

### 対策
1. 段階的移行とドキュメント整備
2. 既存APIの互換性維持
3. ベンチマークテストの実施

## タイムライン

- Phase 1: 1日（基盤整備）
- Phase 2: 2日（アダプター実装）
- Phase 3: 2日（リポジトリ移行）
- Phase 4: 1日（マイグレーション）

合計: 約1週間

## 参考資料

- [Drizzle ORM公式ドキュメント](https://orm.drizzle.team/)
- [Drizzle with Cloudflare D1](https://orm.drizzle.team/docs/get-started-sqlite#cloudflare-d1)
- [Drizzle Zod統合](https://orm.drizzle.team/docs/zod)