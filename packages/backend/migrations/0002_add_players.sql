-- プレイヤー情報テーブルの作成（初学者向け：ゲーム内のプレイヤーキャラクター情報を保存）
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  position_x INTEGER NOT NULL DEFAULT 7,
  position_y INTEGER NOT NULL DEFAULT 5,
  direction TEXT NOT NULL DEFAULT 'down',
  sprite TEXT NOT NULL DEFAULT 'player',
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- プレイヤー検索用のインデックス（初学者向け：user_idでの検索を高速化）
CREATE INDEX idx_players_user_id ON players(user_id);