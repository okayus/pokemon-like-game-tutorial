-- 初学者向け：アイテムマスターデータの投入
-- 基本的なアイテムを定義してゲームで使用できるようにする

-- 回復アイテム
-- 初学者向け：ポケモンのHPを回復するアイテム
INSERT OR REPLACE INTO item_master (
    item_id, name, description, category, buy_price, sell_price, 
    usable, effect_type, effect_value, icon_url
) VALUES 
    -- きずぐすり系
    (1, 'きずぐすり', 'ポケモンのHPを20回復する基本的な薬', '回復', 300, 150, 
     1, 'HP回復', 20, '/icons/items/potion.png'),
    
    (2, 'いいきずぐすり', 'ポケモンのHPを50回復する効果の高い薬', '回復', 700, 350, 
     1, 'HP回復', 50, '/icons/items/super_potion.png'),
    
    (3, 'すごいきずぐすり', 'ポケモンのHPを200回復する非常に効果の高い薬', '回復', 1200, 600, 
     1, 'HP回復', 200, '/icons/items/hyper_potion.png'),
    
    (4, 'まんたんのくすり', 'ポケモンのHPを完全に回復する最高級の薬', '回復', 2500, 1250, 
     1, 'HP回復', 9999, '/icons/items/max_potion.png'),
    
    -- 状態異常回復
    (5, 'どくけし', '毒状態を回復する薬', '回復', 100, 50, 
     1, '状態異常回復', 1, '/icons/items/antidote.png'),
    
    (6, 'ねむけざまし', '眠り状態を回復する薬', '回復', 250, 125, 
     1, '状態異常回復', 2, '/icons/items/awakening.png'),
    
    (7, 'まひなおし', 'まひ状態を回復する薬', '回復', 200, 100, 
     1, '状態異常回復', 3, '/icons/items/parlyz_heal.png');

-- モンスターボール系
-- 初学者向け：ポケモンを捕獲するためのアイテム
INSERT OR REPLACE INTO item_master (
    item_id, name, description, category, buy_price, sell_price, 
    usable, effect_type, effect_value, icon_url
) VALUES 
    (11, 'モンスターボール', '野生のポケモンを捕まえるための基本的なボール', 'ボール', 200, 100, 
     1, '捕獲', 1, '/icons/items/poke_ball.png'),
    
    (12, 'スーパーボール', 'モンスターボールより捕獲率の高いボール', 'ボール', 600, 300, 
     1, '捕獲', 2, '/icons/items/great_ball.png'),
    
    (13, 'ハイパーボール', '非常に高い捕獲率を誇る高性能なボール', 'ボール', 1200, 600, 
     1, '捕獲', 3, '/icons/items/ultra_ball.png'),
    
    (14, 'マスターボール', 'どんなポケモンも確実に捕獲できる最高のボール', 'ボール', 0, 0, 
     1, '捕獲', 255, '/icons/items/master_ball.png');

-- 戦闘強化アイテム
-- 初学者向け：バトル中にポケモンの能力を上げるアイテム
INSERT OR REPLACE INTO item_master (
    item_id, name, description, category, buy_price, sell_price, 
    usable, effect_type, effect_value, icon_url
) VALUES 
    (21, 'プラスパワー', 'ポケモンの攻撃力を一時的に上げる', '戦闘', 500, 250, 
     1, '能力上昇', 1, '/icons/items/x_attack.png'),
    
    (22, 'ディフェンダー', 'ポケモンの防御力を一時的に上げる', '戦闘', 550, 275, 
     1, '能力上昇', 2, '/icons/items/x_defend.png'),
    
    (23, 'スピーダー', 'ポケモンの素早さを一時的に上げる', '戦闘', 350, 175, 
     1, '能力上昇', 3, '/icons/items/x_speed.png'),
    
    (24, 'ヨクアタール', 'ポケモンの命中率を一時的に上げる', '戦闘', 950, 475, 
     1, '能力上昇', 4, '/icons/items/x_accuracy.png');

-- 大切なもの
-- 初学者向け：ストーリー進行に関わる重要なアイテム
INSERT OR REPLACE INTO item_master (
    item_id, name, description, category, buy_price, sell_price, 
    usable, effect_type, effect_value, icon_url, max_stack
) VALUES 
    (31, 'ずかん', 'ポケモンの情報を記録する図鑑', '大切なもの', 0, 0, 
     0, 'イベント', 0, '/icons/items/pokedex.png', 1),
    
    (32, 'つりざお', '水辺でポケモンを釣るための道具', '大切なもの', 0, 0, 
     1, 'イベント', 1, '/icons/items/old_rod.png', 1),
    
    (33, 'じてんしゃ', '素早く移動できる自転車', '大切なもの', 0, 0, 
     1, 'イベント', 2, '/icons/items/bicycle.png', 1),
    
    (34, 'なみのり', '水上を移動できるようになる秘伝マシン', '大切なもの', 0, 0, 
     1, 'イベント', 3, '/icons/items/hm_surf.png', 1);

-- その他のアイテム
-- 初学者向け：上記カテゴリに含まれない雑多なアイテム
INSERT OR REPLACE INTO item_master (
    item_id, name, description, category, buy_price, sell_price, 
    usable, effect_type, effect_value, icon_url
) VALUES 
    (41, 'しんじゅ', '美しい真珠。売るとお金になる', 'その他', 0, 1400, 
     0, 'なし', 0, '/icons/items/pearl.png'),
    
    (42, 'おおきなしんじゅ', '大きくて美しい真珠。高く売れる', 'その他', 0, 7500, 
     0, 'なし', 0, '/icons/items/big_pearl.png'),
    
    (43, 'きんのたま', '純金でできた美しい玉。非常に高く売れる', 'その他', 0, 10000, 
     0, 'なし', 0, '/icons/items/nugget.png'),
    
    (44, 'すずのタマ', '古い鈴。コレクター向けのアイテム', 'その他', 0, 200, 
     0, 'なし', 0, '/icons/items/tiny_mushroom.png');

-- 初期プレイヤーの所持金設定
-- 初学者向け：ゲーム開始時に適度な所持金を与える
INSERT OR REPLACE INTO player_money (player_id, amount) VALUES 
    ('test-player-001', 3000),
    ('test-player-002', 5000),
    ('test-player-003', 1000);

-- 初期アイテム配布（テスト用）
-- 初学者向け：動作確認のため、テストプレイヤーに基本アイテムを配布
INSERT OR REPLACE INTO player_inventory (player_id, item_id, quantity) VALUES 
    -- test-player-001の初期アイテム
    ('test-player-001', 1, 5),    -- きずぐすり × 5
    ('test-player-001', 11, 10),  -- モンスターボール × 10
    ('test-player-001', 5, 3),    -- どくけし × 3
    ('test-player-001', 31, 1),   -- ずかん × 1
    
    -- test-player-002の初期アイテム
    ('test-player-002', 2, 3),    -- いいきずぐすり × 3
    ('test-player-002', 12, 5),   -- スーパーボール × 5
    ('test-player-002', 21, 2),   -- プラスパワー × 2
    
    -- test-player-003の初期アイテム（初心者用）
    ('test-player-003', 1, 2),    -- きずぐすり × 2
    ('test-player-003', 11, 5),   -- モンスターボール × 5
    ('test-player-003', 31, 1);   -- ずかん × 1