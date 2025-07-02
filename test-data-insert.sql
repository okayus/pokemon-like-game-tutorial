-- テスト用初期データ投入SQL
-- まず外部キー制約を無効化
PRAGMA foreign_keys = OFF;

-- アイテムマスターデータ
INSERT OR IGNORE INTO item_master (item_id, name, description, category, buy_price, sell_price, usable, effect_type, effect_value, max_stack, created_at, updated_at) VALUES
(1, 'きずぐすり', 'ポケモンのHPを20回復する', '回復', 300, 150, 1, 'HP回復', 20, 99, datetime('now'), datetime('now')),
(2, 'いいきずぐすり', 'ポケモンのHPを50回復する', '回復', 700, 350, 1, 'HP回復', 50, 99, datetime('now'), datetime('now')),
(3, 'すごいきずぐすり', 'ポケモンのHPを200回復する', '回復', 1200, 600, 1, 'HP回復', 200, 99, datetime('now'), datetime('now')),
(4, 'かいふくのくすり', 'ポケモンのHPを全回復する', '回復', 3000, 1500, 1, '全回復', 999, 99, datetime('now'), datetime('now')),
(5, 'モンスターボール', '野生のポケモンを捕まえる', 'ボール', 200, 100, 0, NULL, 0, 999, datetime('now'), datetime('now')),
(6, 'スーパーボール', 'モンスターボールより捕まえやすい', 'ボール', 600, 300, 0, NULL, 0, 999, datetime('now'), datetime('now')),
(7, 'ハイパーボール', 'スーパーボールより捕まえやすい', 'ボール', 1200, 600, 0, NULL, 0, 999, datetime('now'), datetime('now')),
(8, 'ふしぎなアメ', 'ポケモンのレベルを1上げる', 'その他', 10000, 5000, 1, 'レベルアップ', 1, 99, datetime('now'), datetime('now'));

-- プレイヤーの所持金初期設定
INSERT OR IGNORE INTO player_money (player_id, amount, updated_at) VALUES
('test-player-001', 5000, datetime('now'));

-- プレイヤーの初期アイテム（テスト用）
INSERT OR IGNORE INTO player_inventory (player_id, item_id, quantity, obtained_at, updated_at) VALUES
('test-player-001', 1, 5, datetime('now'), datetime('now')),
('test-player-001', 2, 2, datetime('now'), datetime('now')),
('test-player-001', 5, 10, datetime('now'), datetime('now'));

-- 外部キー制約を再有効化
PRAGMA foreign_keys = ON;