-- 初学者向け：技マスターデータの投入
-- ゲーム内で使用可能な技の基本データ

-- 既存データのクリア（開発時のみ）
DELETE FROM move_master;

-- ノーマルタイプの技
INSERT INTO move_master (move_id, name, type, power, accuracy, pp, category, description) VALUES
(1, 'たいあたり', 'ノーマル', 40, 100, 35, '物理', '全身で相手にぶつかって攻撃する。'),
(2, 'ひっかく', 'ノーマル', 40, 100, 35, '物理', 'するどいツメで相手をひっかいて攻撃する。'),
(3, 'かみつく', 'ノーマル', 60, 100, 25, '物理', 'するどい歯で相手をかみついて攻撃する。');

-- でんきタイプの技
INSERT INTO move_master (move_id, name, type, power, accuracy, pp, category, description) VALUES
(4, 'でんきショック', 'でんき', 40, 100, 30, '特殊', '電気の刺激で相手を攻撃する。まひ状態にすることがある。'),
(5, '10まんボルト', 'でんき', 90, 100, 15, '特殊', '強い電撃で相手を攻撃する。まひ状態にすることがある。');

-- みずタイプの技
INSERT INTO move_master (move_id, name, type, power, accuracy, pp, category, description) VALUES
(6, 'みずでっぽう', 'みず', 40, 100, 25, '特殊', '水を勢いよく相手にかけて攻撃する。'),
(7, 'バブルこうせん', 'みず', 65, 100, 20, '特殊', '泡を勢いよく相手に発射して攻撃する。');

-- ひこうタイプの技
INSERT INTO move_master (move_id, name, type, power, accuracy, pp, category, description) VALUES
(8, 'つつく', 'ひこう', 35, 100, 35, '物理', 'くちばしで相手をついて攻撃する。'),
(9, 'かぜおこし', 'ひこう', 40, 100, 35, '特殊', '翼で風を起こして相手を攻撃する。');

-- くさタイプの技
INSERT INTO move_master (move_id, name, type, power, accuracy, pp, category, description) VALUES
(10, 'つるのムチ', 'くさ', 45, 100, 25, '物理', 'つるのようなもので相手をたたいて攻撃する。'),
(11, 'はっぱカッター', 'くさ', 55, 95, 25, '物理', 'はっぱを飛ばして相手を切りつけて攻撃する。');

-- ほのおタイプの技
INSERT INTO move_master (move_id, name, type, power, accuracy, pp, category, description) VALUES
(12, 'ひのこ', 'ほのお', 40, 100, 25, '特殊', '小さな炎で相手を攻撃する。やけど状態にすることがある。'),
(13, 'かえんほうしゃ', 'ほのお', 90, 100, 15, '特殊', '激しい炎で相手を攻撃する。やけど状態にすることがある。');

-- 変化技（補助技）
INSERT INTO move_master (move_id, name, type, power, accuracy, pp, category, description) VALUES
(14, 'かたくなる', 'ノーマル', 0, 100, 30, '変化', '全身の力をぬいて体をかたくし、防御力をあげる。'),
(15, 'でんこうせっか', 'ノーマル', 40, 100, 30, '物理', '目にも留まらぬ素早さで相手に突進する。必ず先制攻撃できる。');

-- テストデータ：プレイヤーのポケモンに技を覚えさせる
-- 注：実際のゲームではポケモン作成時や技習得イベント時に追加される
-- ここでは開発テスト用のサンプルデータ

-- ピカチュウ（仮ID: test-pikachu-001）の技セット
-- INSERT INTO pokemon_moves (pokemon_id, move_id, current_pp) VALUES
-- ('test-pikachu-001', 4, 30),  -- でんきショック
-- ('test-pikachu-001', 5, 15),  -- 10まんボルト
-- ('test-pikachu-001', 15, 30), -- でんこうせっか
-- ('test-pikachu-001', 1, 35);  -- たいあたり