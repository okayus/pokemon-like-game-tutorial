// 初学者向け：ポケモンAPIルートのテストコード
// APIエンドポイントの動作を確認するテスト

import { describe, test, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import pokemonRoutes from './pokemon';
import { injectMockEnv } from '../test-utils/mockEnv';

/**
 * ポケモンAPIルートのテストスイート
 * 初学者向け：各APIエンドポイントが正しく動作するかテスト
 */
describe('ポケモンAPIルート', () => {
  // テスト用のプレイヤーID
  const テストプレイヤーID = 'test-player-123';
  let app: Hono;

  beforeEach(() => {
    // 新しいアプリインスタンスを作成
    app = new Hono();
    app.use('*', cors());
    
    // モック環境を注入
    injectMockEnv(app);
    
    // ポケモンルートを追加
    app.route('/api/pokemon', pokemonRoutes);
  });

  describe('ポケモンマスタデータAPI', () => {
    test('GET /api/pokemon/species - 全種族データを取得できる', async () => {
      const response = await app.request('/api/pokemon/species');
      
      expect(response.status).toBe(200);
      
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.count).toBeDefined();
    });

    test('GET /api/pokemon/species/25 - 特定種族データを取得できる', async () => {
      const response = await app.request('/api/pokemon/species/25');
      
      expect(response.status).toBe(200);
      
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.data.species_id).toBe(25);
    });

    test('GET /api/pokemon/species/9999 - 存在しない種族IDで404エラー', async () => {
      const response = await app.request('/api/pokemon/species/9999');
      
      expect(response.status).toBe(404);
      
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('見つかりません');
    });

    test('GET /api/pokemon/species/invalid - 無効な種族IDで400エラー', async () => {
      const response = await app.request('/api/pokemon/species/invalid');
      
      expect(response.status).toBe(400);
      
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('無効な種族ID');
    });
  });

  describe('ポケモン捕獲API', () => {
    test('POST /api/pokemon/catch/:playerId - ポケモンを捕獲できる', async () => {
      const 捕獲データ = {
        species_id: 25, // ピカチュウ
        level: 5,
        nickname: 'でんきくん'
      };

      const response = await app.request(`/api/pokemon/catch/${テストプレイヤーID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(捕獲データ)
      });
      
      expect(response.status).toBe(201);
      
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.data.species_id).toBe(25);
      expect(json.data.level).toBe(5);
      expect(json.data.nickname).toBe('でんきくん');
      expect(json.data.pokemon_id).toBeDefined();
      expect(json.message).toContain('捕まえました');
    });

    test('POST /api/pokemon/catch/:playerId - 必須項目なしで400エラー', async () => {
      const 不正データ = {
        // species_idとlevelが不足
        nickname: 'テスト'
      };

      const response = await app.request(`/api/pokemon/catch/${テストプレイヤーID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(不正データ)
      });
      
      expect(response.status).toBe(400);
      
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('必須');
    });

    test('POST /api/pokemon/catch/:playerId - 無効なレベルで400エラー', async () => {
      const 不正データ = {
        species_id: 25,
        level: 150 // 無効なレベル
      };

      const response = await app.request(`/api/pokemon/catch/${テストプレイヤーID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(不正データ)
      });
      
      expect(response.status).toBe(400);
      
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('1〜100');
    });

    test('POST /api/pokemon/catch/:playerId - 存在しない種族IDで404エラー', async () => {
      const 不正データ = {
        species_id: 9999, // 存在しない種族ID
        level: 5
      };

      const response = await app.request(`/api/pokemon/catch/${テストプレイヤーID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(不正データ)
      });
      
      expect(response.status).toBe(404);
      
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('見つかりません');
    });
  });

  describe('所有ポケモンAPI', () => {
    let 捕獲されたポケモンID: string;

    beforeEach(async () => {
      // テスト用にポケモンを捕獲
      const 捕獲データ = {
        species_id: 1, // フシギダネ
        level: 10,
        nickname: 'テストポケモン'
      };

      const response = await app.request(`/api/pokemon/catch/${テストプレイヤーID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(捕獲データ)
      });

      const json = await response.json();
      捕獲されたポケモンID = json.data.pokemon_id;
    });

    test('GET /api/pokemon/owned/:playerId - 所有ポケモン一覧を取得できる', async () => {
      const response = await app.request(`/api/pokemon/owned/${テストプレイヤーID}`);
      
      expect(response.status).toBe(200);
      
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.count).toBeGreaterThan(0);
    });

    test('GET /api/pokemon/owned/detail/:pokemonId - ポケモン詳細を取得できる', async () => {
      const response = await app.request(`/api/pokemon/owned/detail/${捕獲されたポケモンID}`);
      
      expect(response.status).toBe(200);
      
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.data.pokemon_id).toBe(捕獲されたポケモンID);
      expect(json.data.nickname).toBe('テストポケモン');
    });

    test('GET /api/pokemon/owned/detail/invalid - 存在しないポケモンIDで404エラー', async () => {
      const response = await app.request('/api/pokemon/owned/detail/invalid-id');
      
      expect(response.status).toBe(404);
      
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('見つかりません');
    });

    test('PUT /api/pokemon/owned/:pokemonId - ポケモン情報を更新できる', async () => {
      const 更新データ = {
        nickname: '新しい名前',
        current_hp: 20
      };

      const response = await app.request(`/api/pokemon/owned/${捕獲されたポケモンID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(更新データ)
      });
      
      expect(response.status).toBe(200);
      
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.nickname).toBe('新しい名前');
      expect(json.data.current_hp).toBe(20);
      expect(json.message).toContain('更新');
    });

    test('PUT /api/pokemon/owned/:pokemonId - 無効なHPで400エラー', async () => {
      const 不正データ = {
        current_hp: -10 // 負の値
      };

      const response = await app.request(`/api/pokemon/owned/${捕獲されたポケモンID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(不正データ)
      });
      
      expect(response.status).toBe(400);
      
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('0以上');
    });
  });

  describe('パーティAPI', () => {
    let 捕獲されたポケモンID: string;

    beforeEach(async () => {
      // テスト用にポケモンを捕獲
      const 捕獲データ = {
        species_id: 7, // ゼニガメ
        level: 8
      };

      const response = await app.request(`/api/pokemon/catch/${テストプレイヤーID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(捕獲データ)
      });

      const json = await response.json();
      捕獲されたポケモンID = json.data.pokemon_id;
    });

    test('GET /api/pokemon/party/:playerId - パーティを取得できる', async () => {
      const response = await app.request(`/api/pokemon/party/${テストプレイヤーID}`);
      
      expect(response.status).toBe(200);
      
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.count).toBeDefined();
    });

    test('PUT /api/pokemon/party/:playerId - パーティにポケモンを追加できる', async () => {
      const 編成データ = {
        position: 1,
        pokemon_id: 捕獲されたポケモンID
      };

      const response = await app.request(`/api/pokemon/party/${テストプレイヤーID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(編成データ)
      });
      
      expect(response.status).toBe(200);
      
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.message).toContain('配置');
    });

    test('PUT /api/pokemon/party/:playerId - パーティからポケモンを削除できる', async () => {
      // まずパーティに追加
      await app.request(`/api/pokemon/party/${テストプレイヤーID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: 2, pokemon_id: 捕獲されたポケモンID })
      });

      // 削除
      const 削除データ = { position: 2 };

      const response = await app.request(`/api/pokemon/party/${テストプレイヤーID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(削除データ)
      });
      
      expect(response.status).toBe(200);
      
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.message).toContain('外しました');
    });

    test('PUT /api/pokemon/party/:playerId - 無効な位置で400エラー', async () => {
      const 不正データ = {
        position: 10, // 無効な位置
        pokemon_id: 捕獲されたポケモンID
      };

      const response = await app.request(`/api/pokemon/party/${テストプレイヤーID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(不正データ)
      });
      
      expect(response.status).toBe(400);
      
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('1〜6');
    });

    test('PUT /api/pokemon/party/:playerId - 存在しないポケモンIDで404エラー', async () => {
      const 不正データ = {
        position: 1,
        pokemon_id: 'invalid-pokemon-id'
      };

      const response = await app.request(`/api/pokemon/party/${テストプレイヤーID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(不正データ)
      });
      
      expect(response.status).toBe(404);
      
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('見つかりません');
    });
  });

  describe('フィルタリング機能', () => {
    test('GET /api/pokemon/owned/:playerId?species_name=ピカチュウ - 種族名でフィルタリング', async () => {
      const response = await app.request(`/api/pokemon/owned/${テストプレイヤーID}?species_name=ピカチュウ`);
      
      expect(response.status).toBe(200);
      
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.filters.species_name).toBe('ピカチュウ');
    });

    test('GET /api/pokemon/owned/:playerId?level_min=5&level_max=10 - レベル範囲でフィルタリング', async () => {
      const response = await app.request(`/api/pokemon/owned/${テストプレイヤーID}?level_min=5&level_max=10`);
      
      expect(response.status).toBe(200);
      
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.filters.level_min).toBe(5);
      expect(json.filters.level_max).toBe(10);
    });

    test('GET /api/pokemon/owned/:playerId?page=1&limit=10 - ページネーション', async () => {
      const response = await app.request(`/api/pokemon/owned/${テストプレイヤーID}?page=1&limit=10`);
      
      expect(response.status).toBe(200);
      
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.filters.page).toBe(1);
      expect(json.filters.limit).toBe(10);
    });
  });
});