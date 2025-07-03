// 初学者向け：テスト用の環境変数モック（新システム対応版）
// Cloudflare WorkersのBindingsをテスト環境で模擬

import { getTestDatabase } from './dbSetup';
import { SimplifiedMockAdapter } from '../adapters/simplifiedMockAdapter';
import type { Env } from '../types/database';
import type { D1Database } from '@cloudflare/workers-types';
import type { Context } from 'hono';

// 旧システム互換用のモックD1Databaseクラス
// 新しいSimplifiedMockAdapterをラップして既存のAPIを提供
export class MockD1Database {
  private adapter: SimplifiedMockAdapter;

  constructor() {
    this.adapter = new SimplifiedMockAdapter();
  }

  prepare(sql: string) {
    const stmt = this.adapter.prepare(sql);
    return {
      bind: (...params: unknown[]) => {
        const boundStmt = stmt.bind(...params);
        return {
          all: async () => boundStmt.all(),
          first: async () => boundStmt.first(),
          run: async () => boundStmt.run(),
        };
      },
      all: async () => stmt.all(),
      first: async () => stmt.first(),
      run: async () => stmt.run(),
    };
  }

  async exec(sql: string) {
    return await this.adapter.exec(sql);
  }

  async batch(statements: unknown[]) {
    return await this.adapter.batch(statements);
  }
}

/**
 * モック環境変数の作成
 * 初学者向け：テスト用のCloudflare Workers環境を模擬
 */
export function createMockEnv(overrides: Record<string, unknown> = {}): Env {
  return {
    // 基本的な環境変数
    ENVIRONMENT: 'test',
    
    // D1データベースのモック
    DB: new MockD1Database() as unknown as D1Database,
    
    // その他の設定
    ...overrides,
  } as Env;
}

/**
 * Honoアプリケーションにモック環境を注入
 * 初学者向け：テスト用のミドルウェアとして環境を設定
 */
export function injectMockEnv(app: { use: (path: string, handler: (c: Context, next: () => Promise<void>) => Promise<void>) => void }, envOverrides: Record<string, unknown> = {}) {
  app.use('*', async (c: Context, next: () => Promise<void>) => {
    const mockEnv = createMockEnv(envOverrides);
    
    // 新しいデータベースシステムからのDB取得
    try {
      const testDb = getTestDatabase();
      mockEnv.DB = testDb as unknown as D1Database;
    } catch {
      // フォールバック：既存のMockD1Databaseを使用
      console.log('📝 新システムDB使用不可、MockD1Databaseにフォールバック');
    }
    
    // 環境変数をコンテキストに設定
    c.set('env', mockEnv);
    c.env = mockEnv;
    
    await next();
  });
}

/**
 * テスト用のプレイヤーデータ作成ヘルパー
 * 初学者向け：テストで使用する基本的なプレイヤーデータを生成
 */
export function createTestPlayer(
  playerId: string = 'test-player-123',
  customData: Record<string, unknown> = {}
) {
  return {
    id: playerId,
    name: 'テストプレイヤー',
    position_x: 10,
    position_y: 7,
    direction: 'down',
    sprite: 'player.png',
    level: 5,
    experience: 0,
    money: 1000,
    ...customData,
  };
}

/**
 * テスト用のポケモンデータ作成ヘルパー
 * 初学者向け：テストで使用する基本的なポケモンデータを生成
 */
export function createTestPokemon(
  speciesId: number = 25, // ピカチュウ
  customData: Record<string, unknown> = {}
) {
  return {
    id: `pokemon-${Date.now()}`,
    species_id: speciesId,
    nickname: speciesId === 25 ? 'ピカチュウ' : 'テストポケモン',
    level: 5,
    experience: 0,
    hp: 20,
    max_hp: 20,
    attack: 10,
    defense: 8,
    speed: 12,
    caught_at: new Date().toISOString(),
    location: 'はじまりの町',
    ...customData,
  };
}

/**
 * テスト用のアイテムデータ作成ヘルパー
 * 初学者向け：テストで使用する基本的なアイテムデータを生成
 */
export function createTestItem(
  itemId: number = 1, // きずぐすり
  quantity: number = 5
) {
  return {
    item_id: itemId,
    name: itemId === 1 ? 'きずぐすり' : 'テストアイテム',
    quantity,
    category: '回復',
    effect_type: 'HP回復',
    effect_value: 20,
    buy_price: 300,
    sell_price: 150,
    usable: true,
    max_stack: 99,
    description: 'テスト用のアイテム',
    icon_url: '/icons/items/test.png',
  };
}

// 後方互換性のためのエクスポート
export { createMockEnv as mockEnv };