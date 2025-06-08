# 実装に必要な前提知識

## 1. JavaScript/TypeScript の基礎

### 必要な知識
- **変数宣言**: `const`, `let`, `var` の違い
- **関数**: アロー関数、通常の関数宣言
- **オブジェクトと配列**: 基本的な操作とデストラクチャリング
- **非同期処理**: Promise, async/await
- **モジュールシステム**: import/export の使い方

### TypeScript 特有の概念
- **型注釈**: 変数や関数の型を明示的に指定
- **インターフェース**: オブジェクトの構造を定義
- **ジェネリクス**: 型の再利用性を高める
- **型エイリアス**: 複雑な型に名前を付ける

## 2. React の基礎

### コア概念
- **コンポーネント**: UI の部品として機能する関数
- **JSX**: JavaScript の中で HTML のような構文を書く
- **Props**: 親から子コンポーネントへのデータ渡し
- **State**: コンポーネント内部の状態管理

### React Hooks
- **useState**: 状態変数の管理
- **useEffect**: 副作用の処理（イベントリスナー、API 呼び出しなど）
- **useCallback**: 関数のメモ化でパフォーマンス最適化

### 例：基本的な React コンポーネント
```typescript
function Component({ name }: { name: string }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('Component mounted');
    return () => console.log('Component unmounted');
  }, []);
  
  return <div>Hello, {name}! Count: {count}</div>;
}
```

## 3. Node.js エコシステム

### パッケージマネージャー
- **npm**: Node.js 標準のパッケージマネージャー
- **pnpm**: より効率的なディスク使用とモノレポサポート
- **package.json**: プロジェクトの設定と依存関係

### モノレポツール
- **Workspaces**: 複数のパッケージを一つのリポジトリで管理
- **Turborepo**: ビルドとタスクの最適化

## 4. Web 開発の基礎

### HTML/CSS
- **DOM**: Document Object Model の理解
- **CSS Grid/Flexbox**: レイアウトシステム
- **レスポンシブデザイン**: 異なる画面サイズへの対応

### HTTP とネットワーク
- **REST API**: リソースベースの API 設計
- **HTTP メソッド**: GET, POST, PUT, DELETE
- **CORS**: Cross-Origin Resource Sharing の理解

## 5. 開発ツール

### ビルドツール
- **Vite**: 高速な開発サーバーとビルドツール
- **設定ファイル**: vite.config.ts の役割

### バージョン管理
- **Git**: 基本的なコマンド（add, commit, push, pull）
- **ブランチ**: 機能開発の分離

### エディタ/IDE
- **VS Code**: 推奨される開発環境
- **拡張機能**: TypeScript, ESLint, Prettier

## 6. ゲーム開発の基礎概念

### 座標系
- **2D 座標**: x（横）と y（縦）の理解
- **グリッドベース**: タイル単位での位置管理

### ゲームループ
- **入力処理**: キーボード/マウスイベント
- **状態更新**: ゲームロジックの実行
- **描画**: 画面への反映

### 状態管理
- **グローバル状態**: ゲーム全体の状態
- **ローカル状態**: 各コンポーネントの状態
- **イミュータブル更新**: React での状態更新パターン

## 7. Cloudflare Workers の基礎

### エッジコンピューティング
- **概念**: ユーザーに近い場所でコードを実行
- **制限事項**: CPU 時間、メモリ使用量の制限

### Wrangler
- **CLI ツール**: Workers の開発とデプロイ
- **設定ファイル**: wrangler.toml

## 8. 必要な数学的知識

### 基本的な演算
- **座標計算**: 位置の加算・減算
- **境界チェック**: マップの端の判定
- **衝突判定**: オブジェクト間の重なり検出

## 学習の優先順位

1. **最優先**: JavaScript/TypeScript の基礎、React の基礎
2. **重要**: Node.js エコシステム、Web 開発の基礎
3. **必要に応じて**: ゲーム開発の概念、Cloudflare Workers

## 推奨される学習リソース

- **TypeScript**: 公式ドキュメント、TypeScript Handbook
- **React**: 公式チュートリアル、React Beta Docs
- **Vite**: 公式ガイド
- **Tailwind CSS**: 公式ドキュメント
- **Hono**: 公式ドキュメント