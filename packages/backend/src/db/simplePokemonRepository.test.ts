// 初学者向け：シンプルなポケモンリポジトリのテストコード
// TDDアプローチとして、実装前にテストを書きます

import { expect, test, describe, beforeEach } from 'vitest';
import { シンプルポケモンリポジトリ } from './simplePokemonRepository';
import type { ポケモン捕獲リクエスト, 所有ポケモン, ポケモンマスタ, パーティ編成リクエスト } from '../../../shared/src/types/simple-pokemon';

/**
 * シンプルポケモンリポジトリのテストスイート
 * 初学者向け：TDDの練習として、全ての機能をテストから書き始めます
 */
describe('シンプルポケモンリポジトリ', () => {
  let リポジトリ: シンプルポケモンリポジトリ;
  const テストプレイヤーID = 'test-player-123';

  beforeEach(() => {
    // 初学者向け：各テスト前にリポジトリを初期化
    リポジトリ = new シンプルポケモンリポジトリ();
  });

  describe('ポケモンマスタデータ取得', () => {
    test('全てのポケモンマスタデータを取得できる', async () => {
      // 初学者向け：マスタデータの一覧取得テスト
      const マスタリスト = await リポジトリ.全マスタデータ取得();
      
      expect(マスタリスト).toBeDefined();
      expect(Array.isArray(マスタリスト)).toBe(true);
      expect(マスタリスト.length).toBeGreaterThan(0);
      
      // 基本的なポケモンが含まれているか確認
      const ピカチュウ = マスタリスト.find(pokemon => pokemon.name === 'ピカチュウ');
      expect(ピカチュウ).toBeDefined();
      expect(ピカチュウ?.hp).toBeGreaterThan(0);
    });

    test('特定のマスタデータを取得できる', async () => {
      // 初学者向け：IDを指定したマスタデータ取得テスト
      const 種族ID = 25; // ピカチュウ
      const ピカチュウ = await リポジトリ.マスタデータ取得(種族ID);
      
      expect(ピカチュウ).toBeDefined();
      expect(ピカチュウ?.species_id).toBe(種族ID);
      expect(ピカチュウ?.name).toBe('ピカチュウ');
    });

    test('存在しない種族IDでnullが返される', async () => {
      // 初学者向け：エラーハンドリングのテスト
      const 存在しない種族ID = 9999;
      const 結果 = await リポジトリ.マスタデータ取得(存在しない種族ID);
      
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
      
      // HPが正しく設定されているか確認
      expect(捕獲されたポケモン.current_hp).toBeGreaterThan(0);
      expect(捕獲されたポケモン.stats).toBeDefined();
      expect(捕獲されたポケモン.stats.max_hp).toBeGreaterThan(0);
    });

    test('レベル1でもポケモンを捕獲できる', async () => {
      // 初学者向け：境界値テスト
      const 捕獲リクエスト: ポケモン捕獲リクエスト = {
        species_id: 1, // フシギダネ
        level: 1
      };

      const 捕獲されたポケモン = await リポジトリ.ポケモン捕獲(テストプレイヤーID, 捕獲リクエスト);
      
      expect(捕獲されたポケモン.level).toBe(1);
      expect(捕獲されたポケモン.current_hp).toBeGreaterThan(0);
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
      expect(ポケモン詳細?.species).toBeDefined();
      expect(ポケモン詳細?.stats).toBeDefined();
    });

    test('ポケモンの情報を更新できる', async () => {
      // 初学者向け：ポケモン情報更新のテスト
      const 捕獲リクエスト: ポケモン捕獲リクエスト = {
        species_id: 7, // ゼニガメ
        level: 8
      };
      
      const 捕獲されたポケモン = await リポジトリ.ポケモン捕獲(テストプレイヤーID, 捕獲リクエスト);
      
      // ニックネームを更新
      await リポジトリ.ポケモン更新(捕獲されたポケモン.pokemon_id, {
        nickname: '新しい名前',
        current_hp: 20
      });
      
      const 更新されたポケモン = await リポジトリ.ポケモン詳細取得(捕獲されたポケモン.pokemon_id);
      expect(更新されたポケモン?.nickname).toBe('新しい名前');
      expect(更新されたポケモン?.current_hp).toBe(20);
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

  describe('ステータス計算', () => {
    test('レベルに応じてステータスが正しく計算される', async () => {
      // 初学者向け：ステータス計算のテスト
      const 捕獲リクエスト1: ポケモン捕獲リクエスト = {
        species_id: 25, // ピカチュウ
        level: 1
      };
      const 捕獲リクエスト2: ポケモン捕獲リクエスト = {
        species_id: 25, // ピカチュウ
        level: 50
      };
      
      const レベル1ピカチュウ = await リポジトリ.ポケモン捕獲(テストプレイヤーID, 捕獲リクエスト1);
      const レベル50ピカチュウ = await リポジトリ.ポケモン捕獲(テストプレイヤーID, 捕獲リクエスト2);
      
      // レベル50の方が高いステータスを持つはず
      expect(レベル50ピカチュウ.stats.max_hp).toBeGreaterThan(レベル1ピカチュウ.stats.max_hp);
      expect(レベル50ピカチュウ.stats.attack).toBeGreaterThan(レベル1ピカチュウ.stats.attack);
      expect(レベル50ピカチュウ.stats.defense).toBeGreaterThan(レベル1ピカチュウ.stats.defense);
    });
  });
});