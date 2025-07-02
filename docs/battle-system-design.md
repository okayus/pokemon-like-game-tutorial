# バトルシステム設計書

## データベース設計

### ER図

```mermaid
erDiagram
    MOVE_MASTER {
        int move_id PK "技ID"
        string name "技名（かみつく、でんきショックなど）"
        string type "タイプ（ノーマル、でんきなど）"
        int power "威力（技の基本攻撃力）"
        int accuracy "命中率（％）"
        int pp "PP（使用可能回数）"
        string category "物理/特殊/変化"
        string description "技の説明"
        string created_at "作成日時"
        string updated_at "更新日時"
    }

    POKEMON_MOVES {
        string pokemon_id PK "所有ポケモンID"
        int move_id PK "技ID"
        int current_pp "現在のPP"
        string learned_at "習得日時"
    }

    BATTLE_SESSIONS {
        string battle_id PK "バトルID（UUID）"
        string player_id "プレイヤーID"
        string player_pokemon_id "プレイヤーポケモンID"
        string enemy_pokemon_id "敵ポケモンID（野生またはNPC）"
        string battle_type "バトル種別（野生/トレーナー）"
        string status "バトル状態（進行中/終了）"
        int current_turn "現在ターン数"
        string phase "バトルフェーズ"
        string winner "勝者（player/enemy/draw）"
        string created_at "バトル開始日時"
        string ended_at "バトル終了日時"
    }

    BATTLE_LOGS {
        int log_id PK "ログID"
        string battle_id FK "バトルID"
        int turn_number "ターン番号"
        string action_type "行動種別（move/switch/item）"
        string acting_pokemon "行動したポケモン"
        int move_id "使用技ID（nullの場合もある）"
        int damage_dealt "与えたダメージ"
        string message "バトルメッセージ"
        string created_at "行動日時"
    }

    OWNED_POKEMON {
        string pokemon_id PK "所有ポケモンID"
        string player_id "プレイヤーID"
        int species_id "種族ID"
        int level "レベル"
        int current_hp "現在HP"
        int max_hp "最大HP"
        int attack "攻撃力"
        int defense "防御力"
        string nickname "ニックネーム"
        string status_condition "状態異常"
        string created_at "捕獲日時"
    }

    MOVE_MASTER ||--o{ POKEMON_MOVES : "技を覚える"
    OWNED_POKEMON ||--o{ POKEMON_MOVES : "ポケモンが覚える"
    OWNED_POKEMON ||--o{ BATTLE_SESSIONS : "バトルに参加"
    BATTLE_SESSIONS ||--o{ BATTLE_LOGS : "バトルログを記録"
```

## バトルフロー設計

### シーケンス図

```mermaid
sequenceDiagram
    participant UI as バトル画面
    participant BC as バトルContext
    participant API as バトルAPI
    participant DB as データベース

    Note over UI,DB: バトル開始フロー
    
    UI->>BC: バトル開始要求(player_pokemon_id, enemy_pokemon_id)
    BC->>API: POST /api/battle/start
    API->>DB: バトルセッション作成
    API->>DB: ポケモンデータ取得
    DB-->>API: ポケモン情報返却
    API-->>BC: バトル初期状態返却
    BC-->>UI: バトル画面表示

    Note over UI,DB: ターン制バトルループ
    
    loop 各ターン
        UI->>BC: 技選択(move_id)
        BC->>UI: 技選択確認表示
        UI->>BC: 技使用実行
        
        BC->>API: POST /api/battle/{battleId}/use-move
        API->>DB: 技データ取得
        API->>API: ダメージ計算実行
        API->>DB: ポケモンHP更新
        API->>DB: バトルログ記録
        API-->>BC: 技使用結果返却
        
        BC->>BC: バトル状態更新
        BC-->>UI: アニメーション開始
        UI->>UI: ダメージエフェクト表示
        UI->>UI: HPバー更新アニメーション
        
        alt バトル終了条件
            BC->>API: POST /api/battle/{battleId}/end
            API->>DB: バトル結果記録
            API-->>BC: バトル終了データ
            BC-->>UI: バトル結果画面表示
        else バトル継続
            BC->>BC: 次ターン準備
            BC-->>UI: コマンド選択画面表示
        end
    end
```

## ステートマシン設計

### バトルフェーズ遷移図

```mermaid
stateDiagram-v2
    [*] --> バトル開始: ポケモン選択完了
    バトル開始 --> コマンド選択: 初期化完了
    
    コマンド選択 --> 技選択: 技コマンド選択
    コマンド選択 --> アイテム使用: アイテムコマンド選択
    コマンド選択 --> ポケモン交代: 交代コマンド選択
    
    技選択 --> 技実行確認: 技決定
    技実行確認 --> ダメージ計算: 実行決定
    技実行確認 --> 技選択: キャンセル
    
    アイテム使用 --> ダメージ計算: アイテム使用完了
    ポケモン交代 --> ダメージ計算: 交代完了
    
    ダメージ計算 --> アニメーション再生: 計算完了
    アニメーション再生 --> バトル継続判定: エフェクト終了
    
    バトル継続判定 --> コマンド選択: バトル継続
    バトル継続判定 --> バトル終了: 勝敗決定
    
    バトル終了 --> [*]: 結果確認完了
```

## API仕様書

### 1. バトル開始API
```
POST /api/battle/start
Content-Type: application/json

Request:
{
  "player_id": "player-001",
  "player_pokemon_id": "owned-pokemon-123",
  "enemy_pokemon_id": "wild-pokemon-456",
  "battle_type": "wild" | "trainer"
}

Response:
{
  "success": true,
  "battle": {
    "battle_id": "battle-uuid-789",
    "player_pokemon": {
      "pokemon_id": "owned-pokemon-123",
      "name": "ピカチュウ",
      "level": 15,
      "current_hp": 45,
      "max_hp": 45,
      "attack": 55,
      "defense": 40,
      "moves": [...]
    },
    "enemy_pokemon": {
      "pokemon_id": "wild-pokemon-456",
      "name": "ポッポ",
      "level": 12,
      "current_hp": 35,
      "max_hp": 35,
      "attack": 45,
      "defense": 40,
      "moves": [...]
    },
    "current_turn": 1,
    "phase": "コマンド選択"
  }
}
```

### 2. 技使用API
```
POST /api/battle/{battleId}/use-move
Content-Type: application/json

Request:
{
  "pokemon_id": "owned-pokemon-123",
  "move_id": 1,
  "target": "enemy"
}

Response:
{
  "success": true,
  "result": {
    "move_name": "でんきショック",
    "damage_dealt": 18,
    "critical_hit": false,
    "effectiveness": "normal",
    "attacker_hp": 45,
    "target_hp": 17,
    "battle_status": "ongoing" | "ended",
    "winner": null | "player" | "enemy",
    "message": "ピカチュウの でんきショック！ポッポに 18のダメージ！"
  }
}
```

### 3. バトル状態取得API
```
GET /api/battle/{battleId}/status

Response:
{
  "success": true,
  "battle": {
    "battle_id": "battle-uuid-789",
    "status": "ongoing",
    "current_turn": 3,
    "phase": "コマンド選択",
    "player_pokemon": {...},
    "enemy_pokemon": {...},
    "recent_logs": [...]
  }
}
```

## ダメージ計算式（初学者版）

### 基本ダメージ計算
```typescript
// 初学者向けシンプル版ダメージ計算
function ダメージ計算(
  攻撃者: 参戦ポケモン,
  防御者: 参戦ポケモン,
  使用技: 技データ
): number {
  // 基本ダメージ = (攻撃力 × 技威力) ÷ 防御力
  const 基本ダメージ = Math.floor(
    (攻撃者.attack * 使用技.power) / 防御者.defense
  );
  
  // ランダム補正（85%〜100%）
  const ランダム補正 = 0.85 + Math.random() * 0.15;
  
  // 最終ダメージ（最低1ダメージ保証）
  const 最終ダメージ = Math.max(1, Math.floor(基本ダメージ * ランダム補正));
  
  return 最終ダメージ;
}
```

### クリティカル判定（発展版）
```typescript
function クリティカル判定(): boolean {
  // 1/16の確率でクリティカル
  return Math.random() < 0.0625;
}
```

## フロントエンド状態管理

### バトルContext設計
```typescript
interface バトルコンテキスト {
  // 状態
  現在バトル: バトル状態 | null;
  読み込み中: boolean;
  エラーメッセージ: string;
  
  // アクション
  バトル開始: (playerPokemonId: string, enemyPokemonId: string) => Promise<void>;
  技使用: (moveId: number) => Promise<void>;
  バトル終了: () => void;
  
  // UI状態
  選択中技: 技データ | null;
  アニメーション中: boolean;
  メッセージ表示中: boolean;
}
```

## 初学者向け学習ポイント

### 1. ステートマシンパターン
- バトルの複雑な状態遷移を整理
- 各フェーズでの有効な操作を制限

### 2. 非同期処理とアニメーション
- API通信とUI更新の協調
- Promise/async-awaitの実践

### 3. TypeScript型安全性
- 複雑なデータ構造の型定義
- Union型による状態表現

### 4. React Context API
- 複数コンポーネント間での状態共有
- カスタムHooksの活用

---

*この設計書は実装進行に応じて随時更新されます*