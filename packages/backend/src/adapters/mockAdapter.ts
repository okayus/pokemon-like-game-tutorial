// 初学者向け：改良されたモックデータベースアダプター
// better-sqlite3の代替として、より正確なSQLite/D1の動作を模擬

import { DatabaseAdapter, PreparedStatement, RunResult, BatchResult, ExecResult } from '../types/database';

/**
 * より正確なSQLite動作を模擬するモックアダプター
 * 実際のSQLクエリを解析してデータ操作を行う
 */
export class MockAdapter implements DatabaseAdapter {
  private data: Map<string, Record<string, unknown>[]> = new Map();
  private schema: Map<string, string[]> = new Map();
  private autoIncrementCounters: Map<string, number> = new Map();

  constructor() {
    this.setupInitialSchema();
    this.setupInitialData();
  }

  prepare(sql: string): PreparedStatement {
    return new MockPreparedStatement(sql, this.data, this.schema, this.autoIncrementCounters);
  }

  async batch(statements: any[]): Promise<BatchResult> {
    const results: RunResult[] = [];
    
    for (const stmt of statements) {
      try {
        const result = await stmt.run();
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          meta: { changes: 0 },
        });
        throw error;
      }
    }
    
    return { results };
  }

  async exec(sql: string): Promise<ExecResult> {
    const start = Date.now();
    const statements = sql.split(';').filter(s => s.trim());
    let totalChanges = 0;
    
    for (const statement of statements) {
      if (statement.trim()) {
        const stmt = this.prepare(statement);
        const result = await stmt.run();
        totalChanges += result.meta.changes;
      }
    }
    
    return {
      count: totalChanges,
      duration: Date.now() - start,
    };
  }

  async first<T>(sql: string): Promise<T | null> {
    const stmt = this.prepare(sql);
    return await stmt.first<T>();
  }

  close?(): void {
    this.data.clear();
    this.schema.clear();
    this.autoIncrementCounters.clear();
  }

  private setupInitialSchema(): void {
    // 既存のテーブルスキーマを定義
    this.schema.set('players', ['id', 'name', 'position_x', 'position_y', 'direction', 'sprite']);
    this.schema.set('item_master', ['item_id', 'name', 'category', 'effect_type', 'effect_value', 'buy_price', 'sell_price', 'usable', 'max_stack', 'description', 'icon_url', 'created_at', 'updated_at']);
    this.schema.set('player_inventory', ['id', 'player_id', 'item_id', 'quantity', 'acquired_at']);
    this.schema.set('player_money', ['player_id', 'amount', 'updated_at']);
    this.schema.set('owned_pokemon', ['id', 'player_id', 'species_id', 'nickname', 'level', 'experience', 'hp', 'max_hp', 'attack', 'defense', 'speed', 'caught_at', 'location']);
    this.schema.set('player_party', ['player_id', 'position', 'pokemon_id']);
    this.schema.set('battle_sessions', ['id', 'player_id', 'enemy_pokemon_id', 'enemy_species_id', 'enemy_level', 'enemy_hp', 'enemy_max_hp', 'status', 'created_at', 'updated_at']);
    this.schema.set('pokemon_species', ['id', 'name', 'hp', 'attack', 'defense', 'speed', 'type1', 'type2', 'sprite']);
    this.schema.set('_migrations', ['id', 'filename', 'executed_at', 'checksum']);
    
    // AUTO_INCREMENT カウンターを初期化
    this.autoIncrementCounters.set('player_inventory', 1);
    this.autoIncrementCounters.set('owned_pokemon', 1);
    this.autoIncrementCounters.set('battle_sessions', 1);
    this.autoIncrementCounters.set('_migrations', 1);
  }

  private setupInitialData(): void {
    // アイテムマスターデータ
    this.data.set('item_master', [
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
      }
    ]);

    // ポケモン種族データ
    this.data.set('pokemon_species', [
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
        id: 1,
        name: 'フシギダネ',
        hp: 45,
        attack: 49,
        defense: 49,
        speed: 45,
        type1: 'くさ',
        type2: 'どく',
        sprite: 'bulbasaur.png'
      }
    ]);

    // 他のテーブルは空で初期化
    this.data.set('players', []);
    this.data.set('player_inventory', []);
    this.data.set('player_money', []);
    this.data.set('owned_pokemon', []);
    this.data.set('player_party', []);
    this.data.set('battle_sessions', []);
    this.data.set('_migrations', []);
  }
}

/**
 * モック用プリペアドステートメント
 * 基本的なSQLクエリを解析して適切な結果を返す
 */
class MockPreparedStatement implements PreparedStatement {
  private boundParams: unknown[] = [];

  constructor(
    private sql: string,
    private data: Map<string, Record<string, unknown>[]>,
    private schema: Map<string, string[]>,
    private autoIncrementCounters: Map<string, number>
  ) {}

  bind(...params: unknown[]): PreparedStatement {
    this.boundParams = params;
    return this;
  }

  async first<T = unknown>(): Promise<T | null> {
    const results = await this.executeQuery();
    return (results[0] as T) || null;
  }

  async all<T = unknown>(): Promise<{ results: T[] }> {
    const results = await this.executeQuery();
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

  private async executeQuery(): Promise<Record<string, unknown>[]> {
    const sql = this.sql.toLowerCase().trim();
    
    if (sql.startsWith('select')) {
      return this.executeSelect();
    }
    
    return [];
  }

  private executeSelect(): Record<string, unknown>[] {
    // 簡単なSELECT文の解析
    const sql = this.sql.toLowerCase();
    
    // 定数クエリの処理（SELECT 1 as test など）
    const constantMatch = sql.match(/select\s+(.+?)(?:\s+from|\s*$)/);
    if (constantMatch && !sql.includes('from')) {
      const selectPart = constantMatch[1];
      
      // SELECT 1 as test のような定数クエリ
      const literalMatch = selectPart.match(/(\d+)\s+as\s+(\w+)/);
      if (literalMatch) {
        const value = parseInt(literalMatch[1]);
        const alias = literalMatch[2];
        return [{ [alias]: value }];
      }
      
      // 単純な数値（SELECT 1）
      const numberMatch = selectPart.match(/^\s*(\d+)\s*$/);
      if (numberMatch) {
        const value = parseInt(numberMatch[1]);
        return [{ [numberMatch[1]]: value }];
      }
    }
    
    // テーブル名を抽出
    const fromMatch = sql.match(/from\s+(\w+)/);
    if (!fromMatch) return [];
    
    const tableName = fromMatch[1];
    const tableData = this.data.get(tableName) || [];
    
    // WHERE句の処理
    const whereMatch = sql.match(/where\s+(.+?)(?:\s+order|\s+limit|\s+group|$)/);
    if (whereMatch) {
      const whereClause = whereMatch[1];
      return this.applyWhereClause(tableData, whereClause);
    }
    
    return [...tableData];
  }

  private applyWhereClause(data: Record<string, unknown>[], whereClause: string): Record<string, unknown>[] {
    // 簡単なWHERE句の処理（= 条件のみ）
    const eqMatch = whereClause.match(/(\w+)\s*=\s*\?/);
    if (eqMatch && this.boundParams.length > 0) {
      const column = eqMatch[1];
      const value = this.boundParams[0];
      const filtered = data.filter(row => row[column] === value);
      return filtered;
    }
    
    // パラメータなしの直接値比較（例: WHERE id = 999）
    const directMatch = whereClause.match(/(\w+)\s*=\s*(\d+)/);
    if (directMatch) {
      const column = directMatch[1];
      const value = parseInt(directMatch[2]);
      return data.filter(row => row[column] === value);
    }
    
    return data;
  }

  private executeInsert(): RunResult {
    const sql = this.sql.toLowerCase();
    const intoMatch = sql.match(/insert\s+into\s+(\w+)/);
    if (!intoMatch) {
      throw new Error('Invalid INSERT statement');
    }
    
    const tableName = intoMatch[1];
    const tableData = this.data.get(tableName) || [];
    const columns = this.schema.get(tableName) || [];
    
    // VALUES句から値を取得
    const valuesMatch = sql.match(/values\s*\(([^)]+)\)/);
    if (valuesMatch) {
      const newRow: Record<string, unknown> = {};
      
      // パラメータを列にマッピング
      const paramCount = (valuesMatch[1].match(/\?/g) || []).length;
      for (let i = 0; i < Math.min(paramCount, this.boundParams.length); i++) {
        if (columns[i]) {
          newRow[columns[i]] = this.boundParams[i];
        }
      }
      
      // AUTO_INCREMENTのID処理
      if (columns[0] === 'id' && !newRow.id) {
        const counter = this.autoIncrementCounters.get(tableName) || 1;
        newRow.id = counter;
        this.autoIncrementCounters.set(tableName, counter + 1);
      }
      
      tableData.push(newRow);
      this.data.set(tableName, tableData);
      
      return {
        success: true,
        meta: {
          changes: 1,
          lastRowId: newRow.id as number || 0
        }
      };
    }
    
    throw new Error('Failed to parse INSERT statement');
  }

  private executeUpdate(): RunResult {
    const sql = this.sql.toLowerCase();
    const updateMatch = sql.match(/update\s+(\w+)/);
    if (!updateMatch) {
      throw new Error('Invalid UPDATE statement');
    }
    
    // 簡単な更新処理（実装は必要に応じて拡張）
    // TODO: 将来的にはupdateMatch[1]でテーブル名を取得してUPDATE処理を実装
    return {
      success: true,
      meta: { changes: 1 }
    };
  }

  private executeDelete(): RunResult {
    const sql = this.sql.toLowerCase();
    const deleteMatch = sql.match(/delete\s+from\s+(\w+)/);
    if (!deleteMatch) {
      throw new Error('Invalid DELETE statement');
    }
    
    const tableName = deleteMatch[1];
    const tableData = this.data.get(tableName) || [];
    
    // WHERE句がない場合は全削除
    const whereMatch = sql.match(/where\s+(.+)/);
    if (!whereMatch) {
      const deletedCount = tableData.length;
      this.data.set(tableName, []);
      return {
        success: true,
        meta: { changes: deletedCount }
      };
    }
    
    // WHERE句がある場合の削除（簡単な実装）
    const filteredData = this.applyWhereClause(tableData, whereMatch[1]);
    const deletedCount = tableData.length - filteredData.length;
    this.data.set(tableName, filteredData);
    
    return {
      success: true,
      meta: { changes: deletedCount }
    };
  }
}