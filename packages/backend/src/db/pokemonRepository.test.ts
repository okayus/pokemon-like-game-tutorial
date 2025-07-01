// 初学者向け：ポケモンリポジトリのテストコード
// TDDアプローチとして、実装前にテストを書きます

import { expect, test, describe, beforeEach } from 'vitest';
import { ポケモンリポジトリ } from './pokemonRepository';
import type { ポケモン捕獲リクエスト, 所有ポケモン, ポケモン種族データ, パーティ編成リクエスト } from '@共通/types/pokemon';

/**
 * ポケモンリポジトリのテストスイート
 * 初学者向け：TDDの練習として、全ての機能をテストから書き始めます
 */
describe('ポケモンリポジトリ', () => {
  let リポジトリ: ポケモンリポジトリ;
  const テストプレイヤーID = 'test-player-123';

  beforeEach(() => {
    // 初学者向け：各テスト前にリポジトリを初期化
    // 実際の実装では、テスト用のデータベース接続を使用します
    リポジトリ = new ポケモンリポジトリ();
  });

  describe('ポケモン種族データ取得', () => {
    test('全ての種族データを取得できる', async () => {
      // 初学者向け：種族データの一覧取得テスト
      const 種族リスト = await リポジトリ.全種族データ取得();
      
      expect(種族リスト).toBeDefined();
      expect(Array.isArray(種族リスト)).toBe(true);
      expect(種族リスト.length).toBeGreaterThan(0);
      
      // 基本的なポケモンが含まれているか確認
      const ピカチュウ = 種族リスト.find(species => species.name === 'ピカチュウ');
      expect(ピカチュウ).toBeDefined();
      expect(ピカチュウ?.type1).toBe('でんき');
    });

    test('特定の種族データを取得できる', async () => {
      // 初学者向け：IDを指定した種族データ取得テスト
      const 種族ID = 25; // ピカチュウ
      const ピカチュウ = await リポジトリ.種族データ取得(種族ID);
      
      expect(ピカチュウ).toBeDefined();
      expect(ピカチュウ?.species_id).toBe(種族ID);
      expect(ピカチュウ?.name).toBe('ピカチュウ');
      expect(ピカチュウ?.type1).toBe('でんき');
    });

    test('存在しない種族IDでnullが返される', async () => {
      // 初学者向け：エラーハンドリングのテスト
      const 存在しない種族ID = 9999;
      const 結果 = await リポジトリ.種族データ取得(存在しない種族ID);
      
      expect(結果).toBeNull();
    });
  });

  describe('ポケモン捕獲', () => {
    test('新しいポケモンを捕獲できる', async () => {
      // 初学者向け：ポケモン捕獲機能のテスト
      const 捕獲リクエスト: ポケモン捕獲リクエスト = {
        species_id: 25, // ピカチュウ
        level: 5,
        nickname: 'でんきくん'
      };

      const 捕獲されたポケモン = await リポジトリ.ポケモン捕獲(テストプレイヤーID, 捕獲リクエスト);
      
      expect(捕獲されたポケモン).toBeDefined();
      expect(捕獲されたポケモン.player_id).toBe(テストプレイヤーID);
      expect(捕獲されたポケモン.species_id).toBe(25);
      expect(捕獲されたポケモン.level).toBe(5);
      expect(捕獲されたポケモン.nickname).toBe('でんきくん');
      expect(捕獲されたポケモン.pokemon_id).toBeDefined();
      
      // 個体値が正しい範囲内にあるか確認
      expect(捕獲されたポケモン.individual_values.iv_hp).toBeGreaterThanOrEqual(0);
      expect(捕獲されたポケモン.individual_values.iv_hp).toBeLessThanOrEqual(31);
    });

    test('レベル1でもポケモンを捕獲できる', async () => {
      // 初学者向け：境界値テスト
      const 捕獲リクエスト: ポケモン捕獲リクエスト = {
        species_id: 1, // フシギダネ
        level: 1
      };

      const 捕獲されたポケモン = await リポジトリ.ポケモン捕獲(テストプレイヤーID, 捕獲リクエスト);
      
      expect(捕獲されたポケモン.level).toBe(1);
      expect(捕獲されたポケモン.experience).toBe(0);
    });

    test('存在しない種族IDで捕獲しようとするとエラー', async () => {
      // 初学者向け：エラーケースのテスト
      const 不正な捕獲リクエスト: ポケモン捕獲リクエスト = {
        species_id: 9999, // 存在しない種族ID
        level: 5
      };

      await expect(リポジトリ.ポケモン捕獲(テストプレイヤーID, 不正な捕獲リクエスト))
        .rejects.toThrow('指定された種族が見つかりません');
    });
  });

  describe('所有ポケモン管理', () => {
    test('プレイヤーの所有ポケモン一覧を取得できる', async () => {
      // 初学者向け：まず捕獲してから一覧取得をテスト
      const 捕獲リクエスト: ポケモン捕獲リクエスト = {
        species_id: 25,
        level: 10
      };
      
      await リポジトリ.ポケモン捕獲(テストプレイヤーID, 捕獲リクエスト);
      
      const 所有ポケモンリスト = await リポジトリ.所有ポケモン一覧取得(テストプレイヤーID);
      
      expect(所有ポケモンリスト).toBeDefined();
      expect(Array.isArray(所有ポケモンリスト)).toBe(true);
      expect(所有ポケモンリスト.length).toBeGreaterThan(0);
      
      const 最初のポケモン = 所有ポケモンリスト[0];
      expect(最初のポケモン.player_id).toBe(テストプレイヤーID);
      expect(最初のポケモン.species).toBeDefined();
      expect(最初のポケモン.stats).toBeDefined();
    });

    test('特定のポケモンの詳細を取得できる', async () => {
      // 初学者向け：捕獲→詳細取得の流れをテスト
      const 捕獲リクエスト: ポケモン捕獲リクエスト = {
        species_id: 4, // ヒトカゲ
        level: 15,
        nickname: 'ファイヤー'
      };
      
      const 捕獲されたポケモン = await リポジトリ.ポケモン捕獲(テストプレイヤーID, 捕獲リクエスト);
      const ポケモン詳細 = await リポジトリ.ポケモン詳細取得(捕獲されたポケモン.pokemon_id);
      
      expect(ポケモン詳細).toBeDefined();
      expect(ポケモン詳細?.pokemon_id).toBe(捕獲されたポケモン.pokemon_id);
      expect(ポケモン詳細?.nickname).toBe('ファイヤー');
      expect(ポケモン詳細?.moves).toBeDefined();
      expect(Array.isArray(ポケモン詳細?.moves)).toBe(true);
    });
  });

  describe('パーティ管理', () => {
    test('パーティを取得できる', async () => {
      // 初学者向け：空のパーティから開始
      const パーティ = await リポジトリ.パーティ取得(テストプレイヤーID);
      
      expect(パーティ).toBeDefined();
      expect(Array.isArray(パーティ)).toBe(true);
      expect(パーティ.length).toBeLessThanOrEqual(6); // 最大6体
    });

    test('パーティにポケモンを追加できる', async () => {
      // 初学者向け：捕獲→パーティ追加の流れをテスト
      const 捕獲リクエスト: ポケモン捕獲リクエスト = {
        species_id: 7, // ゼニガメ
        level: 8
      };
      
      const 捕獲されたポケモン = await リポジトリ.ポケモン捕獲(テストプレイヤーID, 捕獲リクエスト);
      
      const パーティ編成リクエスト: パーティ編成リクエスト = {
        position: 1,
        pokemon_id: 捕獲されたポケモン.pokemon_id
      };
      
      await リポジトリ.パーティ編成(テストプレイヤーID, パーティ編成リクエスト);
      
      const パーティ = await リポジトリ.パーティ取得(テストプレイヤーID);
      expect(パーティ.length).toBe(1);
      expect(パーティ[0].position).toBe(1);
      expect(パーティ[0].pokemon_id).toBe(捕獲されたポケモン.pokemon_id);
    });

    test('パーティから特定位置のポケモンを削除できる', async () => {
      // 初学者向け：追加→削除の流れをテスト
      const 捕獲リクエスト: ポケモン捕獲リクエスト = {
        species_id: 1, // フシギダネ
        level: 12
      };
      
      const 捕獲されたポケモン = await リポジトリ.ポケモン捕獲(テストプレイヤーID, 捕獲リクエスト);
      
      // まずパーティに追加
      await リポジトリ.パーティ編成(テストプレイヤーID, {
        position: 2,
        pokemon_id: 捕獲されたポケモン.pokemon_id
      });
      
      // 削除リクエスト
      await リポジトリ.パーティ編成(テストプレイヤーID, {
        position: 2,
        pokemon_id: undefined // undefinedで削除
      });
      
      const パーティ = await リポジトリ.パーティ取得(テストプレイヤーID);
      const position2のポケモン = パーティ.find(p => p.position === 2);
      expect(position2のポケモン).toBeUndefined();
    });
  });

  describe('ボックス管理', () => {
    test('プレイヤーのボックス一覧を取得できる', async () => {
      // 初学者向け：デフォルトボックスの確認
      const ボックス一覧 = await リポジトリ.ボックス一覧取得(テストプレイヤーID);
      
      expect(ボックス一覧).toBeDefined();
      expect(Array.isArray(ボックス一覧)).toBe(true);
      expect(ボックス一覧.length).toBe(8); // デフォルト8個
      
      const ボックス1 = ボックス一覧.find(box => box.box_number === 1);
      expect(ボックス1).toBeDefined();
      expect(ボックス1?.name).toBe('ボックス1');
    });

    test('特定ボックス内のポケモンを取得できる', async () => {
      // 初学者向け：ボックス内ポケモン検索のテスト
      const ボックス一覧 = await リポジトリ.ボックス一覧取得(テストプレイヤーID);
      const 最初のボックス = ボックス一覧[0];
      
      const ボックス内ポケモン = await リポジトリ.ボックス内ポケモン取得(最初のボックス.box_id);
      
      expect(ボックス内ポケモン).toBeDefined();
      expect(Array.isArray(ボックス内ポケモン)).toBe(true);
      // 新しいプレイヤーの場合は空のはず
      expect(ボックス内ポケモン.length).toBe(0);
    });
  });

  describe('経験値とレベルアップ', () => {
    test('経験値を獲得してレベルアップする', async () => {
      // 初学者向け：レベルアップシステムのテスト
      const 捕獲リクエスト: ポケモン捕獲リクエスト = {
        species_id: 25, // ピカチュウ
        level: 4 // レベル5になるための経験値テスト用
      };
      
      const ポケモン = await リポジトリ.ポケモン捕獲(テストプレイヤーID, 捕獲リクエスト);
      const 初期レベル = ポケモン.level;
      
      // 十分な経験値を与えてレベルアップさせる
      const 更新されたポケモン = await リポジトリ.経験値獲得(ポケモン.pokemon_id, 1000);
      
      expect(更新されたポケモン.level).toBeGreaterThan(初期レベル);
      expect(更新されたポケモン.experience).toBeGreaterThan(ポケモン.experience);
    });
  });

  describe('技システム', () => {
    test('ポケモンの習得可能技を取得できる', async () => {
      // 初学者向け：技習得システムのテスト
      const 種族ID = 25; // ピカチュウ
      const レベル = 10;
      
      const 習得可能技 = await リポジトリ.習得可能技取得(種族ID, レベル);
      
      expect(習得可能技).toBeDefined();
      expect(Array.isArray(習得可能技)).toBe(true);
      expect(習得可能技.length).toBeGreaterThan(0);
      
      // でんきショックが含まれているか確認
      const でんきショック = 習得可能技.find(move => move.name === 'でんきショック');
      expect(でんきショック).toBeDefined();
    });

    test('ポケモンに新しい技を覚えさせることができる', async () => {
      // 初学者向け：技習得機能のテスト
      const 捕獲リクエスト: ポケモン捕獲リクエスト = {
        species_id: 25, // ピカチュウ
        level: 15
      };
      
      const ポケモン = await リポジトリ.ポケモン捕獲(テストプレイヤーID, 捕獲リクエスト);
      
      // 10まんボルトを覚えさせる（技ID: 5）
      await リポジトリ.技習得(ポケモン.pokemon_id, 5, 2); // スロット2に
      
      const 更新されたポケモン = await リポジトリ.ポケモン詳細取得(ポケモン.pokemon_id);
      const 習得した技 = 更新されたポケモン?.moves.find(move => move.move_id === 5);
      
      expect(習得した技).toBeDefined();
      expect(習得した技?.slot).toBe(2);
      expect(習得した技?.move.name).toBe('10まんボルト');
    });
  });
});