# フラッシュカード

## 実装のポイント編

### カード 1
**Q: モノレポ構成で各パッケージを管理するために必要な設定ファイルは？**
A: pnpm-workspace.yaml（ワークスペース定義）と turbo.json（タスク管理）

---

### カード 2
**Q: Vite で shared パッケージを解決できない問題の解決方法は？**
A: vite.config.ts の resolve.alias に共有パッケージへのパスを設定する
```typescript
'@pokemon-like-game-tutorial/shared': path.resolve(__dirname, '../shared/src')
```

---

### カード 3
**Q: ゲームループを React で実装する際に使用する Hook は？**
A: useEffect（イベントリスナーの登録）と useCallback（関数のメモ化）

---

### カード 4
**Q: Hono でCORSを有効にする方法は？**
A: `app.use('/*', cors())` をルート定義の前に追加

---

### カード 5
**Q: グリッドベースのゲームでプレイヤーの位置を計算する式は？**
A: `実際の座標 = グリッド位置 × タイルサイズ`
例：x=5, タイルサイズ=32px の場合、実際のx座標は 160px

---

### カード 6
**Q: TypeScript でモノレポの共有パッケージから型をエクスポートする方法は？**
A: index.ts で `export * from './types/game'` のように再エクスポート

---

### カード 7
**Q: React でキーボード入力を処理する際の注意点は？**
A: useEffect の依存配列に関数を含め、クリーンアップでイベントリスナーを削除する

---

### カード 8
**Q: 開発サーバーのポート番号は？**
A: Frontend: 5173、Backend: 8787

---

## 前提知識編

### カード 9
**Q: React の useState Hook の基本的な使い方は？**
A: `const [state, setState] = useState(初期値)`
状態の更新は setState(新しい値) または setState(prev => 新しい値)

---

### カード 10
**Q: TypeScript のインターフェースと型エイリアスの違いは？**
A: インターフェース：オブジェクトの構造定義、拡張可能
型エイリアス：任意の型に名前を付ける、ユニオン型も可能

---

### カード 11
**Q: import と export の基本的な構文は？**
A: 
- Named export: `export { Component }`、import: `import { Component } from './file'`
- Default export: `export default Component`、import: `import Component from './file'`

---

### カード 12
**Q: React コンポーネントの Props とは？**
A: 親コンポーネントから子コンポーネントへ渡されるデータ。読み取り専用で変更不可

---

### カード 13
**Q: async/await の基本的な使い方は？**
A: 
```typescript
async function fetchData() {
  const response = await fetch('/api/data');
  const data = await response.json();
  return data;
}
```

---

### カード 14
**Q: CSS Grid でグリッドレイアウトを作る基本的なプロパティは？**
A: 
- `display: grid`
- `grid-template-columns`（列の定義）
- `grid-template-rows`（行の定義）

---

### カード 15
**Q: pnpm workspace でパッケージ間の依存関係を定義する方法は？**
A: package.json の dependencies に `"@パッケージ名": "workspace:*"` と記述

---

### カード 16
**Q: REST API の基本的な HTTP メソッドとその用途は？**
A: 
- GET: データ取得
- POST: 新規作成
- PUT: 更新
- DELETE: 削除

---

### カード 17
**Q: React の useEffect の第二引数（依存配列）の役割は？**
A: 
- 空配列 `[]`: マウント時のみ実行
- 値を含む `[value]`: 値が変化した時に実行
- 省略: レンダリング毎に実行

---

### カード 18
**Q: TypeScript で関数の型を定義する方法は？**
A: 
```typescript
// 関数型注釈
const func: (x: number) => string = (x) => x.toString();
// または
type FuncType = (x: number) => string;
```

---

### カード 19
**Q: Vite の主な特徴は？**
A: 
- 高速な開発サーバー（ES modules を活用）
- 本番ビルドは Rollup を使用
- Hot Module Replacement (HMR) サポート

---

### カード 20
**Q: Cloudflare Workers の制限事項は？**
A: 
- CPU 時間: 10ms（無料）〜 50ms（有料）
- メモリ: 128MB
- リクエストサイズ: 100MB

---

### カード 21
**Q: オブジェクトのデストラクチャリングの構文は？**
A: 
```typescript
const { name, age } = person;
// 配列の場合
const [first, second] = array;
```

---

### カード 22
**Q: React でイミュータブルな状態更新をする方法は？**
A: 
```typescript
// オブジェクト
setState({ ...prevState, newProp: value });
// 配列
setState([...prevArray, newItem]);
```

---

### カード 23
**Q: Git で変更をコミットする基本的な流れは？**
A: 
1. `git add .`（変更をステージング）
2. `git commit -m "メッセージ"`（コミット）
3. `git push`（リモートへプッシュ）

---

### カード 24
**Q: 2D ゲームでの方向を表す一般的な定義は？**
A: 
```typescript
const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};
```

---

### カード 25
**Q: CORS エラーが発生する理由と解決方法は？**
A: 
理由：ブラウザが異なるオリジン間のリクエストをブロック
解決：サーバー側で適切な CORS ヘッダーを設定