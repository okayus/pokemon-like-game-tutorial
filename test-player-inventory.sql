-- プレイヤーの初期アイテム（テスト用）
INSERT OR IGNORE INTO player_inventory (player_id, item_id, quantity, obtained_at, updated_at) VALUES
('test-player-001', 1, 5, datetime('now'), datetime('now')),
('test-player-001', 2, 2, datetime('now'), datetime('now')),
('test-player-001', 5, 10, datetime('now'), datetime('now'));