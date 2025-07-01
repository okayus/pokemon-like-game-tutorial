-- シンプルなポケモン管理システムの基本データ投入
-- 初学者向け：学習用として最低限のポケモンデータを用意

-- 基本的なポケモンマスタデータの投入
INSERT INTO pokemon_master (species_id, name, hp, attack, defense, sprite_url) VALUES
-- 御三家ポケモン（シンプル版）
(1, 'フシギダネ', 45, 49, 49, '/sprites/bulbasaur.png'),
(4, 'ヒトカゲ', 39, 52, 43, '/sprites/charmander.png'), 
(7, 'ゼニガメ', 44, 48, 65, '/sprites/squirtle.png'),

-- 人気ポケモン
(25, 'ピカチュウ', 35, 55, 40, '/sprites/pikachu.png'),

-- その他の基本ポケモン
(19, 'コラッタ', 30, 56, 35, '/sprites/rattata.png'),
(16, 'ポッポ', 40, 45, 40, '/sprites/pidgey.png');

-- 注意：スプライト画像のURLは実際のファイルパスに合わせて変更してください