-- 初学者向け：バトルシステム用のテーブル作成
-- ポケモンバトルに必要なデータベース構造

-- 技マスターテーブル
CREATE TABLE IF NOT EXISTS move_master (
    move_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('ノーマル', 'でんき', 'みず', 'ひこう', 'くさ', 'ほのお', 'じめん', 'いわ', 'かくとう', 'エスパー')),
    power INTEGER NOT NULL DEFAULT 0,
    accuracy INTEGER NOT NULL DEFAULT 100 CHECK(accuracy >= 0 AND accuracy <= 100),
    pp INTEGER NOT NULL DEFAULT 10,
    category TEXT NOT NULL CHECK(category IN ('物理', '特殊', '変化')),
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ポケモンが覚えている技テーブル
CREATE TABLE IF NOT EXISTS pokemon_moves (
    pokemon_id TEXT NOT NULL,
    move_id INTEGER NOT NULL,
    current_pp INTEGER NOT NULL,
    learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (pokemon_id, move_id),
    FOREIGN KEY (pokemon_id) REFERENCES owned_pokemon(pokemon_id) ON DELETE CASCADE,
    FOREIGN KEY (move_id) REFERENCES move_master(move_id)
);

-- バトルセッションテーブル
CREATE TABLE IF NOT EXISTS battle_sessions (
    battle_id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    player_pokemon_id TEXT NOT NULL,
    enemy_pokemon_id TEXT NOT NULL,
    battle_type TEXT NOT NULL CHECK(battle_type IN ('野生', 'トレーナー')),
    status TEXT NOT NULL DEFAULT '進行中' CHECK(status IN ('進行中', '終了')),
    current_turn INTEGER NOT NULL DEFAULT 1,
    phase TEXT NOT NULL DEFAULT 'コマンド選択',
    winner TEXT CHECK(winner IN ('味方', '敵', '引き分け')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(player_id),
    FOREIGN KEY (player_pokemon_id) REFERENCES owned_pokemon(pokemon_id)
);

-- バトルログテーブル
CREATE TABLE IF NOT EXISTS battle_logs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    battle_id TEXT NOT NULL,
    turn_number INTEGER NOT NULL,
    action_type TEXT NOT NULL CHECK(action_type IN ('技使用', 'アイテム', 'ポケモン交代', '逃げる')),
    acting_pokemon TEXT NOT NULL,
    move_id INTEGER,
    damage_dealt INTEGER DEFAULT 0,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (battle_id) REFERENCES battle_sessions(battle_id) ON DELETE CASCADE,
    FOREIGN KEY (move_id) REFERENCES move_master(move_id)
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX idx_pokemon_moves_pokemon_id ON pokemon_moves(pokemon_id);
CREATE INDEX idx_battle_sessions_player_id ON battle_sessions(player_id);
CREATE INDEX idx_battle_sessions_status ON battle_sessions(status);
CREATE INDEX idx_battle_logs_battle_id ON battle_logs(battle_id);
CREATE INDEX idx_battle_logs_turn_number ON battle_logs(battle_id, turn_number);