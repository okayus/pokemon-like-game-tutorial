-- 初学者向け：アイテム・インベントリシステムのデータベース設計
-- ポケモンライクゲームでプレイヤーがアイテムを管理するためのテーブル群

-- アイテムマスターテーブル
-- 初学者向け：ゲーム内の全アイテムの基本情報を管理
CREATE TABLE IF NOT EXISTS item_master (
    -- アイテムID（主キー）
    item_id INTEGER PRIMARY KEY,
    
    -- アイテム名
    name TEXT NOT NULL,
    
    -- アイテムの詳細説明
    description TEXT NOT NULL,
    
    -- アイテムカテゴリ（回復、ボール、戦闘、大切なもの、その他）
    category TEXT NOT NULL CHECK (category IN ('回復', 'ボール', '戦闘', '大切なもの', 'その他')),
    
    -- 購入価格（0の場合は購入不可）
    buy_price INTEGER NOT NULL DEFAULT 0 CHECK (buy_price >= 0),
    
    -- 売却価格（0の場合は売却不可）
    sell_price INTEGER NOT NULL DEFAULT 0 CHECK (sell_price >= 0),
    
    -- 使用可能かどうか
    usable BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- 効果タイプ
    effect_type TEXT NOT NULL CHECK (effect_type IN (
        'HP回復', 'PP回復', '状態異常回復', '能力上昇', 
        '捕獲', '進化', 'イベント', 'なし'
    )),
    
    -- 効果値（回復量、上昇値など）
    effect_value INTEGER NOT NULL DEFAULT 0,
    
    -- アイテムアイコンのURL
    icon_url TEXT NOT NULL DEFAULT '/icons/item_default.png',
    
    -- 最大スタック数（一つのスロットに持てる最大個数）
    max_stack INTEGER NOT NULL DEFAULT 99 CHECK (max_stack > 0),
    
    -- 作成日時
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    -- 更新日時
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- プレイヤー所持アイテムテーブル
-- 初学者向け：プレイヤーがどのアイテムを何個持っているかを管理
CREATE TABLE IF NOT EXISTS player_inventory (
    -- プレイヤーID + アイテムIDで複合主キー
    player_id TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    
    -- 所持個数
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    
    -- 取得日時
    obtained_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    -- 更新日時
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    -- 複合主キー
    PRIMARY KEY (player_id, item_id),
    
    -- 外部キー制約
    FOREIGN KEY (item_id) REFERENCES item_master(item_id) ON DELETE CASCADE
);

-- プレイヤー所持金テーブル
-- 初学者向け：プレイヤーの所持金を管理
CREATE TABLE IF NOT EXISTS player_money (
    -- プレイヤーID（主キー）
    player_id TEXT PRIMARY KEY,
    
    -- 所持金額
    amount INTEGER NOT NULL DEFAULT 3000 CHECK (amount >= 0),
    
    -- 更新日時
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- インデックス作成
-- 初学者向け：検索パフォーマンスを向上させるためのインデックス

-- アイテムマスターのカテゴリ検索用
CREATE INDEX IF NOT EXISTS idx_item_master_category ON item_master(category);

-- アイテムマスターの名前検索用
CREATE INDEX IF NOT EXISTS idx_item_master_name ON item_master(name);

-- プレイヤーインベントリのプレイヤーID検索用
CREATE INDEX IF NOT EXISTS idx_player_inventory_player_id ON player_inventory(player_id);

-- プレイヤーインベントリの取得日時ソート用
CREATE INDEX IF NOT EXISTS idx_player_inventory_obtained_at ON player_inventory(obtained_at);

-- トリガー作成
-- 初学者向け：データの整合性を保つための自動処理

-- item_master の更新日時を自動更新するトリガー
CREATE TRIGGER IF NOT EXISTS update_item_master_timestamp 
    AFTER UPDATE ON item_master
BEGIN
    UPDATE item_master SET updated_at = datetime('now') WHERE item_id = NEW.item_id;
END;

-- player_inventory の更新日時を自動更新するトリガー
CREATE TRIGGER IF NOT EXISTS update_player_inventory_timestamp 
    AFTER UPDATE ON player_inventory
BEGIN
    UPDATE player_inventory SET updated_at = datetime('now') 
    WHERE player_id = NEW.player_id AND item_id = NEW.item_id;
END;

-- player_money の更新日時を自動更新するトリガー
CREATE TRIGGER IF NOT EXISTS update_player_money_timestamp 
    AFTER UPDATE ON player_money
BEGIN
    UPDATE player_money SET updated_at = datetime('now') WHERE player_id = NEW.player_id;
END;

-- アイテム個数が0になった場合に自動削除するトリガー
-- 初学者向け：在庫管理を簡素化
CREATE TRIGGER IF NOT EXISTS delete_empty_inventory_item
    AFTER UPDATE ON player_inventory
    WHEN NEW.quantity <= 0
BEGIN
    DELETE FROM player_inventory WHERE player_id = NEW.player_id AND item_id = NEW.item_id;
END;