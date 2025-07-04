// 初学者向け：Drizzle ORM対応のモックアダプター
// テスト環境で型安全なクエリ操作を提供

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { DrizzleAdapter } from './drizzleAdapter';
import * as schema from '../db/schema';

/**
 * Drizzle対応のモックアダプター
 * メモリ内SQLiteを使用してテスト環境を提供
 */
export class DrizzleMockAdapter extends DrizzleAdapter {
  private connection: Database.Database;

  constructor() {
    // メモリ内SQLiteデータベースを作成
    const connection = new Database(':memory:');
    super(connection);
    this.connection = connection;
    
    // 初期データのセットアップ
    this.setupInitialData();
  }

  /**
   * データベース接続を閉じる
   */
  close(): void {
    this.connection.close();
  }

  /**
   * テスト用の初期データをセットアップ
   */
  private setupInitialData(): void {
    // まずテーブルを作成（マイグレーションSQLを実行）
    this.createTables();
    
    // 初期データを投入
    this.insertInitialData();
  }

  /**
   * テーブル作成（マイグレーションSQLを使用）
   */
  private createTables(): void {
    // プレイヤーテーブル
    this.connection.exec(`
      CREATE TABLE players (
        id text PRIMARY KEY NOT NULL,
        name text NOT NULL,
        position_x integer DEFAULT 10 NOT NULL,
        position_y integer DEFAULT 7 NOT NULL,
        direction text DEFAULT 'down' NOT NULL,
        sprite text DEFAULT 'player.png' NOT NULL,
        created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // プレイヤー所持金テーブル
    this.connection.exec(`
      CREATE TABLE player_money (
        player_id text PRIMARY KEY NOT NULL,
        amount integer DEFAULT 0 NOT NULL,
        updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (player_id) REFERENCES players(id)
      )
    `);

    // プレイヤーインベントリテーブル
    this.connection.exec(`
      CREATE TABLE player_inventory (
        player_id text NOT NULL,
        item_id integer NOT NULL,
        quantity integer DEFAULT 1 NOT NULL,
        acquired_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (player_id) REFERENCES players(id)
      )
    `);

    // アイテムマスターテーブル
    this.connection.exec(`
      CREATE TABLE item_master (
        item_id integer PRIMARY KEY NOT NULL,
        name text NOT NULL,
        category text NOT NULL,
        effect_type text NOT NULL,
        effect_value integer DEFAULT 0 NOT NULL,
        buy_price integer DEFAULT 0 NOT NULL,
        sell_price integer DEFAULT 0 NOT NULL,
        usable integer DEFAULT 1 NOT NULL,
        max_stack integer DEFAULT 99 NOT NULL,
        description text NOT NULL,
        icon_url text,
        created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // ポケモンマスターテーブル
    this.connection.exec(`
      CREATE TABLE pokemon_master (
        species_id integer PRIMARY KEY NOT NULL,
        name text NOT NULL,
        hp integer NOT NULL,
        attack integer NOT NULL,
        defense integer NOT NULL,
        sprite_url text NOT NULL,
        created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // 所有ポケモンテーブル
    this.connection.exec(`
      CREATE TABLE owned_pokemon (
        pokemon_id text PRIMARY KEY NOT NULL,
        player_id text NOT NULL,
        species_id integer NOT NULL,
        nickname text,
        level integer DEFAULT 1 NOT NULL,
        current_hp integer NOT NULL,
        caught_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (player_id) REFERENCES players(id),
        FOREIGN KEY (species_id) REFERENCES pokemon_master(species_id)
      )
    `);

    // プレイヤーパーティテーブル
    this.connection.exec(`
      CREATE TABLE player_party (
        player_id text NOT NULL,
        position integer NOT NULL,
        pokemon_id text NOT NULL,
        PRIMARY KEY(player_id, position),
        FOREIGN KEY (player_id) REFERENCES players(id),
        FOREIGN KEY (pokemon_id) REFERENCES owned_pokemon(pokemon_id)
      )
    `);

    // 旧システム互換テーブル
    this.connection.exec(`
      CREATE TABLE pokemon_species (
        id integer PRIMARY KEY NOT NULL,
        name text NOT NULL,
        hp integer NOT NULL,
        attack integer NOT NULL,
        defense integer NOT NULL,
        speed integer NOT NULL,
        type1 text NOT NULL,
        type2 text,
        sprite text NOT NULL
      )
    `);

    // インデックス作成
    this.connection.exec(`CREATE INDEX idx_item_category ON item_master (category)`);
    this.connection.exec(`CREATE INDEX idx_owned_pokemon_player ON owned_pokemon (player_id)`);
  }

  /**
   * 初期データを投入
   */
  private insertInitialData(): void {
    // アイテムマスターデータ
    const itemMasterData = [
      {
        itemId: 1,
        name: 'きずぐすり',
        category: '回復',
        effectType: 'HP回復',
        effectValue: 20,
        buyPrice: 300,
        sellPrice: 150,
        usable: 1,
        maxStack: 99,
        description: 'ポケモンのHPを20回復する基本的な薬',
        iconUrl: '/icons/items/potion.png'
      },
      {
        itemId: 2,
        name: 'いいきずぐすり',
        category: '回復',
        effectType: 'HP回復',
        effectValue: 50,
        buyPrice: 700,
        sellPrice: 350,
        usable: 1,
        maxStack: 99,
        description: 'ポケモンのHPを50回復する',
        iconUrl: '/icons/items/super_potion.png'
      },
      {
        itemId: 11,
        name: 'モンスターボール',
        category: 'ボール',
        effectType: 'ポケモン捕獲',
        effectValue: 1,
        buyPrice: 200,
        sellPrice: 100,
        usable: 1,
        maxStack: 999,
        description: 'ポケモンを捕まえるためのボール',
        iconUrl: '/icons/items/pokeball.png'
      }
    ];

    for (const item of itemMasterData) {
      this.db.insert(schema.itemMasterTable).values(item).run();
    }

    // ポケモンマスターデータ
    const pokemonMasterData = [
      {
        speciesId: 1,
        name: 'フシギダネ',
        hp: 45,
        attack: 49,
        defense: 49,
        spriteUrl: '/sprites/bulbasaur.png'
      },
      {
        speciesId: 4,
        name: 'ヒトカゲ',
        hp: 39,
        attack: 52,
        defense: 43,
        spriteUrl: '/sprites/charmander.png'
      },
      {
        speciesId: 7,
        name: 'ゼニガメ',
        hp: 44,
        attack: 48,
        defense: 65,
        spriteUrl: '/sprites/squirtle.png'
      },
      {
        speciesId: 25,
        name: 'ピカチュウ',
        hp: 35,
        attack: 55,
        defense: 40,
        spriteUrl: '/sprites/pikachu.png'
      },
      {
        speciesId: 150,
        name: 'ミュウツー',
        hp: 106,
        attack: 110,
        defense: 90,
        spriteUrl: '/sprites/mewtwo.png'
      }
    ];

    for (const pokemon of pokemonMasterData) {
      this.db.insert(schema.pokemonMasterTable).values(pokemon).run();
    }

    // 旧システム互換データ
    const pokemonSpeciesData = [
      {
        id: 1,
        name: 'フシギダネ',
        hp: 45,
        attack: 49,
        defense: 49,
        speed: 45,
        type1: 'くさ',
        type2: 'どく',
        sprite: 'bulbasaur.png'
      },
      {
        id: 4,
        name: 'ヒトカゲ',
        hp: 39,
        attack: 52,
        defense: 43,
        speed: 65,
        type1: 'ほのお',
        type2: null,
        sprite: 'charmander.png'
      },
      {
        id: 7,
        name: 'ゼニガメ',
        hp: 44,
        attack: 48,
        defense: 65,
        speed: 43,
        type1: 'みず',
        type2: null,
        sprite: 'squirtle.png'
      },
      {
        id: 25,
        name: 'ピカチュウ',
        hp: 35,
        attack: 55,
        defense: 40,
        speed: 90,
        type1: 'でんき',
        type2: null,
        sprite: 'pikachu.png'
      },
      {
        id: 150,
        name: 'ミュウツー',
        hp: 106,
        attack: 110,
        defense: 90,
        speed: 130,
        type1: 'エスパー',
        type2: null,
        sprite: 'mewtwo.png'
      }
    ];

    for (const species of pokemonSpeciesData) {
      this.db.insert(schema.pokemonSpeciesTable).values(species).run();
    }

    console.log('✅ Drizzle Mock Adapter: 初期データセットアップ完了');
  }
}