// 初学者向け：ポケモンAPI連携サービス
// バックエンドのポケモン管理APIと通信するためのサービスレイヤー

import { API_ENDPOINTS } from '../config/api';
import type { 
  ポケモンマスタ, 
  所有ポケモン,
  フラット所有ポケモン,
  パーティポケモン,
  ポケモン捕獲リクエスト,
  パーティ編成リクエスト,
  ポケモン更新リクエスト,
  ポケモン検索フィルター
} from '@pokemon-like-game-tutorial/shared';

// API レスポンスの基本形式
// 初学者向け：すべてのAPI呼び出しで共通の構造
interface APIレスポンス<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
  filters?: Record<string, unknown>;
}

/**
 * ポケモンAPIサービスクラス
 * 初学者向け：バックエンドAPIとの通信を担当するクラス
 */
export class ポケモンAPIサービス {
  private readonly ベースURL: string;

  constructor(ベースURL?: string) {
    this.ベースURL = ベースURL || API_ENDPOINTS.POKEMON.SPECIES.replace('/species', '');
  }

  /**
   * 全ポケモン種族データを取得
   * 初学者向け：図鑑で使用する全種族の基本情報を取得
   */
  async 全種族データ取得(): Promise<ポケモンマスタ[]> {
    try {
      const レスポンス = await fetch(API_ENDPOINTS.POKEMON.SPECIES);
      
      if (!レスポンス.ok) {
        throw new Error(`API呼び出しエラー: ${レスポンス.status}`);
      }

      const データ: APIレスポンス<ポケモンマスタ[]> = await レスポンス.json();
      
      if (!データ.success || !データ.data) {
        throw new Error(データ.error || 'データの取得に失敗しました');
      }

      return データ.data;
    } catch (エラー) {
      console.error('種族データ取得エラー:', エラー);
      throw new Error('ポケモン種族データの取得に失敗しました');
    }
  }

  /**
   * ポケモンを捕獲する
   * 初学者向け：新しいポケモンを捕まえてプレイヤーの所有ポケモンに追加
   */
  async ポケモン捕獲(プレイヤーID: string, 捕獲リクエスト: ポケモン捕獲リクエスト): Promise<所有ポケモン> {
    try {
      const レスポンス = await fetch(`${this.ベースURL}/catch/${プレイヤーID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(捕獲リクエスト),
      });

      if (!レスポンス.ok) {
        throw new Error(`捕獲API呼び出しエラー: ${レスポンス.status}`);
      }

      const データ: APIレスポンス<所有ポケモン> = await レスポンス.json();
      
      if (!データ.success || !データ.data) {
        throw new Error(データ.error || 'ポケモンの捕獲に失敗しました');
      }

      return データ.data;
    } catch (エラー) {
      console.error('ポケモン捕獲エラー:', エラー);
      throw new Error('ポケモンの捕獲に失敗しました');
    }
  }

  /**
   * プレイヤーの所有ポケモン一覧を取得
   * 初学者向け：そのプレイヤーが持っているすべてのポケモンを取得
   */
  async 所有ポケモン一覧取得(
    プレイヤーID: string, 
    フィルター?: ポケモン検索フィルター
  ): Promise<{ ポケモンリスト: フラット所有ポケモン[]; 総数: number; フィルター情報: Record<string, unknown> }> {
    try {
      // URLパラメータを構築
      const クエリパラメータ = new URLSearchParams();
      
      if (フィルター?.species_name) {
        クエリパラメータ.append('species_name', フィルター.species_name);
      }
      if (フィルター?.level_min) {
        クエリパラメータ.append('level_min', フィルター.level_min.toString());
      }
      if (フィルター?.level_max) {
        クエリパラメータ.append('level_max', フィルター.level_max.toString());
      }
      if (フィルター?.page) {
        クエリパラメータ.append('page', フィルター.page.toString());
      }
      if (フィルター?.limit) {
        クエリパラメータ.append('limit', フィルター.limit.toString());
      }

      const URL = `${this.ベースURL}/owned/${プレイヤーID}?${クエリパラメータ.toString()}`;
      const レスポンス = await fetch(URL);
      
      if (!レスポンス.ok) {
        throw new Error(`所有ポケモン取得API呼び出しエラー: ${レスポンス.status}`);
      }

      const データ: APIレスポンス<フラット所有ポケモン[]> = await レスポンス.json();
      
      if (!データ.success || !データ.data) {
        throw new Error(データ.error || '所有ポケモンデータの取得に失敗しました');
      }

      return {
        ポケモンリスト: データ.data,
        総数: データ.count || 0,
        フィルター情報: データ.filters || {}
      };
    } catch (エラー) {
      console.error('所有ポケモン取得エラー:', エラー);
      throw new Error('所有ポケモンデータの取得に失敗しました');
    }
  }

  /**
   * プレイヤーのパーティを取得
   * 初学者向け：手持ちポケモン（最大6体）の編成を取得
   */
  async パーティ取得(プレイヤーID: string): Promise<パーティポケモン[]> {
    try {
      const レスポンス = await fetch(`${this.ベースURL}/party/${プレイヤーID}`);
      
      if (!レスポンス.ok) {
        throw new Error(`パーティ取得API呼び出しエラー: ${レスポンス.status}`);
      }

      const データ: APIレスポンス<パーティポケモン[]> = await レスポンス.json();
      
      if (!データ.success || !データ.data) {
        throw new Error(データ.error || 'パーティデータの取得に失敗しました');
      }

      return データ.data;
    } catch (エラー) {
      console.error('パーティ取得エラー:', エラー);
      throw new Error('パーティデータの取得に失敗しました');
    }
  }

  /**
   * パーティ編成を更新
   * 初学者向け：パーティにポケモンを追加・削除・並び替え
   */
  async パーティ編成更新(
    プレイヤーID: string, 
    編成リクエスト: パーティ編成リクエスト
  ): Promise<パーティポケモン[]> {
    try {
      const レスポンス = await fetch(`${this.ベースURL}/party/${プレイヤーID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(編成リクエスト),
      });

      if (!レスポンス.ok) {
        throw new Error(`パーティ編成API呼び出しエラー: ${レスポンス.status}`);
      }

      const データ: APIレスポンス<パーティポケモン[]> = await レスポンス.json();
      
      if (!データ.success || !データ.data) {
        throw new Error(データ.error || 'パーティ編成の更新に失敗しました');
      }

      return データ.data;
    } catch (エラー) {
      console.error('パーティ編成エラー:', エラー);
      throw new Error('パーティ編成の更新に失敗しました');
    }
  }

  /**
   * ポケモンの情報を更新
   * 初学者向け：ニックネームや現在HPなどを変更
   */
  async ポケモン情報更新(
    ポケモンID: string, 
    更新リクエスト: ポケモン更新リクエスト
  ): Promise<void> {
    try {
      const レスポンス = await fetch(`${this.ベースURL}/update/${ポケモンID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(更新リクエスト),
      });

      if (!レスポンス.ok) {
        throw new Error(`ポケモン更新API呼び出しエラー: ${レスポンス.status}`);
      }

      const データ: APIレスポンス<unknown> = await レスポンス.json();
      
      if (!データ.success) {
        throw new Error(データ.error || 'ポケモン情報の更新に失敗しました');
      }
    } catch (エラー) {
      console.error('ポケモン情報更新エラー:', エラー);
      throw new Error('ポケモン情報の更新に失敗しました');
    }
  }
}

// デフォルトのAPIサービスインスタンス
// 初学者向け：アプリケーション全体で使用するシングルトンインスタンス
export const デフォルトポケモンAPIサービス = new ポケモンAPIサービス();