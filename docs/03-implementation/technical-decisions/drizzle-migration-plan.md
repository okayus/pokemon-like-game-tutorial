# TypeScript型エラーをDrizzle版で解決する実装計画

## 現状分析

現在18個のTypeScript型エラーが発生しており、そのうち15個がSimplifiedMockAdapterに起因している。これらはすべて手動SQL操作による型の不整合が原因。

## エラー詳細分析

### 1. SimplifiedMockAdapter関連エラー（15個）

#### 1-1. JOIN操作での null値問題（4個）
**場所**: `src/adapters/simplifiedMockAdapter.ts:346, 349, 376, 379`
```typescript
// 現在の問題
}).filter(Boolean); // Type 'null' is not assignable to type 'TableRow'

// Drizzle解決策
const result = await db
  .select()
  .from(playerInventoryTable)
  .innerJoin(itemMasterTable, eq(playerInventoryTable.itemId, itemMasterTable.itemId))
  .where(eq(playerInventoryTable.playerId, playerId));
// 結果は完全に型安全
```

#### 1-2. unknown型のパラメータバインディング（10個）
**場所**: `src/adapters/simplifiedMockAdapter.ts:479, 551, 563, 577, 578, 623, 626, 629, 632`
```typescript
// 現在の問題
newRow[column] = this.boundParams[index]; // Type 'unknown' is not assignable

// Drizzle解決策
await db.insert(playersTable).values({
  id: playerId,        // 型推論により string
  name: playerName,    // 型推論により string
  positionX: x,        // 型推論により number
});
// パラメータは完全に型チェックされる
```

#### 1-3. lastRowId型の不一致（1個）
**場所**: `src/adapters/simplifiedMockAdapter.ts:506`
```typescript
// 現在の問題
lastRowId: newRow.id || newRow.pokemon_id || Date.now() // Type 'string | number | true'

// Drizzle解決策
const result = await db.insert(playersTable).values(playerData);
// result.lastInsertRowid は number | bigint 型で型安全
```

### 2. その他のアダプター関連エラー（3個）

#### 2-1. SQLiteAdapter Promise処理（1個）
**場所**: `src/adapters/sqliteAdapter.ts:75`
```typescript
// 現在の問題
const results = statements.map(stmt => stmt.run()); // Promise<RunResult>[]

// Drizzle解決策
await db.transaction(async (tx) => {
  // トランザクション内で型安全な操作
  await tx.insert(playersTable).values(playerData);
  await tx.insert(playerMoneyTable).values(moneyData);
});
```

#### 2-2. D1Adapter型の不整合（1個）
**場所**: `src/adapters/d1Adapter.ts:40`
```typescript
// 現在の問題
await this.d1.batch(statements); // PreparedStatement[] vs D1PreparedStatement[]

// Drizzle解決策
import { drizzle } from 'drizzle-orm/d1';
const db = drizzle(env.DB, { schema });
// 統一されたインターフェース
```

#### 2-3. MockEnv batch型（1個）
**場所**: `src/test-utils/mockEnv.ts:41`
```typescript
// 現在の問題
await this.adapter.batch(statements); // unknown[] vs PreparedStatement[]

// Drizzle解決策
// MockEnvは不要になる（DrizzleMockAdapterで統一）
```

## Drizzle移行計画

### Phase 1: 既存アダプターの置き換え

#### Step 1-1: DatabaseFactory更新
```typescript
// 既存
return new SimplifiedMockAdapter();

// Drizzle版
return new DrizzleMockAdapter();
```

#### Step 1-2: テストセットアップ更新
```typescript
// 既存
import { getTestDatabase } from '../test-utils/dbSetup';

// Drizzle版
import { getDrizzleTestDatabase } from '../test-utils/drizzleDbSetup';
```

### Phase 2: リポジトリ層の更新

#### Step 2-1: アイテムリポジトリ
```typescript
// 既存の手動SQL
await db.prepare(`
  SELECT pi.*, im.name, im.category 
  FROM player_inventory pi 
  INNER JOIN item_master im ON pi.item_id = im.item_id 
  WHERE pi.player_id = ?
`).bind(playerId).all();

// Drizzle版
await db
  .select({
    playerId: playerInventoryTable.playerId,
    itemId: playerInventoryTable.itemId,
    quantity: playerInventoryTable.quantity,
    name: itemMasterTable.name,
    category: itemMasterTable.category
  })
  .from(playerInventoryTable)
  .innerJoin(itemMasterTable, eq(playerInventoryTable.itemId, itemMasterTable.itemId))
  .where(eq(playerInventoryTable.playerId, playerId));
```

#### Step 2-2: ポケモンリポジトリ
```typescript
// 既存の手動SQL
await db.prepare(`
  SELECT op.*, pm.name as species_name, pm.hp as base_hp
  FROM owned_pokemon op 
  INNER JOIN pokemon_master pm ON op.species_id = pm.species_id 
  WHERE op.player_id = ?
`).bind(playerId).all();

// Drizzle版
await db
  .select({
    pokemonId: ownedPokemonTable.pokemonId,
    playerId: ownedPokemonTable.playerId,
    speciesId: ownedPokemonTable.speciesId,
    nickname: ownedPokemonTable.nickname,
    level: ownedPokemonTable.level,
    currentHp: ownedPokemonTable.currentHp,
    speciesName: pokemonMasterTable.name,
    baseHp: pokemonMasterTable.hp
  })
  .from(ownedPokemonTable)
  .innerJoin(pokemonMasterTable, eq(ownedPokemonTable.speciesId, pokemonMasterTable.speciesId))
  .where(eq(ownedPokemonTable.playerId, playerId));
```

### Phase 3: 環境別アダプター実装

#### Step 3-1: DrizzleSQLiteAdapter
```typescript
export class DrizzleSQLiteAdapter extends DrizzleAdapter {
  constructor(dbPath: string) {
    const connection = new Database(dbPath);
    super(connection);
  }
}
```

#### Step 3-2: DrizzleD1Adapter
```typescript
export class DrizzleD1Adapter extends DrizzleAdapter {
  constructor(d1: D1Database) {
    super(d1);
  }
}
```

## 実装スケジュール

### Day 1: 基盤置き換え
- [ ] DatabaseFactory → DrizzleDatabaseFactory
- [ ] testSetup → drizzleDbSetup
- [ ] 基本的な型エラー解消（15個中10個解決予想）

### Day 2: リポジトリ移行
- [ ] アイテムリポジトリのDrizzle対応
- [ ] ポケモンリポジトリのDrizzle対応
- [ ] 残りの型エラー解消（5個解決予想）

### Day 3: 完成・テスト
- [ ] 全てのテストがパス
- [ ] 型チェック 0エラー
- [ ] パフォーマンステスト

## 期待される効果

### 型安全性
- ✅ コンパイル時の完全な型チェック
- ✅ SQLクエリの型推論
- ✅ JOIN結果の型安全性

### 開発体験
- ✅ IDE自動補完
- ✅ リファクタリング容易性
- ✅ エラーメッセージの明確化

### 保守性
- ✅ 手動SQL削除
- ✅ 統一されたクエリAPI
- ✅ 環境差異の吸収

## リスク軽減策

### 段階的移行
1. 既存コードを保持しながら並行実装
2. テストで動作確認後に切り替え
3. 問題発生時の即座のロールバック

### 互換性維持
1. 既存のAPIインターフェース保持
2. テストケースの維持
3. 漸進的な機能追加

この計画により、18個のTypeScript型エラーを根本的に解決し、より堅牢で保守性の高いコードベースを実現できます。