# バトルシステム実装計画書

## 概要

ポケモンライクなターン制バトルシステムを実装する。初学者が理解しやすいように、基本的な機能から段階的に実装する。

## 実装フェーズ

### Phase 1: 基本設計とデータ構造 (設計・型定義)

- [x] バトル状態の型定義
- [x] 技データの型定義とマスターデータ
- [x] ダメージ計算ロジックの設計
- [x] バトルフローのステートマシン設計
- [x] ER図とシーケンス図の作成

### Phase 2: バックエンドAPI実装

- [x] 技マスターデータのデータベース設計
- [x] バトル開始API
- [x] 技使用API
- [x] ダメージ計算ロジック実装
- [x] バトル終了処理API
- [x] バックエンドAPIのテスト実装

### Phase 3: フロントエンド基本実装

- [x] バトル状態管理（Context API）
- [x] バトル画面の基本UI
- [x] 技選択UI
- [x] HPバー表示
- [x] ターン制フロー実装
- [x] バトル開始・終了処理

### Phase 4: アニメーション・エフェクト

- [x] HPバーアニメーション（Phase 3で実装済み）
- [x] 技使用エフェクト
- [x] ダメージ表示アニメーション
- [x] バトル開始・終了演出
- [ ] サウンドエフェクト（オプション）

### Phase 5: テスト・品質向上

- [x] ダメージ計算のユニットテスト（Phase 2で実装済み）
- [x] バトルフローのインテグレーションテスト
- [x] UI操作のE2Eテスト（Playwright）
- [x] エラーハンドリング
- [x] TypeScript型安全性の確保

### Phase 6: UX改善・発展機能

- [x] 技のPP（使用回数）システム
- [x] タイプ相性システム
- [ ] 状態異常システム（オプション）
- [x] AI対戦相手の実装
- [ ] バトル履歴機能

## 初学者向け学習ポイント

### プログラミング概念

- **ステートマシン**: バトルの状態遷移を学ぶ
- **非同期処理**: アニメーションとAPIの連携
- **型安全性**: TypeScriptによる堅牢な設計
- **テスト駆動開発**: t-wadaのTDDアプローチ

### アーキテクチャパターン

- **Context API**: React状態管理の学習
- **レイヤードアーキテクチャ**: フロント/バック/データの分離
- **イベントドリブン**: ユーザー操作からの状態変更

### 技術スタック

- **フロントエンド**: React, TypeScript, Tailwind CSS
- **バックエンド**: Hono, Cloudflare Workers
- **データベース**: Cloudflare D1
- **テスト**: Vitest, Playwright

## 技術仕様詳細

### バトル状態管理

```typescript
interface バトル状態 {
  バトルID: string;
  プレイヤーポケモン: 参戦ポケモン;
  敵ポケモン: 参戦ポケモン;
  現在ターン: number;
  バトルフェーズ: 'コマンド選択' | '技実行' | 'ダメージ計算' | 'バトル終了';
  選択中技: 技データ | null;
  メッセージログ: string[];
}
```

### ダメージ計算式

基本的なダメージ計算（初学者向けシンプル版）:

```
ダメージ = (攻撃力 × 技威力 / 防御力) × ランダム補正(0.85-1.0)
```

### API設計

- `POST /api/battle/start` - バトル開始
- `POST /api/battle/{battleId}/use-move` - 技使用
- `GET /api/battle/{battleId}/status` - バトル状態取得
- `POST /api/battle/{battleId}/end` - バトル終了

## 実装優先順位

1. **高優先度**: Phase 1-3（基本機能）
2. **中優先度**: Phase 4（アニメーション）
3. **低優先度**: Phase 5-6（テスト・拡張機能）

## 開発進行状況

- **開始日**: 2025-07-02
- **現在フェーズ**: Phase 6 (UX改善・発展機能) 主要機能完了
- **進捗率**: 95% (Phase 1-6主要機能完了)

## 次のステップ

1. バトル関連の型定義作成
2. 技マスターデータの設計
3. ダメージ計算ロジックの実装
4. バトル状態管理の Context 作成
5. 基本的なバトル画面UI実装

---

_この計画書は実装進行に応じて随時更新されます_
