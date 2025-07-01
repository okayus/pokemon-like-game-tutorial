-- シンプルなポケモン管理システムのデータベーススキーマ
-- 初学者向け：最低限動作するポケモンライクゲームのための簡素化されたテーブル群

-- ポケモンマスタデータテーブル（初学者向け：ピカチュウ、フシギダネなどの基本データのみ）
CREATE TABLE IF NOT EXISTS pokemon_master (
  species_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  hp INTEGER NOT NULL,
  attack INTEGER NOT NULL,
  defense INTEGER NOT NULL,
  sprite_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- 制約条件（初学者向け：データの整合性を保つためのルール）
  CHECK (hp > 0),
  CHECK (attack > 0),
  CHECK (defense > 0)
);

-- 所有ポケモンテーブル（初学者向け：プレイヤーが捕まえた個々のポケモン）
CREATE TABLE IF NOT EXISTS owned_pokemon (
  pokemon_id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  species_id INTEGER NOT NULL,
  nickname TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  current_hp INTEGER NOT NULL,
  caught_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (species_id) REFERENCES pokemon_master(species_id) ON DELETE RESTRICT,
  
  -- 制約条件
  CHECK (level BETWEEN 1 AND 100),
  CHECK (current_hp >= 0)
);

-- パーティテーブル（初学者向け：手持ちポケモン最大6体の管理）
CREATE TABLE IF NOT EXISTS party_pokemon (
  player_id TEXT,
  position INTEGER,
  pokemon_id TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (player_id, position),
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (pokemon_id) REFERENCES owned_pokemon(pokemon_id) ON DELETE CASCADE,
  
  -- 制約条件
  CHECK (position BETWEEN 1 AND 6),
  UNIQUE (pokemon_id) -- 同じポケモンが複数のパーティ位置にいることを防ぐ
);

-- インデックス作成（初学者向け：検索の高速化）

-- 所有ポケモン検索用
CREATE INDEX idx_owned_pokemon_player_id ON owned_pokemon(player_id);
CREATE INDEX idx_owned_pokemon_species_id ON owned_pokemon(species_id);

-- パーティ検索用
CREATE INDEX idx_party_pokemon_player_id ON party_pokemon(player_id);