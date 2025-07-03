// 初学者向け：データベースマイグレーション管理システム
// SQLファイルを順次実行してデータベーススキーマを構築・更新

import { DatabaseAdapter } from '../types/database';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * データベーススキーマのマイグレーション管理クラス
 * バージョン管理されたSQLファイルを順次実行
 */
export class Migrator {
  private migrationsPath: string;

  /**
   * マイグレーターのコンストラクタ
   * @param db データベースアダプター
   * @param migrationsPath マイグレーションファイルのパス（デフォルト: migrations）
   */
  constructor(
    private db: DatabaseAdapter,
    migrationsPath?: string
  ) {
    // マイグレーションファイルのパスを設定
    this.migrationsPath = migrationsPath || join(__dirname, '../../migrations');
    console.log(`📁 マイグレーションパス: ${this.migrationsPath}`);
  }

  /**
   * 全マイグレーションを実行
   * 未実行のマイグレーションを順次実行する
   */
  async runMigrations(): Promise<void> {
    try {
      console.log('🔄 マイグレーション開始...');
      
      // マイグレーション管理テーブルを作成
      await this.createMigrationTable();

      // 実行済みマイグレーションを取得
      const executedMigrations = await this.getExecutedMigrations();
      console.log(`📋 実行済みマイグレーション: ${executedMigrations.length}件`);

      // マイグレーションファイルを取得してソート
      const migrationFiles = this.getMigrationFiles();
      console.log(`📄 利用可能マイグレーション: ${migrationFiles.length}件`);
      
      // MockAdapterの場合はマイグレーションをスキップ（すでにスキーマが設定済み）
      if (migrationFiles.length === 0) {
        console.log('ℹ️ モック環境ではマイグレーションファイルを使用しません');
        return;
      }

      // 未実行マイグレーションを実行
      let executedCount = 0;
      for (const file of migrationFiles) {
        if (!executedMigrations.includes(file)) {
          console.log(`🔄 マイグレーション実行中: ${file}`);
          await this.runMigrationFile(file);
          await this.recordMigration(file);
          console.log(`✅ マイグレーション完了: ${file}`);
          executedCount++;
        } else {
          console.log(`⏭️ スキップ（実行済み）: ${file}`);
        }
      }

      if (executedCount > 0) {
        console.log(`🎉 マイグレーション完了: ${executedCount}件の新しいマイグレーションを実行しました`);
      } else {
        console.log('✨ 全てのマイグレーションは最新です');
      }
    } catch (error) {
      console.error('❌ マイグレーション実行エラー:', error);
      throw new Error(`マイグレーション実行に失敗しました: ${error}`);
    }
  }

  /**
   * 特定のマイグレーションファイルを実行
   * @param filename マイグレーションファイル名
   */
  async runMigrationFile(filename: string): Promise<void> {
    try {
      const filePath = join(this.migrationsPath, filename);
      
      if (!existsSync(filePath)) {
        throw new Error(`マイグレーションファイルが見つかりません: ${filePath}`);
      }

      const sql = readFileSync(filePath, 'utf-8');
      
      if (!sql.trim()) {
        console.warn(`⚠️ 空のマイグレーションファイル: ${filename}`);
        return;
      }

      // SQLファイルを実行（複数文対応）
      await this.db.exec(sql);
      console.log(`⚡ SQL実行完了: ${filename}`);
    } catch (error) {
      console.error(`❌ マイグレーションファイル実行エラー ${filename}:`, error);
      throw new Error(`マイグレーションファイル実行に失敗: ${filename} - ${error}`);
    }
  }

  /**
   * マイグレーション管理テーブルを作成
   * 実行済みマイグレーションを記録するためのテーブル
   */
  private async createMigrationTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS _migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT UNIQUE NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        checksum TEXT
      )
    `;
    
    try {
      await this.db.exec(sql);
      console.log('📋 マイグレーション管理テーブル準備完了');
    } catch (error) {
      console.error('❌ マイグレーション管理テーブル作成エラー:', error);
      throw new Error(`マイグレーション管理テーブル作成に失敗: ${error}`);
    }
  }

  /**
   * 実行済みマイグレーション一覧を取得
   * @returns 実行済みマイグレーションファイル名の配列
   */
  private async getExecutedMigrations(): Promise<string[]> {
    try {
      const stmt = this.db.prepare('SELECT filename FROM _migrations ORDER BY executed_at');
      const result = await stmt.all<{ filename: string }>();
      return result.results.map(row => row.filename);
    } catch (error) {
      // テーブルが存在しない場合は空配列を返す
      console.log('ℹ️ マイグレーション履歴がありません（初回実行）');
      return [];
    }
  }

  /**
   * マイグレーションファイル一覧を取得
   * @returns ソート済みマイグレーションファイル名の配列
   */
  private getMigrationFiles(): string[] {
    try {
      if (!existsSync(this.migrationsPath)) {
        console.warn(`⚠️ マイグレーションディレクトリが存在しません: ${this.migrationsPath}`);
        return [];
      }

      const files = readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort(); // ファイル名順（0001_, 0002_, ...）

      console.log(`📄 発見されたマイグレーションファイル: ${files.join(', ')}`);
      return files;
    } catch (error) {
      console.error('❌ マイグレーションファイル読み込みエラー:', error);
      throw new Error(`マイグレーションファイル読み込みに失敗: ${error}`);
    }
  }

  /**
   * マイグレーション実行を記録
   * @param filename 実行したマイグレーションファイル名
   */
  private async recordMigration(filename: string): Promise<void> {
    try {
      // チェックサムを生成（将来的なファイル変更検出用）
      const filePath = join(this.migrationsPath, filename);
      const fileContent = readFileSync(filePath, 'utf-8');
      const checksum = this.calculateChecksum(fileContent);

      const stmt = this.db.prepare(`
        INSERT INTO _migrations (filename, checksum) 
        VALUES (?, ?)
      `);
      
      await stmt.bind(filename, checksum).run();
      console.log(`📝 マイグレーション記録完了: ${filename}`);
    } catch (error) {
      console.error(`❌ マイグレーション記録エラー ${filename}:`, error);
      throw new Error(`マイグレーション記録に失敗: ${filename} - ${error}`);
    }
  }

  /**
   * ファイル内容のチェックサム計算
   * @param content ファイル内容
   * @returns チェックサム文字列
   */
  private calculateChecksum(content: string): string {
    // 簡易的なハッシュ計算（本格的にはcryptoモジュールを使用）
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit整数に変換
    }
    return hash.toString(16);
  }

  /**
   * マイグレーション状態を表示
   * 開発時のデバッグ用
   */
  async showMigrationStatus(): Promise<void> {
    try {
      const executed = await this.getExecutedMigrations();
      const available = this.getMigrationFiles();
      const pending = available.filter(file => !executed.includes(file));

      console.log('\n📊 マイグレーション状態:');
      console.log(`✅ 実行済み: ${executed.length}件`);
      console.log(`⏳ 未実行: ${pending.length}件`);
      
      if (pending.length > 0) {
        console.log('📋 未実行マイグレーション:');
        pending.forEach(file => console.log(`  - ${file}`));
      }
    } catch (error) {
      console.error('❌ マイグレーション状態表示エラー:', error);
    }
  }
}