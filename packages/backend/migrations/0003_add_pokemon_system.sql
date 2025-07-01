-- ポケモン管理システムのデータベーススキーマ
-- 初学者向け：ポケモンの種族、個体、パーティ、ボックス管理のためのテーブル群

-- ポケモン種族データテーブル（初学者向け：ピカチュウ、フシギダネなどの基本データ）
CREATE TABLE IF NOT EXISTS pokemon_species (
  species_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL UNIQUE,
  type1 TEXT NOT NULL,
  type2 TEXT,
  base_hp INTEGER NOT NULL,
  base_attack INTEGER NOT NULL,
  base_defense INTEGER NOT NULL,
  base_sp_attack INTEGER NOT NULL,
  base_sp_defense INTEGER NOT NULL,
  base_speed INTEGER NOT NULL,
  sprite_url TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- 制約条件（初学者向け：データの整合性を保つためのルール）
  CHECK (base_hp > 0),
  CHECK (base_attack > 0),
  CHECK (base_defense > 0),
  CHECK (base_sp_attack > 0),
  CHECK (base_sp_defense > 0),
  CHECK (base_speed > 0),
  CHECK (type1 IN ('ノーマル', 'ほのお', 'みず', 'でんき', 'くさ', 'こおり', 'かくとう', 'どく', 'じめん', 'ひこう', 'エスパー', 'むし', 'いわ', 'ゴースト', 'ドラゴン', 'あく', 'はがね', 'フェアリー')),
  CHECK (type2 IS NULL OR type2 IN ('ノーマル', 'ほのお', 'みず', 'でんき', 'くさ', 'こおり', 'かくとう', 'どく', 'じめん', 'ひこう', 'エスパー', 'むし', 'いわ', 'ゴースト', 'ドラゴン', 'あく', 'はがね', 'フェアリー'))
);

-- 技データテーブル（初学者向け：でんきショック、かみつくなどの技情報）
CREATE TABLE IF NOT EXISTS moves (
  move_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  power INTEGER,
  accuracy INTEGER NOT NULL,
  pp INTEGER NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- 制約条件
  CHECK (category IN ('物理', '特殊', '変化')),
  CHECK (power IS NULL OR power > 0),
  CHECK (accuracy BETWEEN 0 AND 100),
  CHECK (pp > 0),
  CHECK (type IN ('ノーマル', 'ほのお', 'みず', 'でんき', 'くさ', 'こおり', 'かくとう', 'どく', 'じめん', 'ひこう', 'エスパー', 'むし', 'いわ', 'ゴースト', 'ドラゴン', 'あく', 'はがね', 'フェアリー'))
);

-- 種族習得技テーブル（初学者向け：各ポケモンがレベルアップで覚える技）
CREATE TABLE IF NOT EXISTS species_moves (
  species_id INTEGER,
  move_id INTEGER,
  learn_level INTEGER NOT NULL,
  learn_method TEXT NOT NULL DEFAULT 'レベルアップ',
  PRIMARY KEY (species_id, move_id),
  FOREIGN KEY (species_id) REFERENCES pokemon_species(species_id) ON DELETE CASCADE,
  FOREIGN KEY (move_id) REFERENCES moves(move_id) ON DELETE CASCADE,
  
  -- 制約条件
  CHECK (learn_level BETWEEN 1 AND 100),
  CHECK (learn_method IN ('レベルアップ', '技マシン', '教え技', '遺伝'))
);

-- ポケモンボックステーブル（初学者向け：ポケモンを保管する場所）
CREATE TABLE IF NOT EXISTS pokemon_boxes (
  box_id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  name TEXT NOT NULL,
  box_number INTEGER NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 30,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  
  -- 制約条件
  UNIQUE (player_id, box_number),
  CHECK (capacity > 0),
  CHECK (box_number BETWEEN 1 AND 32)
);

-- 所有ポケモンテーブル（初学者向け：プレイヤーが捕まえた個々のポケモン）
CREATE TABLE IF NOT EXISTS owned_pokemon (
  pokemon_id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  species_id INTEGER NOT NULL,
  nickname TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  
  -- 個体値（初学者向け：同じ種族でも個体による強さの違い）
  iv_hp INTEGER NOT NULL DEFAULT 0,
  iv_attack INTEGER NOT NULL DEFAULT 0,
  iv_defense INTEGER NOT NULL DEFAULT 0,
  iv_sp_attack INTEGER NOT NULL DEFAULT 0,
  iv_sp_defense INTEGER NOT NULL DEFAULT 0,
  iv_speed INTEGER NOT NULL DEFAULT 0,
  
  -- 性格（初学者向け：ステータスに影響する性格）
  nature TEXT NOT NULL DEFAULT 'がんばりや',
  
  -- 現在の状態
  current_hp INTEGER NOT NULL,
  
  -- 保管場所（ボックスまたはパーティ）
  box_id TEXT,
  box_position INTEGER,
  
  -- 日時
  caught_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (species_id) REFERENCES pokemon_species(species_id) ON DELETE RESTRICT,
  FOREIGN KEY (box_id) REFERENCES pokemon_boxes(box_id) ON DELETE SET NULL,
  
  -- 制約条件
  CHECK (level BETWEEN 1 AND 100),
  CHECK (experience >= 0),
  CHECK (iv_hp BETWEEN 0 AND 31),
  CHECK (iv_attack BETWEEN 0 AND 31),
  CHECK (iv_defense BETWEEN 0 AND 31),
  CHECK (iv_sp_attack BETWEEN 0 AND 31),
  CHECK (iv_sp_defense BETWEEN 0 AND 31),
  CHECK (iv_speed BETWEEN 0 AND 31),
  CHECK (current_hp >= 0),
  CHECK (box_position IS NULL OR box_position BETWEEN 1 AND 30),
  CHECK (nature IN ('がんばりや', 'さみしがり', 'ゆうかん', 'いじっぱり', 'やんちゃ', 'ずぶとい', 'すなお', 'のんき', 'わんぱく', 'のうてんき', 'おくびょう', 'せっかち', 'まじめ', 'ようき', 'むじゃき', 'ひかえめ', 'おっとり', 'れいせい', 'てれや', 'うっかりや', 'おだやか', 'おとなしい', 'しんちょう', 'きまぐれ', 'れんそ'))
);

-- ポケモンの覚えている技テーブル（初学者向け：各ポケモンが覚えている最大4つの技）
CREATE TABLE IF NOT EXISTS pokemon_moves (
  pokemon_id TEXT,
  move_id INTEGER,
  slot INTEGER NOT NULL,
  current_pp INTEGER NOT NULL,
  learned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (pokemon_id, move_id),
  FOREIGN KEY (pokemon_id) REFERENCES owned_pokemon(pokemon_id) ON DELETE CASCADE,
  FOREIGN KEY (move_id) REFERENCES moves(move_id) ON DELETE CASCADE,
  
  -- 制約条件
  CHECK (slot BETWEEN 1 AND 4),
  CHECK (current_pp >= 0),
  UNIQUE (pokemon_id, slot)
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
CREATE INDEX idx_owned_pokemon_level ON owned_pokemon(level);
CREATE INDEX idx_owned_pokemon_box_id ON owned_pokemon(box_id);

-- パーティ検索用
CREATE INDEX idx_party_pokemon_player_id ON party_pokemon(player_id);

-- 技検索用
CREATE INDEX idx_pokemon_moves_pokemon_id ON pokemon_moves(pokemon_id);
CREATE INDEX idx_species_moves_species_id ON species_moves(species_id);
CREATE INDEX idx_species_moves_learn_level ON species_moves(learn_level);

-- ボックス検索用
CREATE INDEX idx_pokemon_boxes_player_id ON pokemon_boxes(player_id);

-- 種族データ検索用
CREATE INDEX idx_pokemon_species_type1 ON pokemon_species(type1);
CREATE INDEX idx_pokemon_species_type2 ON pokemon_species(type2);

-- 技データ検索用
CREATE INDEX idx_moves_type ON moves(type);
CREATE INDEX idx_moves_category ON moves(category);