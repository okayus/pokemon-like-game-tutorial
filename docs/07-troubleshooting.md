# 7. トラブルシューティング

## 開発環境の問題

### Node.jsバージョンエラー

**症状**
```
Error: The engine "node" is incompatible with this module. Expected version ">=20.0.0"
```

**解決方法**
```bash
# Node.jsのバージョンを確認
node --version

# nvmを使用している場合
nvm install 20
nvm use 20

# 直接インストールする場合は公式サイトから最新版をダウンロード
# https://nodejs.org/
```

### pnpm installでエラー

**症状**
```
ERR_PNPM_PEER_DEP_ISSUES Unmet peer dependencies
```

**解決方法**
```bash
# キャッシュクリア
pnpm store prune

# node_modulesを削除
rm -rf node_modules packages/*/node_modules

# ロックファイルを削除して再インストール
rm pnpm-lock.yaml
pnpm install
```

### ポート競合エラー

**症状**
```
Error: Port 5173 is already in use
```

**解決方法**
```bash
# 使用中のプロセスを確認（macOS/Linux）
lsof -i :5173
kill -9 [PID]

# Windows
netstat -ano | findstr :5173
taskkill /PID [PID] /F

# または package.json でポート変更
"dev": "vite --port 5174"
```

## ゲーム動作の問題

### キャラクターが動かない

**チェックポイント**
1. ゲームモードが 'explore' になっているか確認
2. キーボードイベントリスナーが正しく設定されているか
3. ブラウザのコンソールでエラーを確認

**デバッグ方法**
```typescript
// stores/gameStore.ts に追加
movePlayer: (direction) => set((state) => {
  console.log('Moving player:', direction);
  console.log('Current position:', state.player.position);
  // ... 移動ロジック
}),
```

### マップが表示されない

**症状**
- 画面が真っ白または真っ黒
- タイルが正しく表示されない

**解決方法**
```typescript
// デバッグ用ログを追加
export function Map() {
  const currentMap = useGameStore((state) => state.currentMap);
  const mapData = getMapData(currentMap);
  
  console.log('Current map:', currentMap);
  console.log('Map data:', mapData);
  
  if (!mapData) {
    return <div>Map not found: {currentMap}</div>;
  }
  
  // ... レンダリングロジック
}
```

### セーブ/ロードが動作しない

**症状**
- セーブしても再読み込み時にデータが消える
- ロード時にエラーが発生

**解決方法**
```typescript
// utils/saveGame.ts
export async function saveGame(data: SaveData) {
  try {
    // ローカルストレージに保存（開発環境）
    if (import.meta.env.DEV) {
      localStorage.setItem('pokemon-game-save', JSON.stringify(data));
      console.log('Game saved to localStorage');
      return;
    }
    
    // 本番環境ではAPIを使用
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Save failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Save error:', error);
    throw error;
  }
}
```

## スタイリングの問題

### Tailwind CSSが適用されない

**症状**
- クラスを追加してもスタイルが変わらない
- 一部のクラスだけ動作しない

**解決方法**
1. tailwind.config.js の content 設定を確認
```javascript
// packages/frontend/tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ...
}
```

2. 動的クラスは完全な文字列で記述
```typescript
// ❌ 動的に生成されたクラスは認識されない
const color = 'red';
return <div className={`bg-${color}-500`} />;

// ✅ 完全なクラス名を使用
const colorClasses = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
};
return <div className={colorClasses[color]} />;
```

### Gridレイアウトが崩れる

**症状**
- マップのタイルが正しく配置されない
- グリッドが一列になってしまう

**解決方法**
```css
/* 明示的にグリッドサイズを指定 */
.game-map {
  display: grid;
  grid-template-columns: repeat(20, 32px);
  grid-template-rows: repeat(15, 32px);
  gap: 0;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .game-map {
    grid-template-columns: repeat(20, 16px);
    grid-template-rows: repeat(15, 16px);
  }
}
```

## パフォーマンスの問題

### ゲームが重い・カクつく

**最適化方法**

1. **不要な再レンダリングを防ぐ**
```typescript
// React.memoを使用
export const Tile = React.memo(({ type }: TileProps) => {
  return <div className={tileStyles[type]} />;
});

// useMemoでマップデータをキャッシュ
const memoizedMapData = useMemo(
  () => processMapData(rawMapData),
  [rawMapData]
);
```

2. **画像の最適化**
```typescript
// 遅延読み込み
const LazySprite = ({ src, alt }: SpriteProps) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  );
};
```

3. **状態更新の最適化**
```typescript
// 頻繁に更新される状態を分離
const usePlayerPosition = create((set) => ({
  position: { x: 0, y: 0 },
  setPosition: (position) => set({ position }),
}));

// 他の状態と分離して管理
const useGameState = create((set) => ({
  // ゲームの他の状態
}));
```

### メモリリークの検出

**症状**
- 長時間プレイするとどんどん重くなる
- ブラウザのメモリ使用量が増え続ける

**解決方法**
```typescript
// イベントリスナーのクリーンアップ
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // キー入力処理
  };
  
  window.addEventListener('keydown', handleKeyPress);
  
  // クリーンアップ関数で必ず削除
  return () => {
    window.removeEventListener('keydown', handleKeyPress);
  };
}, []);

// タイマーのクリーンアップ
useEffect(() => {
  const timerId = setInterval(() => {
    // 定期処理
  }, 1000);
  
  return () => {
    clearInterval(timerId);
  };
}, []);
```

## ビルド・デプロイの問題

### TypeScriptエラー

**症状**
```
Type error: Property 'xxx' does not exist on type 'yyy'
```

**解決方法**
```typescript
// 型定義を確認・追加
interface GameState {
  player: Player;
  currentMap: string;
  // 不足しているプロパティを追加
  newProperty?: string;
}

// 型アサーションの使用（最終手段）
const data = response as GameData;
```

### ビルドサイズが大きい

**最適化方法**

1. **コード分割**
```typescript
// React.lazyでコンポーネントを遅延読み込み
const BattleScreen = lazy(() => import('./components/BattleScreen'));

// Suspenseでラップ
<Suspense fallback={<Loading />}>
  <BattleScreen />
</Suspense>
```

2. **不要な依存関係を削除**
```bash
# 未使用の依存関係を検出
pnpm dlx depcheck

# 不要なパッケージを削除
pnpm remove [package-name]
```

## デバッグツール

### React Developer Tools

```bash
# Chrome拡張機能をインストール
# https://chrome.google.com/webstore/detail/react-developer-tools/
```

使い方：
1. 開発者ツールを開く（F12）
2. 「Components」タブでコンポーネントツリーを確認
3. 「Profiler」タブでパフォーマンスを分析

### Redux DevTools（Zustandにも対応）

```typescript
// stores/gameStore.ts
import { devtools } from 'zustand/middleware';

export const useGameStore = create(
  devtools(
    (set) => ({
      // ストアの定義
    }),
    {
      name: 'game-store',
    }
  )
);
```

## サポートリソース

- [GitHub Issues](https://github.com/okayus/pokemon-like-game-tutorial/issues)
- [Discord コミュニティ](https://discord.gg/example)
- [公式ドキュメント](https://example.com/docs)