// 初学者向け：シンプルで信頼性の高いモックデータベースアダプター
// 複雑なSQL解析を避け、基本的な操作のみ確実にサポート

import { DatabaseAdapter, PreparedStatement, RunResult, BatchResult, ExecResult } from '../types/database';

/**
 * 信頼性を重視したシンプルなモックアダプター
 * 複雑なSQL解析は避け、基本的なCRUD操作のみサポート
 */
export class SimplifiedMockAdapter implements DatabaseAdapter {
  private tables = new Map<string, any[]>();

  constructor() {
    this.setupInitialData();
  }

  prepare(sql: string): PreparedStatement {
    return new SimplifiedPreparedStatement(sql, this.tables);
  }

  async batch(statements: any[]): Promise<BatchResult> {
    const results: RunResult[] = [];
    
    for (const stmt of statements) {
      try {
        const result = await stmt.run();
        results.push(result);
      } catch {
        results.push({
          success: false,
          meta: { changes: 0 },
        });
      }
    }
    
    return { results };
  }

  async exec(sql: string): Promise<ExecResult> {
    const start = Date.now();
    // 基本的な CREATE TABLE 文のみサポート
    let changes = 0;
    
    if (sql.toLowerCase().includes('create table')) {
      changes = 1;
    }
    
    return {
      count: changes,
      duration: Date.now() - start,
    };
  }

  async first<T>(sql: string): Promise<T | null> {
    const stmt = this.prepare(sql);
    return await stmt.first<T>();
  }

  close?(): void {
    this.tables.clear();
  }

  private setupInitialData(): void {
    // アイテムマスターデータ
    this.tables.set('item_master', [
      {
        item_id: 1,
        name: 'きずぐすり',
        category: '回復',
        effect_type: 'HP回復',
        effect_value: 20,
        buy_price: 300,
        sell_price: 150,
        usable: 1,
        max_stack: 99,
        description: 'ポケモンのHPを20回復する基本的な薬',
        icon_url: '/icons/items/potion.png',
        created_at: '2025-07-01 10:00:00',
        updated_at: '2025-07-01 10:00:00'
      },
      {
        item_id: 2,
        name: 'いいきずぐすり',
        category: '回復',
        effect_type: 'HP回復',
        effect_value: 50,
        buy_price: 700,
        sell_price: 350,
        usable: 1,
        max_stack: 99,
        description: 'ポケモンのHPを50回復する',
        icon_url: '/icons/items/super_potion.png',
        created_at: '2025-07-01 10:00:00',
        updated_at: '2025-07-01 10:00:00'
      },
      {
        item_id: 11,
        name: 'モンスターボール',
        category: 'ボール',
        effect_type: 'ポケモン捕獲',
        effect_value: 1,
        buy_price: 200,
        sell_price: 100,
        usable: 1,
        max_stack: 999,
        description: 'ポケモンを捕まえるためのボール',
        icon_url: '/icons/items/pokeball.png',
        created_at: '2025-07-01 10:00:00',
        updated_at: '2025-07-01 10:00:00'
      }
    ]);

    // ポケモン種族データ（古いスキーマとの互換性のため）
    this.tables.set('pokemon_species', [
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
    ]);

    // ポケモンマスターデータ（新しいリポジトリ用）
    this.tables.set('pokemon_master', [
      {
        species_id: 1,
        name: 'フシギダネ',
        hp: 45,
        attack: 49,
        defense: 49,
        sprite_url: '/sprites/bulbasaur.png',
        created_at: '2025-07-01 10:00:00'
      },
      {
        species_id: 4,
        name: 'ヒトカゲ',
        hp: 39,
        attack: 52,
        defense: 43,
        sprite_url: '/sprites/charmander.png',
        created_at: '2025-07-01 10:00:00'
      },
      {
        species_id: 7,
        name: 'ゼニガメ',
        hp: 44,
        attack: 48,
        defense: 65,
        sprite_url: '/sprites/squirtle.png',
        created_at: '2025-07-01 10:00:00'
      },
      {
        species_id: 25,
        name: 'ピカチュウ',
        hp: 35,
        attack: 55,
        defense: 40,
        sprite_url: '/sprites/pikachu.png',
        created_at: '2025-07-01 10:00:00'
      },
      {
        species_id: 150,
        name: 'ミュウツー',
        hp: 106,
        attack: 110,
        defense: 90,
        sprite_url: '/sprites/mewtwo.png',
        created_at: '2025-07-01 10:00:00'
      }
    ]);

    // 空のテーブル
    this.tables.set('players', []);
    this.tables.set('player_inventory', []);
    this.tables.set('player_money', []);
    this.tables.set('owned_pokemon', []);
    this.tables.set('player_party', []);
    this.tables.set('battle_sessions', []);
    this.tables.set('_migrations', []);
  }
}

/**
 * シンプルなプリペアドステートメント実装
 * 基本的なSQL操作のみサポート
 */
class SimplifiedPreparedStatement implements PreparedStatement {
  private boundParams: unknown[] = [];

  constructor(
    private sql: string,
    private tables: Map<string, any[]>
  ) {}

  bind(...params: unknown[]): PreparedStatement {
    this.boundParams = params;
    return this;
  }

  async first<T = unknown>(): Promise<T | null> {
    const results = this.executeQuery();
    return results.length > 0 ? (results[0] as T) : null;
  }

  async all<T = unknown>(): Promise<{ results: T[] }> {
    const results = this.executeQuery();
    return { results: results as T[] };
  }

  async run(): Promise<RunResult> {
    const sql = this.sql.toLowerCase().trim();
    
    if (sql.startsWith('insert')) {
      return this.executeInsert();
    } else if (sql.startsWith('update')) {
      return this.executeUpdate();
    } else if (sql.startsWith('delete')) {
      return this.executeDelete();
    } else {
      // SELECT等は変更なし
      return {
        success: true,
        meta: { changes: 0 }
      };
    }
  }

  private executeQuery(): any[] {
    const sql = this.sql.toLowerCase().trim();
    
    // 定数クエリの処理（SELECT 1 as test など）
    if (sql.startsWith('select') && !sql.includes('from')) {
      const literalMatch = sql.match(/select\s+(\d+)\s+as\s+(\w+)/);
      if (literalMatch) {
        const value = parseInt(literalMatch[1]);
        const alias = literalMatch[2];
        return [{ [alias]: value }];
      }
      return [];
    }
    
    // COUNT クエリの処理
    if (sql.includes('count(*)')) {
      return this.handleCountQuery(sql);
    }
    
    // JOIN クエリの処理
    if (sql.includes('join')) {
      return this.handleJoinQuery(sql);
    }
    
    // 通常のSELECTクエリ
    return this.handleSimpleQuery(sql);
  }
  
  private handleCountQuery(sql: string): any[] {
    const fromMatch = sql.match(/from\s+(\w+)/);
    if (!fromMatch) return [{ count: 0 }];
    
    const tableName = fromMatch[1];
    const tableData = this.tables.get(tableName) || [];
    
    // WHERE句がある場合はフィルタリング
    let filteredData = tableData;
    if (sql.includes('where')) {
      filteredData = this.applyWhereFilter(tableData, sql);
    }
    
    return [{ count: filteredData.length }];
  }
  
  private handleJoinQuery(sql: string): any[] {
    // JOINクエリを分析
    const inventoryJoinMatch = sql.match(/from\s+player_inventory\s+pi\s+(?:inner\s+)?join\s+item_master\s+im\s+on\s+pi\.item_id\s*=\s*im\.item_id/);
    const pokemonJoinMatch = sql.match(/from\s+owned_pokemon\s+op\s+(?:inner\s+)?join\s+pokemon_master\s+pm\s+on\s+op\.species_id\s*=\s*pm\.species_id/);
    
    if (inventoryJoinMatch) {
      const inventoryData = this.tables.get('player_inventory') || [];
      const itemMasterData = this.tables.get('item_master') || [];
      
      // JOINを実行
      const joinedData = inventoryData.map((inventory: any) => {
        const itemMaster = itemMasterData.find((item: any) => item.item_id === inventory.item_id);
        if (itemMaster) {
          return { ...inventory, ...itemMaster };
        }
        return null;
      }).filter(Boolean);
      
      // WHERE句の適用
      if (sql.includes('where')) {
        return this.applyWhereFilter(joinedData, sql);
      }
      
      return joinedData;
    }

    if (pokemonJoinMatch) {
      const ownedPokemonData = this.tables.get('owned_pokemon') || [];
      const pokemonMasterData = this.tables.get('pokemon_master') || [];
      
      // JOINを実行（ポケモン詳細）
      const joinedData = ownedPokemonData.map((ownedPokemon: any) => {
        const pokemonMaster = pokemonMasterData.find((master: any) => master.species_id === ownedPokemon.species_id);
        if (pokemonMaster) {
          // SELECT句のカラムエイリアスに合わせてマッピング
          return {
            ...ownedPokemon,
            species_name: pokemonMaster.name,
            base_hp: pokemonMaster.hp,
            base_attack: pokemonMaster.attack,
            base_defense: pokemonMaster.defense,
            sprite_url: pokemonMaster.sprite_url,
            species_created_at: pokemonMaster.created_at
          };
        }
        return null;
      }).filter(Boolean);
      
      // WHERE句の適用
      if (sql.includes('where')) {
        return this.applyWhereFilter(joinedData, sql);
      }
      
      return joinedData;
    }
    
    return [];
  }
  
  private handleSimpleQuery(sql: string): any[] {
    const fromMatch = sql.match(/from\s+(\w+)/);
    if (!fromMatch) return [];
    
    const tableName = fromMatch[1];
    const tableData = this.tables.get(tableName) || [];
    
    // WHERE句がある場合はフィルタリング
    if (sql.includes('where')) {
      return this.applyWhereFilter(tableData, sql);
    }
    
    return [...tableData];
  }
  
  private applyWhereFilter(data: any[], sql: string): any[] {
    // 複数のWHERE条件を処理
    let filteredData = [...data];
    
    // item_id = ? 処理
    if (sql.includes('item_id = ?') && this.boundParams.length > 0) {
      const itemId = this.boundParams[0];
      filteredData = filteredData.filter((row: any) => row.item_id === itemId);
    }
    
    // player_id = ? 処理
    if (sql.includes('player_id = ?') && this.boundParams.length > 0) {
      const playerIdIndex = sql.includes('item_id = ?') ? 1 : 0;
      const playerId = this.boundParams[playerIdIndex];
      filteredData = filteredData.filter((row: any) => row.player_id === playerId);
    }
    
    // id = ? 処理（item_idなどを除外するため厳密マッチ）
    if (sql.includes(' id = ?') && this.boundParams.length > 0) {
      const id = this.boundParams[0];
      filteredData = filteredData.filter((row: any) => row.id === id);
    }
    
    // pokemon_id = ? 処理
    if (sql.includes('pokemon_id = ?') && this.boundParams.length > 0) {
      const pokemonId = this.boundParams[0];
      filteredData = filteredData.filter((row: any) => row.pokemon_id === pokemonId);
    }
    
    // category = ? 処理
    if (sql.includes('category = ?') && this.boundParams.length > 0) {
      const categoryIndex = this.getCategoryParamIndex(sql);
      const category = this.boundParams[categoryIndex];
      filteredData = filteredData.filter((row: any) => row.category === category);
    }

    // species_id = ? 処理
    if (sql.includes('species_id = ?') && this.boundParams.length > 0) {
      const speciesId = this.boundParams[0];
      filteredData = filteredData.filter((row: any) => row.species_id === speciesId);
    }
    
    return filteredData;
  }
  
  private getCategoryParamIndex(sql: string): number {
    // SQLの順序に応じてパラメータのインデックスを取得
    let index = 0;
    if (sql.includes('player_id = ?')) index++;
    if (sql.includes('item_id = ?')) index++;
    return index;
  }

  private executeInsert(): RunResult {
    const sql = this.sql.toLowerCase();
    const intoMatch = sql.match(/insert\s+into\s+(\w+)/);
    
    if (!intoMatch) {
      return { success: false, meta: { changes: 0 } };
    }
    
    const tableName = intoMatch[1];
    const tableData = this.tables.get(tableName) || [];
    
    // カラム名を抽出 (INSERT INTO table (col1, col2, ...) VALUES ...)
    const columnsMatch = sql.match(/insert\s+into\s+\w+\s*\(\s*([^)]+)\s*\)\s*values/);
    let columns: string[] = [];
    
    if (columnsMatch) {
      columns = columnsMatch[1].split(',').map(col => col.trim());
    } else {
      // カラム名が指定されていない場合はテーブル別のデフォルトを使用
      columns = this.getDefaultColumns(tableName);
    }
    
    // 新しい行を作成
    const newRow: any = {};
    columns.forEach((column, index) => {
      if (index < this.boundParams.length) {
        newRow[column] = this.boundParams[index];
      }
    });
    
    // 自動生成フィールドを設定
    if (tableName === 'player_inventory' && !newRow.acquired_at) {
      newRow.acquired_at = new Date().toISOString();
    }
    if (tableName === 'player_money' && !newRow.updated_at) {
      newRow.updated_at = new Date().toISOString();
    }
    if (tableName === 'owned_pokemon') {
      if (!newRow.caught_at) {
        newRow.caught_at = new Date().toISOString();
      }
      if (!newRow.updated_at) {
        newRow.updated_at = new Date().toISOString();
      }
    }
    
    tableData.push(newRow);
    this.tables.set(tableName, tableData);
    
    return {
      success: true,
      meta: {
        changes: 1,
        lastRowId: newRow.id || newRow.pokemon_id || Date.now()
      }
    };
  }
  
  private getDefaultColumns(tableName: string): string[] {
    switch (tableName) {
      case 'players':
        return ['id', 'name', 'position_x', 'position_y', 'direction', 'sprite'];
      case 'player_inventory':
        return ['player_id', 'item_id', 'quantity', 'acquired_at'];
      case 'player_money':
        return ['player_id', 'amount', 'updated_at'];
      case 'owned_pokemon':
        return ['pokemon_id', 'player_id', 'species_id', 'nickname', 'level', 'current_hp', 'caught_at', 'updated_at'];
      case 'player_party':
        return ['player_id', 'position', 'pokemon_id'];
      case 'item_master':
        return ['item_id', 'name', 'category', 'effect_type', 'effect_value', 'buy_price', 'sell_price', 'usable', 'max_stack', 'description', 'icon_url', 'created_at', 'updated_at'];
      default:
        return [];
    }
  }

  private executeUpdate(): RunResult {
    const sql = this.sql.toLowerCase();
    const tableMatch = sql.match(/update\s+(\w+)\s+set/);
    
    if (!tableMatch) {
      return { success: false, meta: { changes: 0 } };
    }
    
    const tableName = tableMatch[1];
    const tableData = this.tables.get(tableName) || [];
    let changes = 0;
    
    // WHERE句の処理
    const whereClause = this.extractWhereClause(sql);
    
    // SETの処理 - 複数のカラム更新をサポート
    if (sql.includes('set quantity = ?') && this.boundParams.length >= 1) {
      const newQuantity = this.boundParams[0];
      
      for (let i = 0; i < tableData.length; i++) {
        if (this.matchesWhereClause(tableData[i], whereClause)) {
          tableData[i].quantity = newQuantity;
          changes++;
        }
      }
    }
    
    // SET amount = ? (for player_money)
    if (sql.includes('set amount = ?') && this.boundParams.length >= 1) {
      const newAmount = this.boundParams[0];
      
      for (let i = 0; i < tableData.length; i++) {
        if (this.matchesWhereClause(tableData[i], whereClause)) {
          tableData[i].amount = newAmount;
          tableData[i].updated_at = new Date().toISOString();
          changes++;
        }
      }
    }

    // ポケモン情報更新 (nickname, current_hp)
    if (sql.includes('set nickname = ?, current_hp = ?') && this.boundParams.length >= 2) {
      const newNickname = this.boundParams[0];
      const newCurrentHp = this.boundParams[1];
      
      for (let i = 0; i < tableData.length; i++) {
        if (this.matchesWhereClause(tableData[i], whereClause)) {
          tableData[i].nickname = newNickname;
          tableData[i].current_hp = newCurrentHp;
          tableData[i].updated_at = new Date().toISOString();
          changes++;
        }
      }
    }
    
    this.tables.set(tableName, tableData);
    
    return {
      success: true,
      meta: { changes }
    };
  }

  private executeDelete(): RunResult {
    const sql = this.sql.toLowerCase();
    const fromMatch = sql.match(/delete\s+from\s+(\w+)/);
    
    if (!fromMatch) {
      return { success: false, meta: { changes: 0 } };
    }
    
    const tableName = fromMatch[1];
    let tableData = this.tables.get(tableName) || [];
    const originalLength = tableData.length;
    
    // WHERE句の処理
    const whereClause = this.extractWhereClause(sql);
    
    // 条件に合わない行のみ残す
    tableData = tableData.filter(row => !this.matchesWhereClause(row, whereClause));
    
    this.tables.set(tableName, tableData);
    
    return {
      success: true,
      meta: { changes: originalLength - tableData.length }
    };
  }
  
  private extractWhereClause(sql: string): { column: string; value: any } | null {
    // 簡易的なWHERE句解析
    if (sql.includes('where') && this.boundParams.length > 0) {
      if (sql.includes('item_id = ?')) {
        return { column: 'item_id', value: this.boundParams[this.boundParams.length - 1] };
      }
      if (sql.includes('player_id = ?')) {
        return { column: 'player_id', value: this.boundParams[this.boundParams.length - 1] };
      }
      if (sql.includes('id = ?')) {
        return { column: 'id', value: this.boundParams[this.boundParams.length - 1] };
      }
      if (sql.includes('pokemon_id = ?')) {
        return { column: 'pokemon_id', value: this.boundParams[this.boundParams.length - 1] };
      }
    }
    return null;
  }
  
  private matchesWhereClause(row: any, whereClause: { column: string; value: any } | null): boolean {
    if (!whereClause) return true;
    return row[whereClause.column] === whereClause.value;
  }
}