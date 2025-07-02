// 初学者向け：バトル状態管理コンテキスト
// React Context APIを使用してバトルの状態を管理

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { API_ENDPOINTS } from '../config/api';
import type {
  バトル状態,
  バトル開始リクエスト,
  技使用リクエスト,
  技使用結果
} from '@pokemon-like-game-tutorial/shared';

/**
 * バトルコンテキストの型定義
 * 初学者向け：バトル画面で使用できる状態とアクション
 */
interface バトルコンテキスト型 {
  // 状態
  現在バトル: バトル状態 | null;
  読み込み中: boolean;
  エラーメッセージ: string;
  
  // UI状態
  選択中技: number | null;
  アニメーション中: boolean;
  メッセージ表示中: boolean;
  
  // アクション
  バトル開始: (request: バトル開始リクエスト) => Promise<void>;
  技使用: (moveId: number) => Promise<void>;
  バトル終了: (reason?: string) => Promise<void>;
  技選択: (moveId: number | null) => void;
  エラークリア: () => void;
}

/**
 * バトル状態の操作種別
 * 初学者向け：状態更新の種類を定義
 */
type バトルアクション =
  | { type: 'BATTLE_START_REQUEST' }
  | { type: 'BATTLE_START_SUCCESS'; payload: バトル状態 }
  | { type: 'BATTLE_START_ERROR'; payload: string }
  | { type: 'MOVE_USE_REQUEST' }
  | { type: 'MOVE_USE_SUCCESS'; payload: 技使用結果 }
  | { type: 'MOVE_USE_ERROR'; payload: string }
  | { type: 'BATTLE_END_SUCCESS' }
  | { type: 'SELECT_MOVE'; payload: number | null }
  | { type: 'SET_ANIMATION'; payload: boolean }
  | { type: 'SET_MESSAGE_DISPLAY'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

/**
 * バトルコンテキストの内部状態
 * 初学者向け：実際に管理する状態データ
 */
interface バトルコンテキスト状態 {
  現在バトル: バトル状態 | null;
  読み込み中: boolean;
  エラーメッセージ: string;
  選択中技: number | null;
  アニメーション中: boolean;
  メッセージ表示中: boolean;
}

/**
 * 初期状態
 * 初学者向け：アプリ起動時の状態
 */
const 初期状態: バトルコンテキスト状態 = {
  現在バトル: null,
  読み込み中: false,
  エラーメッセージ: '',
  選択中技: null,
  アニメーション中: false,
  メッセージ表示中: false
};

/**
 * バトル状態リデューサー
 * 初学者向け：状態の変更を管理する関数
 */
function バトル状態リデューサー(
  state: バトルコンテキスト状態,
  action: バトルアクション
): バトルコンテキスト状態 {
  switch (action.type) {
    case 'BATTLE_START_REQUEST':
      return {
        ...state,
        読み込み中: true,
        エラーメッセージ: '',
        現在バトル: null
      };

    case 'BATTLE_START_SUCCESS':
      return {
        ...state,
        読み込み中: false,
        現在バトル: action.payload,
        エラーメッセージ: ''
      };

    case 'BATTLE_START_ERROR':
      return {
        ...state,
        読み込み中: false,
        エラーメッセージ: action.payload,
        現在バトル: null
      };

    case 'MOVE_USE_REQUEST':
      return {
        ...state,
        読み込み中: true,
        エラーメッセージ: '',
        アニメーション中: true
      };

    case 'MOVE_USE_SUCCESS': {
      // 技使用結果をバトル状態に反映
      if (!state.現在バトル) return state;

      const updatedBattle = { ...state.現在バトル };
      
      // HPを更新
      if (action.payload.attacker_hp !== undefined) {
        updatedBattle.player_pokemon = {
          ...updatedBattle.player_pokemon,
          current_hp: action.payload.attacker_hp
        };
      }
      if (action.payload.target_hp !== undefined) {
        updatedBattle.enemy_pokemon = {
          ...updatedBattle.enemy_pokemon,
          current_hp: action.payload.target_hp
        };
      }

      // バトル状態を更新
      if (action.payload.battle_status === '終了') {
        updatedBattle.session = {
          ...updatedBattle.session,
          status: '終了',
          winner: action.payload.winner
        };
      }

      return {
        ...state,
        読み込み中: false,
        現在バトル: updatedBattle,
        選択中技: null,
        メッセージ表示中: true
      };
    }

    case 'MOVE_USE_ERROR':
      return {
        ...state,
        読み込み中: false,
        エラーメッセージ: action.payload,
        アニメーション中: false,
        選択中技: null
      };

    case 'BATTLE_END_SUCCESS':
      return {
        ...state,
        現在バトル: null,
        読み込み中: false,
        選択中技: null,
        アニメーション中: false,
        メッセージ表示中: false
      };

    case 'SELECT_MOVE':
      return {
        ...state,
        選択中技: action.payload
      };

    case 'SET_ANIMATION':
      return {
        ...state,
        アニメーション中: action.payload
      };

    case 'SET_MESSAGE_DISPLAY':
      return {
        ...state,
        メッセージ表示中: action.payload
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        エラーメッセージ: ''
      };

    default:
      return state;
  }
}

// コンテキスト作成
const BattleContext = createContext<バトルコンテキスト型 | null>(null);

/**
 * バトルコンテキストプロバイダー
 * 初学者向け：バトル状態を子コンポーネントに提供
 */
export function BattleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(バトル状態リデューサー, 初期状態);

  /**
   * バトル開始関数
   * 初学者向け：新しいバトルを開始する
   */
  const バトル開始 = async (request: バトル開始リクエスト): Promise<void> => {
    dispatch({ type: 'BATTLE_START_REQUEST' });

    try {
      const response = await fetch(API_ENDPOINTS.BATTLE.START, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'バトルの開始に失敗しました');
      }

      dispatch({ type: 'BATTLE_START_SUCCESS', payload: result.battle });
    } catch (error) {
      console.error('バトル開始エラー:', error);
      dispatch({
        type: 'BATTLE_START_ERROR',
        payload: error instanceof Error ? error.message : 'バトルの開始に失敗しました'
      });
    }
  };

  /**
   * 技使用関数
   * 初学者向け：選択した技を使用する
   */
  const 技使用 = async (moveId: number): Promise<void> => {
    if (!state.現在バトル) {
      dispatch({ type: 'MOVE_USE_ERROR', payload: 'バトルが開始されていません' });
      return;
    }

    dispatch({ type: 'MOVE_USE_REQUEST' });

    try {
      const request: 技使用リクエスト = {
        battle_id: state.現在バトル.session.battle_id,
        pokemon_id: state.現在バトル.player_pokemon.pokemon_id,
        move_id: moveId,
        target: '敵'
      };

      const response = await fetch(
        API_ENDPOINTS.BATTLE.MOVE,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      const result: 技使用結果 = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || '技の使用に失敗しました');
      }

      dispatch({ type: 'MOVE_USE_SUCCESS', payload: result });

      // アニメーション終了後にメッセージを非表示
      setTimeout(() => {
        dispatch({ type: 'SET_ANIMATION', payload: false });
        dispatch({ type: 'SET_MESSAGE_DISPLAY', payload: false });
      }, 2000);

    } catch (error) {
      console.error('技使用エラー:', error);
      dispatch({
        type: 'MOVE_USE_ERROR',
        payload: error instanceof Error ? error.message : '技の使用に失敗しました'
      });
    }
  };

  /**
   * バトル終了関数
   * 初学者向け：バトルを強制終了する
   */
  const バトル終了 = async (reason?: string): Promise<void> => {
    if (!state.現在バトル) return;

    try {
      const response = await fetch(
        API_ENDPOINTS.BATTLE.END,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (response.ok) {
        dispatch({ type: 'BATTLE_END_SUCCESS' });
      }
    } catch (error) {
      console.error('バトル終了エラー:', error);
    }
  };

  /**
   * 技選択関数
   * 初学者向け：技を選択状態にする
   */
  const 技選択 = (moveId: number | null): void => {
    dispatch({ type: 'SELECT_MOVE', payload: moveId });
  };

  /**
   * エラークリア関数
   * 初学者向け：エラーメッセージを消去する
   */
  const エラークリア = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // コンテキスト値
  const contextValue: バトルコンテキスト型 = {
    // 状態
    現在バトル: state.現在バトル,
    読み込み中: state.読み込み中,
    エラーメッセージ: state.エラーメッセージ,
    
    // UI状態
    選択中技: state.選択中技,
    アニメーション中: state.アニメーション中,
    メッセージ表示中: state.メッセージ表示中,
    
    // アクション
    バトル開始,
    技使用,
    バトル終了,
    技選択,
    エラークリア
  };

  return (
    <BattleContext.Provider value={contextValue}>
      {children}
    </BattleContext.Provider>
  );
}

/**
 * バトルコンテキストフック
 * 初学者向け：コンポーネントでバトル状態を使用するためのフック
 */
export function useBattle(): バトルコンテキスト型 {
  const context = useContext(BattleContext);
  if (!context) {
    throw new Error('useBattle は BattleProvider 内で使用してください');
  }
  return context;
}