-- プレイヤーの所持金初期設定
INSERT OR IGNORE INTO player_money (player_id, amount, updated_at) VALUES
('test-player-001', 5000, datetime('now'));