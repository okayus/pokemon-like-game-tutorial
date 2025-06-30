-- シードデータ（初学者向け：テスト用のユーザーデータを作成）
INSERT OR IGNORE INTO users (id, username, password, created_at) VALUES (1, 'testuser', 'password123', datetime('now'));
INSERT OR IGNORE INTO users (id, username, password, created_at) VALUES (2, 'testuser2', 'password123', datetime('now'));
INSERT OR IGNORE INTO users (id, username, password, created_at) VALUES (3, 'testuser3', 'password123', datetime('now'));